import Link from 'next/link';
import { createServiceRoleClient } from '@lumina/db/server';
import { getPosts } from '@lumina/db/queries';
import { PostStatus } from '@lumina/types';

export default async function DashboardPage() {
  // In a real app, tenant_id comes from the authenticated user's JWT
  // For now, we read from env as a dev placeholder
  const tenantId = process.env['DEV_TENANT_ID'] ?? '';
  const client = await createServiceRoleClient();

  const [allPosts, publishedPosts] = await Promise.all([
    getPosts(client, tenantId),
    getPosts(client, tenantId, { status: PostStatus.PUBLISHED }),
  ]);

  const draftCount = allPosts.length - publishedPosts.length;
  const recentPosts = allPosts.slice(0, 5);

  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Lumina</h1>
        <Link
          href="/posts/new"
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
        >
          New Post
        </Link>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-4 grid-rows-3 gap-4">
        {/* Recent Activity — spans 2 cols × 2 rows */}
        <section className="col-span-2 row-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Recent Posts
          </h2>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-zinc-500">No posts yet. Create your first one.</p>
          ) : (
            <ul className="space-y-3">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.id}`}
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-zinc-800"
                  >
                    <span className="truncate text-sm font-medium text-zinc-100">
                      {post.title}
                    </span>
                    <span
                      className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.status === PostStatus.PUBLISHED
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {post.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Draft Count */}
        <section className="col-span-1 row-span-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Drafts</p>
          <p className="mt-2 text-5xl font-bold text-white">{draftCount}</p>
        </section>

        {/* Published Count */}
        <section className="col-span-1 row-span-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Published
          </p>
          <p className="mt-2 text-5xl font-bold text-emerald-400">{publishedPosts.length}</p>
        </section>

        {/* Quick Compose */}
        <section className="col-span-1 row-span-1 rounded-2xl border border-indigo-800 bg-indigo-950 p-6">
          <Link href="/posts/new" className="flex h-full flex-col justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Quick Compose
            </p>
            <span className="text-3xl text-indigo-300">+</span>
          </Link>
        </section>

        {/* Media Library */}
        <section className="col-span-1 row-span-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Media</p>
          <p className="mt-2 text-sm text-zinc-500">Library</p>
        </section>

        {/* All Posts Link */}
        <section className="col-span-2 row-span-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <Link
            href="/posts"
            className="flex h-full items-center justify-between text-sm text-zinc-300 hover:text-white"
          >
            <span>View all posts →</span>
            <span className="text-zinc-500">{allPosts.length} total</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
