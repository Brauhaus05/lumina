'use client';

import { useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import LinkExtension from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { common, createLowlight } from 'lowlight';
import type { TiptapDocument } from '@lumina/types';
import { useAutoSave } from './hooks/useAutoSave';
import { createSlashCommandExtension } from './extensions/SlashCommand';
import { BubbleToolbar } from './components/BubbleToolbar';

const lowlight = createLowlight(common);

interface Props {
  initialContent?: TiptapDocument;
  onSave: (doc: TiptapDocument) => Promise<void>;
  uploadEndpoint: string;
  onEditorReady?: (editor: Editor) => void;
}

export function LuminaEditor({ initialContent, onSave, uploadEndpoint, onEditorReady }: Props) {
  const onEditorReadyRef = useRef(onEditorReady);
  onEditorReadyRef.current = onEditorReady;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        horizontalRule: false,
      }),
      Image.configure({ allowBase64: false }),
      CodeBlockLowlight.configure({ lowlight }),
      HorizontalRule,
      LinkExtension.configure({ openOnClick: false }),
      Underline,
      createSlashCommandExtension(uploadEndpoint),
    ],
    // null satisfies Content; undefined is rejected by exactOptionalPropertyTypes
    content: initialContent ?? null,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px]',
      },
    },
    onCreate({ editor: e }) {
      onEditorReadyRef.current?.(e);
    },
  });

  const saveSignal = useAutoSave(
    editor,
    useCallback((doc) => onSave(doc), [onSave]),
  );

  return (
    <div className="lumina-editor">
      {editor && <BubbleToolbar editor={editor} />}
      <p className="mb-2 text-xs text-zinc-600">
        Type <kbd className="rounded bg-zinc-800 px-1">/</kbd> for commands
        {saveSignal === 'saving' && <span className="ml-3 text-zinc-500">Saving…</span>}
        {saveSignal === 'saved' && <span className="ml-3 text-emerald-600">Saved</span>}
        {saveSignal === 'error' && <span className="ml-3 text-red-500">Save failed</span>}
      </p>
      <EditorContent editor={editor} />
    </div>
  );
}
