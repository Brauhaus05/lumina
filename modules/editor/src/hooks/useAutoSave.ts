import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { TiptapDocument } from '@lumina/types';

export type SaveSignal = 'idle' | 'saving' | 'saved' | 'error';

const DEBOUNCE_MS = 1500;

export function useAutoSave(
  editor: Editor | null,
  onSave: (doc: TiptapDocument) => Promise<void>,
): SaveSignal {
  const [signal, setSignal] = useState<SaveSignal>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const flush = useCallback(async (doc: TiptapDocument) => {
    setSignal('saving');
    try {
      await onSaveRef.current(doc);
      setSignal('saved');
    } catch {
      setSignal('error');
    }
  }, []);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        flush(editor.getJSON() as TiptapDocument);
      }, DEBOUNCE_MS);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        // Flush synchronously on unmount if there's a pending save
        flush(editor.getJSON() as TiptapDocument);
      }
    };
  }, [editor, flush]);

  return signal;
}
