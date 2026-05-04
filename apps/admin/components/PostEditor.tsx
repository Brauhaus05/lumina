'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LuminaEditor } from '@lumina/editor';
import { savePostAction, publishPostAction, unpublishPostAction } from '../app/posts/[id]/actions';
import { PostStatus } from '@lumina/types';
import type { Post, TiptapDocument } from '@lumina/types';

interface Props {
  post?: Post;
}

type SaveSignal = 'idle' | 'saving' | 'saved' | 'error';

export function PostEditor({ post }: Props) {
  const router = useRouter();
  const [currentPost, setCurrentPost] = useState<Post | undefined>(post);
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [saveSignal, setSaveSignal] = useState<SaveSignal>('idle');
  const tenantId = process.env['NEXT_PUBLIC_DEV_TENANT_ID'] ?? '';

  const handleSave = useCallback(
    async (doc: TiptapDocument) => {
      if (!title.trim()) return;
      const computedSlug = slug.trim() || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      setSaveSignal('saving');
      const result = await savePostAction(
        currentPost?.id ?? null,
        tenantId,
        title,
        computedSlug,
        doc,
      );

      if (result.success) {
        setCurrentPost(result.data);
        setSlug(result.data.slug);
        setSaveSignal('saved');
        if (!currentPost) {
          router.replace(`/posts/${result.data.id}`);
        }
      } else {
        setSaveSignal('error');
      }
    },
    [title, slug, currentPost, tenantId, router],
  );

  const handlePublish = useCallback(async () => {
    if (!currentPost) return;
    const result = await publishPostAction(
      currentPost.id,
      currentPost.content,
    );
    if (result.success) setCurrentPost(result.data);
  }, [currentPost]);

  const handleUnpublish = useCallback(async () => {
    if (!currentPost) return;
    const result = await unpublishPostAction(currentPost.id);
    if (result.success) setCurrentPost(result.data);
  }, [currentPost]);

  const isPublished = currentPost?.status === PostStatus.PUBLISHED;

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/posts')}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Posts
          </button>
          <SaveIndicator signal={saveSignal} />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={isPublished ? handleUnpublish : handlePublish}
            disabled={!currentPost}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${
              isPublished
                ? 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                : 'bg-indigo-500 text-white hover:bg-indigo-400'
            }`}
          >
            {isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </header>

      {/* Title */}
      <div className="border-b border-zinc-800 bg-zinc-950 px-8 py-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full bg-transparent text-3xl font-bold text-white placeholder-zinc-600 outline-none"
        />
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="post-slug (auto-generated from title)"
          className="mt-1 w-full bg-transparent text-sm text-zinc-500 placeholder-zinc-700 outline-none"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto bg-zinc-950 px-8 py-6">
        <LuminaEditor
          {...(currentPost?.content ? { initialContent: currentPost.content } : {})}
          onSave={handleSave}
          uploadEndpoint="/api/upload"
        />
      </div>
    </div>
  );
}

function SaveIndicator({ signal }: { signal: SaveSignal }) {
  const labels: Record<SaveSignal, string> = {
    idle: '',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Save failed',
  };
  const colors: Record<SaveSignal, string> = {
    idle: '',
    saving: 'text-zinc-500',
    saved: 'text-emerald-500',
    error: 'text-red-500',
  };
  if (signal === 'idle') return null;
  return <span className={`text-xs ${colors[signal]}`}>{labels[signal]}</span>;
}
