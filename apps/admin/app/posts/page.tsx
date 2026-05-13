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
    <main className="min-h-screen bg-background p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Dashboard
          </Link>
          <h1
            style={{ fontFamily: 'var(--font-heading, var(--font-sans))', letterSpacing: '0.05em' }}
            className="mt-1 text-2xl font-bold uppercase text-foreground"
          >
            Posts
          </h1>
        </div>
        <Link
          href="/posts/new"
          className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80"
        >
          <Plus className="size-4" />
          New Post
        </Link>
      </header>

      <PostsTable posts={posts} />
    </main>
  );
}
