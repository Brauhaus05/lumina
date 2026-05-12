// Deno Edge Function — Rate Limiter
// 100 requests per 60 seconds per api_key using Deno KV sliding window.
// Falls back to an in-memory Map when Deno KV is unavailable (local dev).

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

interface WindowEntry { count: number; windowStart: number }

// In-memory fallback used when Deno.openKv is not available (local dev only)
const memStore = new Map<string, WindowEntry>();

async function getEntry(key: string): Promise<WindowEntry | null> {
  if (typeof Deno.openKv === 'function') {
    const kv = await Deno.openKv();
    const result = await kv.get<WindowEntry>(['rate_limit', key]);
    return result.value ?? null;
  }
  return memStore.get(key) ?? null;
}

async function setEntry(key: string, entry: WindowEntry): Promise<void> {
  if (typeof Deno.openKv === 'function') {
    const kv = await Deno.openKv();
    await kv.set(['rate_limit', key], entry, { expireIn: WINDOW_MS });
    return;
  }
  memStore.set(key, entry);
  // Auto-expire from memory store
  setTimeout(() => memStore.delete(key), WINDOW_MS);
}

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  const apiKey = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!apiKey) {
    return new Response('Unauthorized', { status: 401 });
  }

  const now = Date.now();
  const current = await getEntry(apiKey);

  // Reset window if expired
  if (!current || now - current.windowStart > WINDOW_MS) {
    await setEntry(apiKey, { count: 1, windowStart: now });
    return new Response('OK', {
      status: 200,
      headers: {
        'X-RateLimit-Limit': String(MAX_REQUESTS),
        'X-RateLimit-Remaining': String(MAX_REQUESTS - 1),
      },
    });
  }

  // Within window — check limit
  if (current.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((current.windowStart + WINDOW_MS - now) / 1000);
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'Content-Type': 'text/plain',
        'X-RateLimit-Limit': String(MAX_REQUESTS),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(current.windowStart + WINDOW_MS),
      },
    });
  }

  await setEntry(apiKey, { count: current.count + 1, windowStart: current.windowStart });

  return new Response('OK', {
    status: 200,
    headers: {
      'X-RateLimit-Limit': String(MAX_REQUESTS),
      'X-RateLimit-Remaining': String(MAX_REQUESTS - current.count - 1),
    },
  });
});
