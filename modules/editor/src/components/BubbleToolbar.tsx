'use client';

import { useState, useCallback } from 'react';
import { BubbleMenu, type Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, Code, Link, Underline } from 'lucide-react';

interface Props {
  editor: Editor;
}

export function BubbleToolbar({ editor }: Props) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const applyLink = useCallback(() => {
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const openLinkInput = useCallback(() => {
    const existing = editor.getAttributes('link').href as string | undefined;
    setLinkUrl(existing ?? '');
    setShowLinkInput(true);
  }, [editor]);

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="flex items-center gap-0.5 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl"
    >
      {showLinkInput ? (
        <div className="flex items-center gap-1 px-1">
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
            placeholder="https://..."
            autoFocus
            className="h-6 w-48 rounded bg-zinc-800 px-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          <button
            onClick={applyLink}
            className="rounded px-2 py-0.5 text-xs text-indigo-400 hover:bg-zinc-800"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl('');
            }}
            className="rounded px-1 py-0.5 text-xs text-zinc-500 hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Inline code"
          >
            <Code className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline"
          >
            <Underline className="size-3.5" />
          </ToolbarButton>
          <div className="mx-0.5 h-4 w-px bg-zinc-700" aria-hidden />
          <ToolbarButton
            onClick={openLinkInput}
            active={editor.isActive('link')}
            title="Link"
          >
            <Link className="size-3.5" />
          </ToolbarButton>
        </>
      )}
    </BubbleMenu>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  title: string;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focused
        onClick();
      }}
      title={title}
      className={`rounded p-1.5 transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
