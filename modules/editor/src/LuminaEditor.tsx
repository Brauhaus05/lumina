'use client';

import { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { common, createLowlight } from 'lowlight';
import type { TiptapDocument } from '@lumina/types';
import { useAutoSave } from './hooks/useAutoSave';
import { createSlashCommandExtension } from './extensions/SlashCommand';

const lowlight = createLowlight(common);

interface Props {
  initialContent?: TiptapDocument;
  onSave: (doc: TiptapDocument) => Promise<void>;
  uploadEndpoint: string;
}

export function LuminaEditor({ initialContent, onSave, uploadEndpoint }: Props) {
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
      createSlashCommandExtension(uploadEndpoint),
    ],
    // null satisfies Content; undefined is rejected by exactOptionalPropertyTypes
    content: initialContent ?? null,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px]',
      },
    },
  });

  const saveSignal = useAutoSave(
    editor,
    useCallback((doc) => onSave(doc), [onSave]),
  );

  return (
    <div className="lumina-editor">
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
