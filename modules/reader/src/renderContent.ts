import { generateHTML } from '@tiptap/html';
import { JSDOM } from 'jsdom';
import DOMPurify, { type Config } from 'dompurify';
import type { TiptapDocument } from '@lumina/types';
import { readerExtensions } from './extensions';

// Module-level singleton — JSDOM instantiation is expensive; never create per-render.
// Cast via `typeof globalThis` because DOMPurify's WindowLike is
// Pick<typeof globalThis, 'DocumentFragment' | 'Node' | ...>.
const { window: jsdomWindow } = new JSDOM('');
const purify = DOMPurify(jsdomWindow as unknown as typeof globalThis);

const PURIFY_CONFIG: Config = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus'],
  ALLOW_DATA_ATTR: false,
};

export function renderContent(doc: TiptapDocument): string {
  const rawHtml = generateHTML(doc, readerExtensions);
  return purify.sanitize(rawHtml, PURIFY_CONFIG) as string;
}
