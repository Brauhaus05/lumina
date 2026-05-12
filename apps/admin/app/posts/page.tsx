import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { createServiceRoleClient } from '@lumina/db/server';
import { getPosts } from '@lumina/db/queries';
import { PostsTable } from '@/components/PostsTable';

export default async function PostsPage() {
  const tenantId = process.env['DEV_TENANT_ID'] ?? '';
  const client = await createServiceRoleClient();
  const posts = await getPosts(client, tenantId);

  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="size-3.5" />
            Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Posts</h1>
        </div>
        <Link
          href="/posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <Plus className="size-4" />
          New Post
        </Link>
      </header>

      <PostsTable posts={posts} />
    </main>
  );
}
