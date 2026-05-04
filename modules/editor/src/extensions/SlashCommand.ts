import { Extension } from '@tiptap/core';
import type { Editor, Range } from '@tiptap/core';

export interface SlashCommandItem {
  label: string;
  description: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

// The Extension adds a suggestion plugin that intercepts '/' keypresses
export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: { command: SlashCommandItem['command'] } }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [];
  },
});

export function buildSlashItems(uploadEndpoint: string): SlashCommandItem[] {
  return [
    {
      label: 'Heading 1',
      description: 'Large section heading',
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
    },
    {
      label: 'Heading 2',
      description: 'Medium section heading',
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
    },
    {
      label: 'Heading 3',
      description: 'Small section heading',
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
    },
    {
      label: 'Code Block',
      description: 'Code block with syntax highlighting',
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setCodeBlock().run(),
    },
    {
      label: 'Blockquote',
      description: 'Quote or callout block',
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setBlockquote().run(),
    },
    {
      label: 'Divider',
      description: 'Horizontal rule',
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      label: 'Image',
      description: 'Upload an image',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          const formData = new FormData();
          formData.append('file', file);

          const res = await fetch(uploadEndpoint, { method: 'POST', body: formData });
          if (!res.ok) return;

          const { url } = (await res.json()) as { url: string };
          // Append Cloudinary auto format/quality transformation
          const deliveryUrl = url.replace('/upload/', '/upload/f_auto,q_auto/');
          editor.chain().focus().setImage({ src: deliveryUrl }).run();
        };
        input.click();
      },
    },
  ];
}

export type { Editor, Range };
