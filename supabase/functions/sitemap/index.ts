// Deno Edge Function — Sitemap generator
// Alternative to Next.js sitemap.ts for < 100ms TTFB when cold starts are an issue

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

Deno.serve(async (req: Request) => {
  const host = req.headers.get('host') ?? '';
  const subdomain = host.split('.')[0] ?? '';

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: tenant } = await client
    .from('tenants')
    .select('id')
    .eq('subdomain', subdomain)
    .single();

  if (!tenant) {
    return new Response('Not Found', { status: 404 });
  }

  const { data: posts } = await client
    .from('posts')
    .select('slug, updated_at')
    .eq('tenant_id', tenant.id)
    .eq('status', 'published');

  const appUrl = `https://${host}`;

  const urls = [
    `<url><loc>${appUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...(posts ?? []).map(
      (p: { slug: string; updated_at: string }) =>
        `<url><loc>${appUrl}/${p.slug}</loc><lastmod>${p.updated_at}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
});
