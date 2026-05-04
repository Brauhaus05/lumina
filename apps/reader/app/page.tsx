import Link from 'next/link';
import { headers } from 'next/headers';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getTenantBySubdomain, getPublishedPosts } from '@lumina/db/queries';
import type { Database } from '@lumina/types';

const getTenantId = cache(async (subdomain: string): Promise<string | null> => {
  const client = createClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );
  const tenant = await getTenantBySubdomain(client, subdomain);
  return tenant?.id ?? null;
});

export default async function PostListPage() {
  const headerStore = await headers();
  const subdomain = headerStore.get('x-lumina-subdomain') ?? '';
  const client = createClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );

  const tenantId = await getTenantId(subdomain);
  const posts = tenantId ? await getPublishedPosts(client, tenantId) : [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Posts</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">No published posts yet.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/${post.slug}`} className="group">
                <h2 className="text-xl font-semibold group-hover:underline">{post.title}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(post.updated_at).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
