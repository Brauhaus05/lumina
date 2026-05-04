import Link from 'next/link';
import { createServerSupabaseClient } from '@lumina/db/server';
import { getPosts } from '@lumina/db/queries';
import { PostStatus } from '@lumina/types';

export default async function PostsPage() {
  const tenantId = process.env['DEV_TENANT_ID'] ?? '';
  const client = await createServerSupabaseClient();
  const posts = await getPosts(client, tenantId);

  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Posts</h1>
        </div>
        <Link
          href="/posts/new"
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
        >
          New Post
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-400">No posts yet.</p>
          <Link href="/posts/new" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
            Create your first post →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
          <ul className="divide-y divide-zinc-800">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/50"
                >
                  <div>
                    <p className="font-medium text-zinc-100">{post.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">/{post.slug}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
        </div>
      )}
    </main>
  );
}
