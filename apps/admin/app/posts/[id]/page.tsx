import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@lumina/db/server';
import { getPostById } from '@lumina/db/queries';
import { PostEditor } from '@/components/PostEditor';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const client = await createServerSupabaseClient();
  const post = await getPostById(client, id);

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-zinc-950">
      <PostEditor post={post} />
    </main>
  );
}
