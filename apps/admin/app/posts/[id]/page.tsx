import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@lumina/db/server';
import { getPostById } from '@lumina/db/queries';
import { PostEditor } from '@/components/PostEditor';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const client = await createServiceRoleClient();
  const post = await getPostById(client, id);

  if (!post) notFound();

  const tenantId = process.env['DEV_TENANT_ID'] ?? '';

  return (
    <main className="min-h-screen bg-zinc-950">
      <PostEditor post={post} tenantId={tenantId} />
    </main>
  );
}
