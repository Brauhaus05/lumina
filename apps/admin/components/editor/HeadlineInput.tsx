'use client';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function HeadlineInput({ value, onChange }: Props) {
  return (
    <div
      style={{
        padding: '24px',
        border: '1px solid var(--border)',
        background: 'var(--card)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--muted-foreground)',
          marginBottom: '16px',
        }}
      >
        Headline
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter headline…"
        style={{
          background: 'transparent',
          border: 0,
          outline: 'none',
          fontFamily: 'var(--font-display, var(--font-heading, var(--font-sans)))',
          fontSize: '80px',
          lineHeight: 0.92,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          color: 'var(--foreground)',
          width: '100%',
          padding: 0,
          minHeight: '80px',
          display: 'block',
        }}
      />
    </div>
  );
}
