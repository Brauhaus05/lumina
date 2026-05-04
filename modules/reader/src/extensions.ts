// Reader-side Tiptap extension list.
// MUST exactly match the editor's extension list — divergence causes
// generateHTML() to silently skip unknown node types.
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

export const readerExtensions = [
  StarterKit.configure({ codeBlock: false, horizontalRule: false }),
  Image.configure({ allowBase64: false }),
  CodeBlockLowlight.configure({ lowlight }),
  HorizontalRule,
];
