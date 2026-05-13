import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Inter, Bebas_Neue } from 'next/font/google';
import { getTenantBySubdomain, getSettings } from '@lumina/db/queries';
import { resolveToCssVars } from '@lumina/reader';
import type { Database } from '@lumina/types';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' });

const getTenant = cache(async (subdomain: string) => {
  const client = createClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );
  return getTenantBySubdomain(client, subdomain);
});

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const subdomain = headerStore.get('x-lumina-subdomain') ?? '';
  const tenant = await getTenant(subdomain);
  return { title: tenant?.name ?? 'Journal' };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const subdomain = headerStore.get('x-lumina-subdomain') ?? '';

  if (!subdomain) notFound();

  const client = createClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );

  const [tenant, settings] = await Promise.all([
    getTenantBySubdomain(client, subdomain),
    (async () => {
      const t = await getTenantBySubdomain(client, subdomain);
      if (!t) return null;
      return getSettings(client, t.id);
    })(),
  ]);

  if (!tenant) notFound();

  const themeVars = settings ? resolveToCssVars(settings.theme_config) : '';
  const brandName = tenant.name.toUpperCase();
  const year = new Date().getFullYear();

  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <head>
        {themeVars && <style dangerouslySetInnerHTML={{ __html: themeVars }} />}
      </head>
      <body>
        {/* ── Nav ───────────────────────────────────────────────────── */}
        <header
          style={{ borderBottom: '1px solid var(--color-border)' }}
          className="flex h-[60px] items-center justify-between px-6"
        >
          <a href="/" className="flex items-center gap-3 no-underline">
            <span
              style={{
                background: 'var(--color-ink)',
                color: 'var(--color-surface)',
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                letterSpacing: '0.02em',
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
              aria-hidden
            >
              {brandName.slice(0, 2)}
            </span>
            <span
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em', fontSize: '1.1rem' }}
            >
              {brandName}
            </span>
          </a>
        </header>

        {children}

        {/* ── Footer ────────────────────────────────────────────────── */}
        <footer
          style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-ink-muted)' }}
          className="flex flex-col items-center justify-between gap-4 px-6 py-6 text-xs uppercase tracking-widest sm:flex-row"
        >
          <a href="/" aria-label="Home">
            <span
              style={{
                background: 'var(--color-ink)',
                color: 'var(--color-surface)',
                fontFamily: 'var(--font-display)',
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs"
            >
              {brandName.slice(0, 2)}
            </span>
          </a>
          <nav className="flex gap-6">
            <a href="/privacy" style={{ color: 'inherit' }}>Privacy</a>
            <a href="/terms" style={{ color: 'inherit' }}>Terms</a>
            <a href="/sitemap.xml" style={{ color: 'inherit' }}>RSS</a>
          </nav>
          <span>© {year} {brandName}. All rights reserved.</span>
        </footer>
      </body>
    </html>
  );
}
