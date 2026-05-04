import { renderContent } from './renderContent';
import type { TiptapDocument } from '@lumina/types';

function makeDoc(html: string): TiptapDocument {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: html }] }],
  };
}

// XSS test vectors — all must be absent from output
const XSS_VECTORS = [
  '<img src=x onerror=alert(1)>',
  '<script>alert(1)</script>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<iframe src="javascript:alert(1)">',
  '<style>body{background:url("javascript:alert(1)")}</style>',
  '<object data="javascript:alert(1)">',
  '<form action="javascript:alert(1)">',
];

describe('renderContent', () => {
  it('renders a basic paragraph without XSS', () => {
    const doc: TiptapDocument = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] }],
    };
    const html = renderContent(doc);
    expect(html).toContain('Hello world');
    expect(html).not.toContain('<script>');
  });

  XSS_VECTORS.forEach((vector) => {
    it(`strips XSS vector: ${vector.slice(0, 40)}`, () => {
      const doc = makeDoc(vector);
      const html = renderContent(doc);
      // The raw attack string must not appear literally in output
      expect(html).not.toContain('<script');
      expect(html).not.toContain('<iframe');
      expect(html).not.toContain('<object');
      expect(html).not.toContain('<form');
      expect(html).not.toContain('onerror=');
      expect(html).not.toContain('onload=');
      expect(html).not.toContain('javascript:alert');
    });
  });
});
