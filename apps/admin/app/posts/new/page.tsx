import { PostEditor } from '@/components/PostEditor';

export default function NewPostPage() {
  const tenantId = process.env['DEV_TENANT_ID'] ?? '';

  return (
    <main className="min-h-screen bg-zinc-950">
      <PostEditor tenantId={tenantId} />
    </main>
  );
}
