import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getTenantBySubdomain, getPostBySlug } from '@lumina/db/queries';
import { renderContent } from '@lumina/reader';
import { PostStatus } from '@lumina/types';
import type { Database } from '@lumina/types';

// ISR: revalidate every 60 seconds
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const headerStore = await headers();
  const subdomain = headerStore.get('x-lumina-subdomain') ?? '';

  const client = createClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );

  const tenant = await getTenantBySubdomain(client, subdomain);
  if (!tenant) notFound();

  const post = await getPostBySlug(client, tenant.id, slug);
  if (!post || post.status !== PostStatus.PUBLISHED) notFound();

  const html = renderContent(post.content);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {new Date(post.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </header>
        <div
          className="lumina-content prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </main>
  );
}
