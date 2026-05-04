// Deno Edge Function — Rate Limiter
// 100 requests per 60 seconds per api_key using Deno KV sliding window

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  const apiKey = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!apiKey) {
    return new Response('Unauthorized', { status: 401 });
  }

  const kv = await Deno.openKv();
  const key = ['rate_limit', apiKey] as const;
  const now = Date.now();

  const entry = await kv.get<{ count: number; windowStart: number }>(key);
  const current = entry.value;

  // Reset window if it has expired
  if (!current || now - current.windowStart > WINDOW_MS) {
    const result = await kv
      .atomic()
      .check(entry)
      .set(key, { count: 1, windowStart: now }, { expireIn: WINDOW_MS })
      .commit();

    if (!result.ok) {
      // Concurrent write — retry once by re-fetching
      const retryEntry = await kv.get<{ count: number; windowStart: number }>(key);
      if (retryEntry.value && retryEntry.value.count >= MAX_REQUESTS) {
        return new Response('Too Many Requests', {
          status: 429,
          headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
        });
      }
    }

    return new Response('OK', { status: 200 });
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

  // Increment counter atomically
  await kv
    .atomic()
    .check(entry)
    .set(
      key,
      { count: current.count + 1, windowStart: current.windowStart },
      { expireIn: WINDOW_MS },
    )
    .commit();

  return new Response('OK', {
    status: 200,
    headers: {
      'X-RateLimit-Limit': String(MAX_REQUESTS),
      'X-RateLimit-Remaining': String(MAX_REQUESTS - current.count - 1),
    },
  });
});
