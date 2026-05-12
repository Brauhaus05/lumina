import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { getTenantBySubdomain, getPostBySlug } from '@lumina/db/queries';
import { renderContent } from '@lumina/reader';
import { PostStatus } from '@lumina/types';
import type { Database, TiptapNode } from '@lumina/types';

// ISR: revalidate every 60 seconds
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

function makeClient() {
  return createClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const headerStore = await headers();
  const subdomain = headerStore.get('x-lumina-subdomain') ?? '';
  const client = makeClient();

  const tenant = await getTenantBySubdomain(client, subdomain);
  if (!tenant) return {};

  const post = await getPostBySlug(client, tenant.id, slug);
  if (!post) return {};

  const seo = post.seo_metadata;
  return {
    title: seo?.og_title ?? post.title,
    description: seo?.meta_description,
    openGraph: {
      title: seo?.og_title ?? post.title,
      description: seo?.meta_description,
      ...(seo?.og_image && { images: [{ url: seo.og_image }] }),
    },
  };
}

function countWords(nodes: TiptapNode[]): number {
  return nodes.reduce((sum, node) => {
    if (node.text) return sum + node.text.trim().split(/\s+/).filter(Boolean).length;
    if (node.content) return sum + countWords(node.content);
    return sum;
  }, 0);
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const headerStore = await headers();
  const subdomain = headerStore.get('x-lumina-subdomain') ?? '';
  const client = makeClient();

  const tenant = await getTenantBySubdomain(client, subdomain);
  if (!tenant) notFound();

  const post = await getPostBySlug(client, tenant.id, slug);
  if (!post || post.status !== PostStatus.PUBLISHED) notFound();

  const html = renderContent(post.content);
  const wordCount = countWords(post.content.content);
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <nav className="mb-8">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-[var(--lumina-color-accent,#4f46e5)]"
        >
          ← All posts
        </Link>
      </nav>

      <article>
        <header className="mb-10">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">{post.title}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
            <time dateTime={post.updated_at}>
              {new Date(post.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span aria-hidden>·</span>
            <span>{readingMinutes} min read</span>
          </div>
        </header>

        <div
          className="lumina-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </main>
  );
}
