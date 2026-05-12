import { Extension } from '@tiptap/core';
import type { Editor, Range } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionOptions, SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import type { Instance as TippyInstance } from 'tippy.js';
import { SlashMenu } from '../components/SlashMenu';
import type { SlashMenuHandle } from '../components/SlashMenu';

export interface SlashCommandItem {
  label: string;
  description: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

function buildRenderer() {
  let component: ReactRenderer<SlashMenuHandle> | null = null;
  let popup: TippyInstance[] | null = null;

  return {
    onStart(props: SuggestionProps<SlashCommandItem>) {
      component = new ReactRenderer(SlashMenu, {
        props: { items: props.items, command: props.command },
        editor: props.editor,
      });

      if (!props.clientRect) return;

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect as () => DOMRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },

    onUpdate(props: SuggestionProps<SlashCommandItem>) {
      component?.updateProps({ items: props.items, command: props.command });
      if (!props.clientRect) return;
      popup?.[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
    },

    onKeyDown(props: SuggestionKeyDownProps): boolean {
      if (props.event.key === 'Escape') {
        popup?.[0]?.hide();
        return true;
      }
      return component?.ref?.onKeyDown(props) ?? false;
    },

    onExit() {
      popup?.[0]?.destroy();
      component?.destroy();
      component = null;
      popup = null;
    },
  };
}

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
          const deliveryUrl = url.replace('/upload/', '/upload/f_auto,q_auto/');
          editor.chain().focus().setImage({ src: deliveryUrl }).run();
        };
        input.click();
      },
    },
  ];
}

export function createSlashCommandExtension(uploadEndpoint: string) {
  const items = buildSlashItems(uploadEndpoint);

  return Extension.create<{ suggestion: Partial<SuggestionOptions<SlashCommandItem>> }>({
    name: 'slashCommand',

    addOptions() {
      return { suggestion: {} };
    },

    addProseMirrorPlugins() {
      return [
        Suggestion<SlashCommandItem>({
          editor: this.editor,
          char: '/',
          items: ({ query }) =>
            items.filter((item) =>
              item.label.toLowerCase().includes(query.toLowerCase()),
            ),
          command: ({ editor, range, props }) => props.command({ editor, range }),
          render: buildRenderer,
        }),
      ];
    },
  });
}

export type { Editor, Range };
