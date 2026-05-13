'use client';

function LinkIcon() {
  return (
    <svg viewBox="0 0 20 10" fill="none" aria-hidden="true">
      <path d="M5 0a5 5 0 0 0 0 10h2v-2H5a3 3 0 1 1 0-6h2V0H5Zm10 0h-2v2h2a3 3 0 1 1 0 6h-2v2h2a5 5 0 0 0 0-10ZM6 4h8v2H6V4Z" fill="currentColor" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 20 16" fill="none" aria-hidden="true">
      <path d="M2 0h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2Zm0 4v10h16V4l-8 5L2 4Zm0-2 8 5 8-5H2Z" fill="currentColor" />
    </svg>
  );
}

export function ShareButtons({ title }: { title: string }) {
  const handleCopy = () => {
    void navigator.clipboard.writeText(window.location.href);
  };

  const emailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`;

  return (
    <>
      <button type="button" onClick={handleCopy} className="share__btn" aria-label="Copy link" title="Copy link">
        <LinkIcon />
      </button>
      <a href={emailHref} className="share__btn" aria-label="Share via email" title="Email">
        <EmailIcon />
      </a>
    </>
  );
}
