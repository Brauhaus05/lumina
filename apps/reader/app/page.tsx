import Link from 'next/link';
import { headers } from 'next/headers';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getTenantBySubdomain, getPublishedPosts, getFeaturedPost } from '@lumina/db/queries';
import type { Database, Post } from '@lumina/types';
import { NewsletterWidget } from '../components/NewsletterWidget';

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

function ReadMoreArrow() {
  return (
    <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path className="arrow-line" d="M0 5h9M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ArticleCard({ post, num }: { post: Post; num: number }) {
  const padded = String(num).padStart(2, '0');
  return (
    <article className="article-card">
      <span className="article-card__num">{padded}</span>
      {post.category && <span className="article-card__kicker">{post.category}</span>}
      <h3 className="article-card__title">
        <Link href={`/${post.slug}`}>{post.title}</Link>
      </h3>
      {post.excerpt && <p className="article-card__excerpt">{post.excerpt}</p>}
      <div className="article-card__foot">
        <span className="article-card__date">{formatDate(post.updated_at)}</span>
        <Link href={`/${post.slug}`} className="readmore">
          Read more <ReadMoreArrow />
        </Link>
      </div>
    </article>
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

  const categories = Array.from(
    new Set(allPosts.map((p) => p.category).filter((c): c is string => Boolean(c))),
  );

  // Split grid posts: first two go in the 3-col section alongside sidebar,
  // remaining fill the col sections
  const primaryPosts = gridPosts.slice(0, 4);
  const totalPosts = allPosts.length;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="home-hero">
        <h1>Field<br />Notes</h1>
        <p className="home-hero__sub">
          Observations from the editorial desk. Curated thoughts on design, structure, and culture.
        </p>
        <div className="home-hero__meta">
          <span>Updated Weekly</span>
          {totalPosts > 0 && <span>{totalPosts} {totalPosts === 1 ? 'Entry' : 'Entries'}</span>}
        </div>
      </section>

      {/* ── Featured post ────────────────────────────────────── */}
      {featured && (
        <section className="featured">
          <Link
            href={`/${featured.slug}`}
            className="featured__media"
            aria-label={featured.title}
            style={featured.cover_image ? { backgroundImage: `url('${featured.cover_image}')` } : undefined}
          />
          <div className="featured__body">
            <div>
              {featured.category && <div className="featured__kicker">{featured.category}</div>}
              <h2 className="featured__title">{featured.title}</h2>
              {featured.excerpt && <p className="featured__excerpt">{featured.excerpt}</p>}
            </div>
            <div className="featured__foot">
              <span className="featured__date">{formatDate(featured.updated_at)}</span>
              <Link href={`/${featured.slug}`} className="featured__cta">Read</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── 3-column grid ────────────────────────────────────── */}
      {primaryPosts.length > 0 && (
        <section className="grid-3">
          {/* Column 1 */}
          <div className="col">
            {primaryPosts.slice(0, 2).map((post, i) => (
              <ArticleCard key={post.id} post={post} num={i + 1} />
            ))}
          </div>

          {/* Column 2 */}
          <div className="col">
            {primaryPosts.slice(2, 4).map((post, i) => (
              <ArticleCard key={post.id} post={post} num={i + 3} />
            ))}
          </div>

          {/* Column 3: sidebar */}
          <aside className="col sidebar">
            <NewsletterWidget />
            {categories.length > 0 && (
              <div className="index">
                <div className="index__title">Index — By Category</div>
                <ul className="index__list">
                  {categories.map((cat, idx) => (
                    <li key={cat}>
                      <span>{String(idx + 1).padStart(2, '0')} · {cat}</span>
                      <span className="count">
                        {allPosts.filter((p) => p.category === cat).length}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </section>
      )}

      {/* ── Pagination strip ─────────────────────────────────── */}
      {allPosts.length > 0 && (
        <section className="pagination">
          <span className="pagination__meta">Page 01</span>
          <span className="pagination__more">+ More</span>
          <span className="pagination__meta">{totalPosts} entries</span>
        </section>
      )}

      {allPosts.length === 0 && (
        <section className="pagination">
          <span className="pagination__meta">No published posts yet.</span>
        </section>
      )}
    </>
  );
}
