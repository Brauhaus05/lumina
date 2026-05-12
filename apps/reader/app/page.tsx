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
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-10 text-4xl font-bold tracking-tight">Posts</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">No published posts yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/${post.slug}`}
                className="group block h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h2 className="text-xl font-semibold leading-snug group-hover:text-[var(--lumina-color-accent,#4f46e5)]">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm text-gray-400">
                  {new Date(post.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
