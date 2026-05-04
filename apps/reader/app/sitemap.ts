import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getTenantBySubdomain, getPublishedPosts } from '@lumina/db/queries';
import type { Database } from '@lumina/types';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerStore = await headers();
  const subdomain = headerStore.get('x-lumina-subdomain') ?? '';
  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? `https://${subdomain}.lumina.app`;

  const client = createClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );

  const tenant = await getTenantBySubdomain(client, subdomain);
  if (!tenant) return [];

  const posts = await getPublishedPosts(client, tenant.id);

  return [
    { url: appUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ...posts.map((post) => ({
      url: `${appUrl}/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
