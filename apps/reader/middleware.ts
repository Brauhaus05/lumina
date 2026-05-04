import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // Extract subdomain from host (e.g. 'acme.lumina.app' → 'acme')
  // In local dev, fall back to NEXT_PUBLIC_DEV_SUBDOMAIN env var
  const devSubdomain = process.env['NEXT_PUBLIC_DEV_SUBDOMAIN'];
  const parts = host.split('.');
  const subdomain =
    parts.length >= 3
      ? (parts[0] ?? devSubdomain ?? '')
      : (devSubdomain ?? '');

  const response = NextResponse.next();
  response.headers.set('x-lumina-subdomain', subdomain);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
