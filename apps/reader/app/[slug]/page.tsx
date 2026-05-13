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

function BackArrow() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path className="arrow-line" d="M10 5H1M5 9 1 5l4-4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
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

  return (
    <div className="post-wrap">
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className="post-sidebar">
        <Link href="/" className="back-link">
          <BackArrow />
          Back to Journal
        </Link>

        <div className="meta-block">
          <div className="meta-row">
            <span className="meta-row__label">Published</span>
            <span className="meta-row__value">{formatDateLong(post.updated_at)}</span>
          </div>
          {post.category && (
            <div className="meta-row">
              <span className="meta-row__label">Category</span>
              <span className="meta-row__value">{post.category}</span>
            </div>
          )}
          {post.author && (
            <div className="meta-row">
              <span className="meta-row__label">Author</span>
              <span className="meta-row__value">{post.author}</span>
            </div>
          )}
        </div>

        <div className="share">
          <span className="share__label">Share</span>
          <div className="share__row">
            <ShareButtons title={post.title} />
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <article className="post-body">
        {post.category && (
          <div className="post-eyebrow">
            <span className="pill pill--solid">{post.category}</span>
          </div>
        )}

        <h1 className="post-title">{post.title}</h1>

        {post.excerpt && <p className="post-deck">{post.excerpt}</p>}

        {post.cover_image && (
          <div className="hero-img">
            <img src={post.cover_image} alt={post.title} />
          </div>
        )}

        <div
          className="lumina-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="post-outro">
          <span className="post-outro__label">More reading</span>
          <Link href="/" className="post-outro__next">
            Back to Journal
            <svg width="14" height="14" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M0 5h9M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </Link>
        </div>
      </article>
    </div>
  );
}
