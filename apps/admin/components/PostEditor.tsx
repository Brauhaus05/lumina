'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { LuminaEditor } from '@lumina/editor';
import { savePostAction, publishPostAction, unpublishPostAction } from '../app/posts/[id]/actions';
import { PostStatus } from '@lumina/types';
import type { Post, PostSeoMetadata, TiptapDocument } from '@lumina/types';

interface Props {
  post?: Post;
  tenantId: string;
}

export function PostEditor({ post, tenantId }: Props) {
  const router = useRouter();
  const [currentPost, setCurrentPost] = useState<Post | undefined>(post);
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [seoMetadata, setSeoMetadata] = useState<PostSeoMetadata>(
    post?.seo_metadata ?? {},
  );

  const handleSave = useCallback(
    async (doc: TiptapDocument) => {
      if (!title.trim()) return;
      const computedSlug = slug.trim() || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const result = await savePostAction(
        currentPost?.id ?? null,
        tenantId,
        title,
        computedSlug,
        doc,
        seoMetadata,
      );

      if (result.success) {
        setCurrentPost(result.data);
        setSlug(result.data.slug);
        toast.success('Draft saved');
        if (!currentPost) {
          router.replace(`/posts/${result.data.id}`);
        }
      } else {
        toast.error('Failed to save');
      }
    },
    [title, slug, seoMetadata, currentPost, tenantId, router],
  );

  const handlePublish = useCallback(async () => {
    if (!currentPost) return;
    const result = await publishPostAction(currentPost.id, currentPost.content);
    if (result.success) {
      setCurrentPost(result.data);
      toast.success('Post published');
    } else {
      toast.error('Failed to publish');
    }
  }, [currentPost]);

  const handleUnpublish = useCallback(async () => {
    if (!currentPost) return;
    const result = await unpublishPostAction(currentPost.id);
    if (result.success) {
      setCurrentPost(result.data);
      toast('Post unpublished');
    } else {
      toast.error('Failed to unpublish');
    }
  }, [currentPost]);

  const isPublished = currentPost?.status === PostStatus.PUBLISHED;

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/posts')}
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300"
          >
            <ArrowLeft className="size-3.5" />
            Posts
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={isPublished ? handleUnpublish : handlePublish}
            disabled={!currentPost}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${
              isPublished
                ? 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                : 'bg-primary text-primary-foreground hover:bg-primary/80'
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

        {/* SEO Panel */}
        <details className="mt-12 border-t border-zinc-800 pt-6">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-300">
            SEO Settings
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                Meta description
                <span className="ml-1 text-zinc-600">
                  ({(seoMetadata.meta_description ?? '').length}/160)
                </span>
              </label>
              <textarea
                value={seoMetadata.meta_description ?? ''}
                onChange={(e) =>
                  setSeoMetadata((prev) => ({ ...prev, meta_description: e.target.value.slice(0, 160) }))
                }
                rows={3}
                placeholder="Brief description shown in search results…"
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">OG title override</label>
              <input
                type="text"
                value={seoMetadata.og_title ?? ''}
                onChange={(e) =>
                  setSeoMetadata((prev) => ({ ...prev, og_title: e.target.value }))
                }
                placeholder="Defaults to post title"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">OG image URL</label>
              <input
                type="url"
                value={seoMetadata.og_image ?? ''}
                onChange={(e) =>
                  setSeoMetadata((prev) => ({ ...prev, og_image: e.target.value }))
                }
                placeholder="https://res.cloudinary.com/…"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-primary"
              />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

