'use client';

export function NewsletterWidget() {
  return (
    <div className="newsletter">
      <h3>Dispatches.</h3>
      <p>Notes from the desk. Bi-weekly. No fluff — just structure and the occasional photograph.</p>
      <form onSubmit={(e) => {
        e.preventDefault();
        const btn = (e.target as HTMLFormElement).querySelector('button');
        if (btn) btn.textContent = 'Subscribed ✓';
      }}>
        <input type="email" placeholder="EMAIL ADDRESS" required />
        <button type="submit">Subscribe</button>
      </form>
    </div>
  );
}
