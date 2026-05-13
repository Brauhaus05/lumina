import Link from 'next/link';
import { headers } from 'next/headers';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getTenantBySubdomain, getPublishedPosts, getFeaturedPost } from '@lumina/db/queries';
import type { Database, Post } from '@lumina/types';

const getTenantId = cache(async (subdomain: string): Promise<string | null> => {
  const client = createClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );
  const tenant = await getTenantBySubdomain(client, subdomain);
  return tenant?.id ?? null;
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).toUpperCase();
}

function PostCard({ post }: { post: Post }) {
  return (
    <article>
      <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.7rem', letterSpacing: '0.1em' }} className="mb-2 uppercase">
        {formatDate(post.updated_at)}
      </p>
      <h2 className="mb-3 text-xl font-bold leading-snug">
        <Link href={`/${post.slug}`} style={{ color: 'var(--color-ink)', textDecoration: 'none' }}>
          {post.title}
        </Link>
      </h2>
      {post.excerpt && (
        <p style={{ color: 'var(--color-ink)', fontSize: '0.9rem', lineHeight: 1.65 }} className="mb-4">
          {post.excerpt}
        </p>
      )}
      <Link
        href={`/${post.slug}`}
        style={{ color: 'var(--color-ink)', fontSize: '0.75rem', letterSpacing: '0.08em', textDecoration: 'none' }}
        className="inline-flex items-center gap-1 uppercase hover:underline"
      >
        Read more <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

function NewsletterWidget() {
  return (
    <div
      style={{ background: 'var(--color-surface-dark)', color: 'var(--color-surface)' }}
      className="p-6"
    >
      <h3
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em', fontSize: '1.4rem' }}
        className="mb-3 uppercase"
      >
        Newsletter
      </h3>
      <p style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.75 }} className="mb-6">
        Dispatches from the editorial desk. Sent bi-weekly. No fluff, just structure.
      </p>
      <label style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.6 }} className="mb-2 block uppercase">
        Email Address
      </label>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder=""
          style={{
            background: 'transparent',
            border: '1px solid rgba(232,227,211,0.3)',
            color: 'var(--color-surface)',
            width: '100%',
            padding: '0.5rem 0.75rem',
            marginBottom: '0.75rem',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            border: '1px solid rgba(232,227,211,0.5)',
            color: 'var(--color-surface)',
            background: 'transparent',
            width: '100%',
            padding: '0.6rem',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}

export default async function PostListPage() {
  const headerStore = await headers();
  const subdomain = headerStore.get('x-lumina-subdomain') ?? '';
  const client = createClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );

  const tenantId = await getTenantId(subdomain);
  const [featured, allPosts] = await Promise.all([
    tenantId ? getFeaturedPost(client, tenantId) : Promise.resolve(null),
    tenantId ? getPublishedPosts(client, tenantId) : Promise.resolve([]),
  ]);

  const featuredId = featured?.id;
  const gridPosts = allPosts.filter((p) => p.id !== featuredId);

  // Derive unique categories for the index
  const categories = Array.from(
    new Set(allPosts.map((p) => p.category).filter((c): c is string => Boolean(c))),
  );

  const borderStyle = { borderTop: '1px solid var(--color-border)' } as const;

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────────── */}
      <section className="px-6 pb-8 pt-12">
        <h1
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em', lineHeight: 1 }}
          className="mb-4 text-[5rem] uppercase leading-none"
        >
          Journal
        </h1>
        <p style={{ color: 'var(--color-ink)', maxWidth: '38ch', lineHeight: 1.6 }} className="text-sm">
          Observations from the editorial desk. Curated thoughts on design, structure, and culture.
        </p>
      </section>

      {/* ── Featured post ───────────────────────────────────────────── */}
      {featured && (
        <section style={borderStyle} className="grid grid-cols-1 md:grid-cols-[2fr_1fr]">
          {featured.cover_image ? (
            <div className="aspect-[4/3] overflow-hidden md:aspect-auto">
              <img
                src={featured.cover_image}
                alt={featured.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              style={{ background: 'var(--color-border)', minHeight: '380px' }}
              className="hidden md:block"
            />
          )}
          <div
            style={{ borderLeft: '1px solid var(--color-border)' }}
            className="flex flex-col justify-between p-8"
          >
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--color-ink-muted)' }} className="mb-4 uppercase">
                Featured
              </p>
              <h2 className="mb-4 text-2xl font-bold leading-tight">
                <Link href={`/${featured.slug}`} style={{ color: 'var(--color-ink)', textDecoration: 'none' }}>
                  {featured.title}
                </Link>
              </h2>
              {featured.excerpt && (
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--color-ink)' }}>
                  {featured.excerpt}
                </p>
              )}
            </div>
            <div
              style={borderStyle}
              className="flex items-center justify-between pt-4"
            >
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', color: 'var(--color-ink-muted)' }} className="uppercase">
                {formatDate(featured.updated_at)}
              </span>
              <Link
                href={`/${featured.slug}`}
                style={{
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-ink)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  padding: '0.35rem 0.75rem',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                }}
              >
                Read
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Post grid + sidebar ─────────────────────────────────────── */}
      {gridPosts.length > 0 && (
        <section style={borderStyle} className="grid grid-cols-1 md:grid-cols-3">
          {/* First two posts */}
          {gridPosts.slice(0, 2).map((post, i) => (
            <div
              key={post.id}
              style={{
                borderRight: i === 0 ? '1px solid var(--color-border)' : undefined,
              }}
              className="p-8"
            >
              <PostCard post={post} />
            </div>
          ))}

          {/* Newsletter + Index sidebar */}
          <div style={{ borderLeft: '1px solid var(--color-border)' }}>
            <NewsletterWidget />

            {categories.length > 0 && (
              <div style={{ borderTop: '1px solid var(--color-border)' }} className="p-6">
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--color-ink-muted)' }} className="mb-4 uppercase">
                  Index
                </p>
                <ol className="list-none p-0">
                  {categories.map((cat, idx) => (
                    <li
                      key={cat}
                      style={{ borderTop: idx > 0 ? '1px solid var(--color-border)' : undefined }}
                      className="flex items-center justify-between py-3"
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {String(idx + 1).padStart(2, '0')}. {cat}
                      </span>
                      <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.75rem' }} aria-hidden>↗</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Remaining posts ─────────────────────────────────────────── */}
      {gridPosts.slice(2).length > 0 && (
        <section style={borderStyle} className="grid grid-cols-1 md:grid-cols-2">
          {gridPosts.slice(2).map((post, i) => (
            <div
              key={post.id}
              style={{
                borderRight: i % 2 === 0 ? '1px solid var(--color-border)' : undefined,
                borderTop: i >= 2 ? '1px solid var(--color-border)' : undefined,
              }}
              className="p-8"
            >
              {post.cover_image && (
                <div className="mb-5 overflow-hidden">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full object-cover"
                    style={{ maxHeight: '280px' }}
                  />
                </div>
              )}
              <PostCard post={post} />
            </div>
          ))}
        </section>
      )}

      {/* ── Load more ───────────────────────────────────────────────── */}
      {allPosts.length > 0 && (
        <section style={borderStyle} className="flex items-center justify-center py-10">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              letterSpacing: '0.15em',
              color: 'var(--color-ink)',
            }}
            className="uppercase"
          >
            + More
          </span>
        </section>
      )}

      {allPosts.length === 0 && (
        <section className="px-6 py-20 text-center">
          <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>No published posts yet.</p>
        </section>
      )}
    </>
  );
}
