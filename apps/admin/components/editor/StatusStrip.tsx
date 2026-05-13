'use client';

import type { SaveSignal } from '@lumina/editor';

interface Props {
  status: 'draft' | 'published';
  saveSignal: SaveSignal;
  wordCount: number;
  readTimeMin: number;
  entryNumber?: number;
  version?: number;
}

const SAVE_LABEL: Record<SaveSignal, string> = {
  idle: 'Autosave on',
  saving: 'Saving…',
  saved: 'Autosave on',
  error: 'Save failed',
};

export function StatusStrip({ status, saveSignal, wordCount, readTimeMin, entryNumber, version }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'var(--foreground)',
        color: 'var(--background)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: '12px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--background)',
              display: 'inline-block',
              animation: 'lumina-pulse 1.6s ease-in-out infinite',
            }}
            aria-hidden
          />
          {status === 'draft' ? 'Draft' : 'Published'}
          {entryNumber !== undefined && ` · Entry ${entryNumber}`}
        </span>
        <span>{SAVE_LABEL[saveSignal]}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span>Words {wordCount.toLocaleString()}</span>
        <span>Read {readTimeMin} min</span>
        {version !== undefined && <span>v {String(version).padStart(2, '0')}</span>}
      </div>

      <style>{`
        @keyframes lumina-pulse {
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
