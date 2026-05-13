import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { getTenantBySubdomain, getPostBySlug } from '@lumina/db/queries';
import { renderContent } from '@lumina/reader';
import { PostStatus } from '@lumina/types';
import type { Database } from '@lumina/types';
import { ShareButtons } from '../../components/ShareButtons';

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
    description: seo?.meta_description ?? post.excerpt ?? undefined,
    openGraph: {
      title: seo?.og_title ?? post.title,
      description: seo?.meta_description ?? post.excerpt ?? undefined,
      ...(seo?.og_image && { images: [{ url: seo.og_image }] }),
    },
  };
}

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();
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

  const labelStyle = {
    fontSize: '0.6rem',
    letterSpacing: '0.15em',
    color: 'var(--color-ink-muted)',
    textTransform: 'uppercase' as const,
    marginBottom: '0.25rem',
  };

  const valueStyle = {
    fontSize: '0.8rem',
    letterSpacing: '0.05em',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    color: 'var(--color-ink)',
  };

  const dividerStyle = { borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' } as const;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* ── Left sidebar ────────────────────────────────────────────── */}
      <aside
        style={{ borderRight: '1px solid var(--color-border)', width: '200px', flexShrink: 0 }}
        className="hidden px-6 py-10 md:block"
      >
        <Link
          href="/"
          style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--color-ink)', textDecoration: 'none' }}
          className="mb-8 flex items-center gap-1 uppercase hover:underline"
        >
          ← Back to Journal
        </Link>

        <div style={dividerStyle}>
          <p style={labelStyle}>Published</p>
          <p style={valueStyle}>{formatDateLong(post.updated_at)}</p>
        </div>

        {post.category && (
          <div style={dividerStyle}>
            <p style={labelStyle}>Category</p>
            <p style={valueStyle}>{post.category}</p>
          </div>
        )}

        {post.author && (
          <div style={dividerStyle}>
            <p style={labelStyle}>Author</p>
            <p style={valueStyle}>{post.author}</p>
          </div>
        )}

        <div style={dividerStyle}>
          <p style={labelStyle}>Share</p>
          <ShareButtons title={post.title} />
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="flex-1 px-6 py-10 md:px-16 md:py-12">
        {/* Mobile back link */}
        <Link
          href="/"
          style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--color-ink)', textDecoration: 'none' }}
          className="mb-6 flex items-center gap-1 uppercase hover:underline md:hidden"
        >
          ← Back to Journal
        </Link>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            letterSpacing: '0.02em',
            lineHeight: 1,
            textTransform: 'uppercase',
            maxWidth: '16ch',
          }}
          className="mb-6"
        >
          {post.title}
        </h1>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: '2rem' }} />

        {post.cover_image && (
          <div className="mb-8">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full object-cover"
              style={{ maxHeight: '480px' }}
            />
          </div>
        )}

        <div
          className="lumina-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}

