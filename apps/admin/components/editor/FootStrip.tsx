'use client';

interface Props {
  wordCount: number;
  charCount: number;
  readTimeMin: number;
}

export function FootStrip({ wordCount, charCount, readTimeMin }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        border: '1px solid var(--border)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: '12px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--muted-foreground)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', gap: '32px' }}>
        <span>Markdown · ON</span>
        <span>Spellcheck · ON</span>
      </div>
      <div style={{ display: 'flex', gap: '32px' }}>
        <span>{wordCount.toLocaleString()} words</span>
        <span>{charCount.toLocaleString()} chars</span>
        <span>{readTimeMin} min read</span>
      </div>
    </div>
  );
}
