'use client';

interface MetaFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  flex?: string;
}

function MetaField({ label, value, onChange, placeholder, flex = '1' }: MetaFieldProps) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '12px 16px',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        flex,
        cursor: 'text',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--muted-foreground)',
        }}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: 'transparent',
          border: 0,
          outline: 'none',
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '0.04em',
          color: 'var(--foreground)',
          padding: 0,
          width: '100%',
        }}
      />
    </label>
  );
}

interface Props {
  section: string;
  onSectionChange: (v: string) => void;
  slug: string;
  onSlugChange: (v: string) => void;
  issue: string;
  onIssueChange: (v: string) => void;
}

export function MetaRow({ section, onSectionChange, slug, onSlugChange, issue, onIssueChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <MetaField
        label="Section"
        value={section}
        onChange={onSectionChange}
        placeholder="Architecture & Design"
        flex="0 0 240px"
      />
      <MetaField
        label="Slug"
        value={slug}
        onChange={onSlugChange}
        placeholder="/the-article-slug"
        flex="1"
      />
      <MetaField
        label="Issue"
        value={issue}
        onChange={onIssueChange}
        placeholder="No. 01"
        flex="0 0 140px"
      />
    </div>
  );
}
