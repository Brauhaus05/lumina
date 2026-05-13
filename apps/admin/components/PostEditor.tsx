'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Clock, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { LuminaEditor } from '@lumina/editor';
import { savePostAction, publishPostAction, unpublishPostAction } from '../app/posts/[id]/actions';
import { PostStatus } from '@lumina/types';
import type { Post, PostSeoMetadata, TiptapDocument } from '@lumina/types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Props {
  post?: Post;
  tenantId: string;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--border)',
  padding: '0.4rem 0',
  fontSize: '0.8rem',
  color: 'var(--foreground)',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.6rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
  marginBottom: '0.25rem',
};

export function PostEditor({ post, tenantId }: Props) {
  const router = useRouter();
  const [currentPost, setCurrentPost] = useState<Post | undefined>(post);
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [seoMetadata, setSeoMetadata] = useState<PostSeoMetadata>(post?.seo_metadata ?? {});
  const [author, setAuthor] = useState(post?.author ?? '');
  const [category, setCategory] = useState(post?.category ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? '');
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showSettings, setShowSettings] = useState(false);

  const handleSave = useCallback(
    async (doc: TiptapDocument) => {
      if (!title.trim()) return;
      setSaveStatus('saving');
      const computedSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

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
        setSaveStatus('saved');
        if (!currentPost) {
          router.replace(`/posts/${result.data.id}`);
        }
      } else {
        setSaveStatus('error');
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

  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'saved'
        ? 'Saved locally'
        : saveStatus === 'error'
          ? 'Save failed'
          : 'Unsaved';

  return (
    <div className="flex h-screen flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        style={{ borderBottom: '1px solid var(--border)', height: '60px' }}
        className="flex shrink-0 items-center justify-between px-6"
      >
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'var(--foreground)',
            color: 'var(--background)',
            fontFamily: 'var(--font-heading, var(--font-sans))',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            padding: '0 0.75rem',
            height: '36px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              border: '1.5px solid var(--background)',
              fontSize: '0.65rem',
              fontWeight: 700,
            }}
          >
            L
          </span>
          Lumina
        </button>

        <div className="flex items-center gap-4">
          <span
            style={{ fontSize: '0.7rem', letterSpacing: '0.05em', color: 'var(--muted-foreground)' }}
            className="hidden sm:flex items-center gap-1.5"
          >
            <Save size={12} aria-hidden />
            {saveLabel}
          </span>

          <button
            onClick={() => handleSave(currentPost?.content ?? { type: 'doc', content: [] })}
            style={{
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--foreground)',
              padding: '0.3rem 0.9rem',
              fontSize: '0.75rem',
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            Save Draft
          </button>

          <button
            onClick={isPublished ? handleUnpublish : handlePublish}
            disabled={!currentPost}
            style={{
              background: isPublished ? 'transparent' : 'var(--foreground)',
              color: isPublished ? 'var(--foreground)' : 'var(--background)',
              border: isPublished ? '1px solid var(--border)' : 'none',
              padding: '0.3rem 0.9rem',
              fontSize: '0.75rem',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              opacity: currentPost ? 1 : 0.4,
            }}
          >
            {isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Editor pane ────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-auto">
          {/* Title section */}
          <div style={{ borderBottom: '1px solid var(--border)' }} className="px-10 pb-6 pt-8">
            <p
              style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--muted-foreground)' }}
              className="mb-3 uppercase"
            >
              Editorial
            </p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter headline…"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-heading, var(--font-sans))',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: 'var(--foreground)',
                outline: 'none',
              }}
            />
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="slug (auto-generated)"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                color: 'var(--muted-foreground)',
                outline: 'none',
                marginTop: '0.5rem',
              }}
            />
          </div>

          {/* Tiptap editor */}
          <div className="flex-1 px-10 py-8">
            <LuminaEditor
              {...(currentPost?.content ? { initialContent: currentPost.content } : {})}
              onSave={handleSave}
              uploadEndpoint="/api/upload"
            />
          </div>

          {/* Settings panel (SEO + editorial fields) */}
          {showSettings && (
            <div style={{ borderTop: '1px solid var(--border)' }} className="px-10 py-8">
              <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--muted-foreground)' }} className="mb-6 uppercase">
                Settings
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label style={labelStyle}>Author</label>
                  <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Elara Vance" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Architecture & Design" style={fieldStyle} />
                </div>
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Excerpt</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short description shown in post cards…"
                    rows={2}
                    style={{ ...fieldStyle, resize: 'none', borderBottom: '1px solid var(--border)' }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Cover image URL</label>
                  <input type="url" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://res.cloudinary.com/…" style={fieldStyle} />
                </div>
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      style={{ accentColor: 'var(--foreground)', width: '12px', height: '12px' }}
                    />
                    Featured post
                  </label>
                </div>
              </div>

              <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--muted-foreground)', marginTop: '2rem' }} className="mb-4 uppercase">
                SEO
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label style={labelStyle}>
                    Meta description
                    <span style={{ marginLeft: '0.5rem', opacity: 0.5 }}>
                      ({(seoMetadata.meta_description ?? '').length}/160)
                    </span>
                  </label>
                  <textarea
                    value={seoMetadata.meta_description ?? ''}
                    onChange={(e) =>
                      setSeoMetadata((prev) => ({ ...prev, meta_description: e.target.value.slice(0, 160) }))
                    }
                    rows={2}
                    placeholder="Brief description shown in search results…"
                    style={{ ...fieldStyle, resize: 'none' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>OG title override</label>
                  <input
                    type="text"
                    value={seoMetadata.og_title ?? ''}
                    onChange={(e) => setSeoMetadata((prev) => ({ ...prev, og_title: e.target.value }))}
                    placeholder="Defaults to post title"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>OG image URL</label>
                  <input
                    type="url"
                    value={seoMetadata.og_image ?? ''}
                    onChange={(e) => setSeoMetadata((prev) => ({ ...prev, og_image: e.target.value }))}
                    placeholder="https://res.cloudinary.com/…"
                    style={fieldStyle}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right icon sidebar ─────────────────────────────────── */}
        <aside
          style={{ borderLeft: '1px solid var(--border)', width: '48px' }}
          className="flex shrink-0 flex-col items-center justify-between py-4"
        >
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setShowSettings((v) => !v)}
              title="Settings"
              style={{
                background: showSettings ? 'var(--foreground)' : 'transparent',
                color: showSettings ? 'var(--background)' : 'var(--muted-foreground)',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <Settings size={16} aria-hidden />
            </button>
            <button
              onClick={() => toast('Version history coming soon')}
              title="History"
              style={{
                background: 'transparent',
                color: 'var(--muted-foreground)',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <Clock size={16} aria-hidden />
            </button>
          </div>

          <button
            onClick={() => toast.error('Delete is not yet implemented')}
            title="Delete post"
            style={{
              background: 'transparent',
              color: '#b91c1c',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <Trash2 size={16} aria-hidden />
          </button>
        </aside>
      </div>
    </div>
  );
}
