import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { createServiceRoleClient } from '@lumina/db/server';
import { getPosts } from '@lumina/db/queries';
import { PostStatus } from '@lumina/types';
import { Badge } from '@/components/ui/badge';

export default async function DashboardPage() {
  const tenantId = process.env['DEV_TENANT_ID'] ?? '';
  const client = await createServiceRoleClient();

  const [allPosts, publishedPosts] = await Promise.all([
    getPosts(client, tenantId),
    getPosts(client, tenantId, { status: PostStatus.PUBLISHED }),
  ]);

  const draftCount = allPosts.length - publishedPosts.length;
  const recentPosts = allPosts.slice(0, 5);

  return (
    <main className="min-h-screen bg-background p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1
          style={{ fontFamily: 'var(--font-heading, var(--font-sans))', letterSpacing: '0.05em' }}
          className="text-2xl font-bold uppercase tracking-widest text-foreground"
        >
          Lumina
        </h1>
        <Link
          href="/posts/new"
          className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80"
        >
          <Plus className="size-4" />
          New Post
        </Link>
      </header>

      {/* Bento Grid — 1 col mobile → 2 col sm → 4 col lg */}
      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {/* Recent Posts — 2×2 on lg */}
        <section className="min-h-48 bg-card p-6 sm:col-span-2 lg:row-span-2">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Recent Posts
          </h2>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet. Create your first one.</p>
          ) : (
            <ul className="space-y-1">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.id}`}
                    className="flex items-center justify-between p-3 transition-colors hover:bg-muted"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-medium text-foreground">
                        {post.title}
                      </span>
                    </span>
                    <Badge
                      variant={post.status === PostStatus.PUBLISHED ? 'default' : 'secondary'}
                      className="ml-3 shrink-0"
                    >
                      {post.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Draft Count */}
        <section className="bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Drafts</p>
          <p
            style={{ fontFamily: 'var(--font-heading, var(--font-sans))' }}
            className="mt-2 text-5xl font-bold text-foreground"
          >
            {draftCount}
          </p>
        </section>

        {/* Published Count */}
        <section className="bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Published
          </p>
          <p
            style={{ fontFamily: 'var(--font-heading, var(--font-sans))' }}
            className="mt-2 text-5xl font-bold text-foreground"
          >
            {publishedPosts.length}
          </p>
        </section>

        {/* Quick Compose */}
        <section className="bg-primary p-6">
          <Link href="/posts/new" className="flex h-full min-h-24 flex-col justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
              Quick Compose
            </p>
            <Plus className="size-8 text-primary-foreground" />
          </Link>
        </section>

        {/* Media */}
        <section className="bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Media</p>
          <p className="mt-2 text-sm text-muted-foreground">Library</p>
        </section>

        {/* All Posts Link */}
        <section className="bg-card p-6 sm:col-span-2">
          <Link
            href="/posts"
            className="flex h-full min-h-10 items-center justify-between text-sm text-foreground hover:underline"
          >
            <span>View all posts →</span>
            <span className="text-muted-foreground">{allPosts.length} total</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
