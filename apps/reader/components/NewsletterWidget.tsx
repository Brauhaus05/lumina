'use client';

export function NewsletterWidget() {
  return (
    <div
      style={{ background: 'var(--color-surface-dark)', color: 'var(--color-surface)' }}
      className="p-6"
    >
      <h3
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em', fontSize: '1.4rem' }}
        className="mb-3 uppercase"
      >
        Newsletter
      </h3>
      <p style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.75 }} className="mb-6">
        Dispatches from the editorial desk. Sent bi-weekly. No fluff, just structure.
      </p>
      <label
        style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.6 }}
        className="mb-2 block uppercase"
      >
        Email Address
      </label>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder=""
          style={{
            background: 'transparent',
            border: '1px solid rgba(232,227,211,0.3)',
            color: 'var(--color-surface)',
            width: '100%',
            padding: '0.5rem 0.75rem',
            marginBottom: '0.75rem',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            border: '1px solid rgba(232,227,211,0.5)',
            color: 'var(--color-surface)',
            background: 'transparent',
            width: '100%',
            padding: '0.6rem',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
