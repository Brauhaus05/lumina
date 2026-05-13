'use client';

import { useState, useRef, useCallback } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import type { Editor } from '@lumina/editor';

interface Props {
  editor: Editor | null;
  uploadEndpoint: string;
}

interface TbBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function TbBtn({ onClick, active = false, disabled = false, title, children }: TbBtnProps) {
  return (
    <button
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '32px',
        minWidth: '32px',
        padding: '0 8px',
        background: active ? 'var(--foreground)' : 'var(--card)',
        border: 0,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: '13px',
        letterSpacing: '0.02em',
        color: active ? 'var(--background)' : disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 80ms, color 80ms',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (disabled || active) return;
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--foreground)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--background)';
      }}
      onMouseLeave={(e) => {
        if (disabled || active) return;
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--card)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)';
      }}
    >
      {children}
    </button>
  );
}

function TbDivider() {
  return (
    <span
      aria-hidden
      style={{
        width: '1px',
        height: '20px',
        background: 'var(--border)',
        margin: '0 4px',
        flexShrink: 0,
      }}
    />
  );
}

export function PersistentToolbar({ editor, uploadEndpoint }: Props) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const disabled = editor === null;

  const applyLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const openLinkInput = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes('link').href as string | undefined;
    setLinkUrl(existing ?? '');
    setShowLinkInput(true);
  }, [editor]);

  const handleImageSelect = useCallback(
    async (file: File) => {
      if (!editor) return;
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(uploadEndpoint, { method: 'POST', body: formData });
      if (!res.ok) return;
      const { url } = (await res.json()) as { url: string };
      const deliveryUrl = url.replace('/upload/', '/upload/f_auto,q_auto/');
      editor.chain().focus().setImage({ src: deliveryUrl }).run();
    },
    [editor, uploadEndpoint],
  );

  return (
    <div
      style={{
        display: 'inline-flex',
        gap: '4px',
        alignItems: 'center',
        padding: '6px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '4px 4px 0 var(--border)',
        width: 'fit-content',
        flexWrap: 'wrap',
      }}
      role="toolbar"
      aria-label="Formatting"
    >
      {showLinkInput ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px' }}>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyLink();
              if (e.key === 'Escape') {
                setShowLinkInput(false);
                setLinkUrl('');
              }
            }}
            placeholder="https://…"
            autoFocus
            style={{
              height: '28px',
              width: '220px',
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              padding: '0 8px',
              fontSize: '12px',
              letterSpacing: '0.02em',
              outline: 'none',
            }}
          />
          <button
            onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
            style={{
              padding: '0 8px',
              height: '28px',
              background: 'var(--foreground)',
              color: 'var(--background)',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            Apply
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowLinkInput(false); setLinkUrl(''); }}
            style={{
              padding: '0 6px',
              height: '28px',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          {/* Inline marks */}
          <TbBtn
            title="Bold"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive('bold') ?? false}
            disabled={disabled}
          >
            <b>B</b>
          </TbBtn>
          <TbBtn
            title="Italic"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive('italic') ?? false}
            disabled={disabled}
          >
            <i>I</i>
          </TbBtn>
          <TbBtn
            title="Underline"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive('underline') ?? false}
            disabled={disabled}
          >
            <span style={{ textDecoration: 'underline' }}>U</span>
          </TbBtn>

          <TbDivider />

          {/* Headings */}
          <TbBtn
            title="Heading 1"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor?.isActive('heading', { level: 1 }) ?? false}
            disabled={disabled}
          >
            H1
          </TbBtn>
          <TbBtn
            title="Heading 2"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor?.isActive('heading', { level: 2 }) ?? false}
            disabled={disabled}
          >
            H2
          </TbBtn>
          <TbBtn
            title="Heading 3"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor?.isActive('heading', { level: 3 }) ?? false}
            disabled={disabled}
          >
            H3
          </TbBtn>

          <TbDivider />

          {/* Block types */}
          <TbBtn
            title="Blockquote"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editor?.isActive('blockquote') ?? false}
            disabled={disabled}
          >
            <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden>
              <path d="M0 12V6C0 2.7 1.7.7 5 0v3C3.3 3.7 2.7 4.7 2.7 6H4v6H0Zm9 0V6c0-3.3 1.7-5.3 5-6v3c-1.7.7-2.3 1.7-2.3 3H13v6H9Z" />
            </svg>
          </TbBtn>
          <TbBtn
            title="Bullet List"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive('bulletList') ?? false}
            disabled={disabled}
          >
            •
          </TbBtn>
          <TbBtn
            title="Numbered List"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive('orderedList') ?? false}
            disabled={disabled}
          >
            1.
          </TbBtn>

          <TbDivider />

          {/* Link & Image */}
          <TbBtn
            title="Link"
            onClick={openLinkInput}
            active={editor?.isActive('link') ?? false}
            disabled={disabled}
          >
            <LinkIcon size={14} aria-hidden />
          </TbBtn>
          <TbBtn
            title="Add image"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <rect x="1" y="1" width="16" height="16" />
              <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none" />
              <path d="M2 14l4-4 4 4 3-3 4 4" />
            </svg>
          </TbBtn>
        </>
      )}

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImageSelect(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
