'use client';

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const btnStyle: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  padding: '0.4rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-ink)',
  background: 'transparent',
  cursor: 'pointer',
  textDecoration: 'none',
};

export function ShareButtons({ title }: { title: string }) {
  const handleCopy = () => {
    void navigator.clipboard.writeText(window.location.href);
  };

  const emailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`;

  return (
    <div className="mt-2 flex gap-2">
      <button type="button" onClick={handleCopy} style={btnStyle} aria-label="Copy link">
        <LinkIcon />
      </button>
      <a href={emailHref} style={btnStyle} aria-label="Share via email">
        <EmailIcon />
      </a>
    </div>
  );
}
