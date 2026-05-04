import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getTenantBySubdomain, getSettings } from '@lumina/db/queries';
import { resolveToCssVars } from '@lumina/reader';
import type { Database } from '@lumina/types';
import './globals.css';

// Cached tenant resolution — runs once per request, shared across the layout tree
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
  return { title: tenant?.name ?? 'Blog' };
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

  return (
    <html lang="en">
      <head>
        {themeVars && <style dangerouslySetInnerHTML={{ __html: themeVars }} />}
      </head>
      <body>{children}</body>
    </html>
  );
}
