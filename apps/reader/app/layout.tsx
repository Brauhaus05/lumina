import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Anton, Montserrat } from 'next/font/google';
import { getTenantBySubdomain, getSettings } from '@lumina/db/queries';
import { resolveToCssVars } from '@lumina/reader';
import type { Database } from '@lumina/types';
import './globals.css';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton' });
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
});

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
  const brandInitial = `"${brandName.slice(0, 1)}"`;
  const year = new Date().getFullYear();

  return (
    <html lang="en" className={`${anton.variable} ${montserrat.variable}`}>
      <head>
        {themeVars && <style dangerouslySetInnerHTML={{ __html: themeVars }} />}
      </head>
      <body>
        <div className="page" style={{ '--brand-initial': brandInitial } as React.CSSProperties}>
          <header className="site-header">
            <div className="site-header__inner">
              <div className="brand">
                <div className="brand__mark" aria-hidden />
                <a href="/" className="brand__name">{brandName}</a>
              </div>
              <nav className="nav">
                <a href="/">Journal</a>
              </nav>
            </div>
          </header>

          {children}

          <footer className="site-footer">
            <a href="/" aria-label="Home">
              <div className="foot-mark" aria-hidden />
            </a>
            <nav className="foot-links">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/sitemap.xml">RSS</a>
            </nav>
            <div className="foot-copy">© {year} {brandName} · All rights reserved</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
