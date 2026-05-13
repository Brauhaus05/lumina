'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LuminaEditor } from '@lumina/editor';
import type { Editor, SaveSignal } from '@lumina/editor';
import { savePostAction, publishPostAction, unpublishPostAction } from '../app/posts/[id]/actions';
import { PostStatus } from '@lumina/types';
import type { Post, PostSeoMetadata, TiptapDocument } from '@lumina/types';
import { StatusStrip } from './editor/StatusStrip';
import { MetaRow } from './editor/MetaRow';
import { HeadlineInput } from './editor/HeadlineInput';
import { PersistentToolbar } from './editor/PersistentToolbar';
import { FootStrip } from './editor/FootStrip';
import { EditorAside } from './editor/EditorAside';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.6rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted-foreground)',
  marginBottom: '0.25rem',
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--border)',
  padding: '0.4rem 0',
  fontSize: '0.8rem',
  color: 'var(--foreground)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
};

interface Props {
  post?: Post;
}

export function PostEditor({ post }: Props) {
  const router = useRouter();

  // --- post state ---
  const [currentPost, setCurrentPost] = useState<Post | undefined>(post);
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [section, setSection] = useState(post?.category ?? '');
  const [issue, setIssue] = useState(post?.seo_metadata?.issue_number ?? '');
  const [seoMetadata, setSeoMetadata] = useState<PostSeoMetadata>(post?.seo_metadata ?? {});
  const [author, setAuthor] = useState(post?.author ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? '');
  const [featured, setFeatured] = useState(post?.featured ?? false);

  // --- editor state ---
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saveSignal, setSaveSignal] = useState<SaveSignal>('idle');
  const [showSettings, setShowSettings] = useState(false);

  const handleEditorReady = useCallback((editor: Editor) => {
    setEditorInstance(editor);

    const updateCounts = () => {
      const text = editor.getText().trim();
      setWordCount(text ? text.split(/\s+/).filter(Boolean).length : 0);
      setCharCount(editor.getText().length);
    };
    updateCounts();

    editor.on('update', updateCounts);
  }, []);

  const readTimeMin = Math.max(1, Math.round(wordCount / 200));

  const computedSlug = useCallback(
    (rawSlug: string, rawTitle: string) =>
      rawSlug.trim() ||
      rawTitle
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    [],
  );

  const handleSave = useCallback(
    async (doc: TiptapDocument) => {
      if (!title.trim()) return;
      setSaveSignal('saving');

      const mergedSeo: PostSeoMetadata = { ...seoMetadata, issue_number: issue || undefined };
      const result = await savePostAction(
        currentPost?.id ?? null,
        title,
        computedSlug(slug, title),
        doc,
        mergedSeo,
        section || undefined,
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
        toast.error('Failed to save');
      }
    },
    [title, slug, section, issue, seoMetadata, currentPost, computedSlug, router],
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

  const handleDelete = useCallback(() => {
    toast.error('Delete is not yet implemented');
  }, []);

  const isPublished = currentPost?.status === PostStatus.PUBLISHED;

  const saveLabelText =
    saveSignal === 'saving'
      ? 'Saving…'
      : saveSignal === 'saved'
        ? 'Saved locally'
        : saveSignal === 'error'
          ? 'Save failed'
          : 'Unsaved';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      {/* ── Site Header ──────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}
      >
        {/* Brand */}
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            textTransform: 'uppercase',
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
            aria-hidden
          >
            L
          </span>
          Lumina
        </button>

        {/* Save status + CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
              color: 'var(--muted-foreground)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {saveLabelText}
          </span>

          <button
            onClick={() => {
              const doc =
                (editorInstance?.getJSON() as TiptapDocument | undefined) ??
                currentPost?.content ??
                { type: 'doc' as const, content: [] };
              void handleSave(doc);
            }}
            style={{
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--foreground)',
              padding: '0 1rem',
              height: '34px',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
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
              padding: '0 1rem',
              height: '34px',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              opacity: currentPost ? 1 : 0.4,
            }}
          >
            {isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </header>

      {/* ── Editor Shell ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Main Column ──────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            borderRight: '1px solid var(--border)',
          }}
        >
          <StatusStrip
            status={isPublished ? 'published' : 'draft'}
            saveSignal={saveSignal}
            wordCount={wordCount}
            readTimeMin={readTimeMin}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
              padding: '48px 64px 64px',
              flex: 1,
            }}
          >
            <MetaRow
              section={section}
              onSectionChange={setSection}
              slug={slug}
              onSlugChange={setSlug}
              issue={issue}
              onIssueChange={(v) => {
                setIssue(v);
                setSeoMetadata((prev) => ({ ...prev, issue_number: v || undefined }));
              }}
            />

            <div style={{ marginTop: '24px' }}>
              <HeadlineInput value={title} onChange={setTitle} />
            </div>

            <div style={{ marginTop: '24px' }}>
              <PersistentToolbar editor={editorInstance} uploadEndpoint="/api/upload" />
            </div>

            <div style={{ marginTop: '24px', flex: 1 }}>
              <LuminaEditor
                {...(currentPost?.content ? { initialContent: currentPost.content } : {})}
                onSave={handleSave}
                uploadEndpoint="/api/upload"
                onEditorReady={handleEditorReady}
              />
            </div>

            <div style={{ marginTop: '24px' }}>
              <FootStrip wordCount={wordCount} charCount={charCount} readTimeMin={readTimeMin} />
            </div>
          </div>

          {/* ── Settings Panel ─────────────────────────────────────── */}
          {showSettings && (
            <div
              style={{ borderTop: '1px solid var(--border)', padding: '48px 64px' }}
            >
              <p style={labelStyle} className="mb-6">
                Editorial
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={labelStyle}>Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Elara Vance"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      style={{ accentColor: 'var(--foreground)', width: '12px', height: '12px', marginRight: '6px' }}
                    />
                    Featured post
                  </label>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Excerpt</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short description shown in post cards…"
                    rows={2}
                    style={{ ...fieldStyle, resize: 'none' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Cover image URL</label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://res.cloudinary.com/…"
                    style={fieldStyle}
                  />
                </div>
              </div>

              <p style={{ ...labelStyle, marginTop: '32px', marginBottom: '16px' }}>SEO</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
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

        {/* ── Editor Aside ─────────────────────────────────────────── */}
        <EditorAside
          showSettings={showSettings}
          onToggleSettings={() => setShowSettings((v) => !v)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
