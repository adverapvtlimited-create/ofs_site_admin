import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect all routes except the secret login path and authentication endpoints
  const isSecretAuthPath = pathname === '/ofs-secure-entry' || pathname === '/secure-bypass' || pathname.startsWith('/api/auth');

  if (!isSecretAuthPath) {
    const hasSession = request.cookies.has('device_session');
    const hasBypass = request.cookies.has('bypass');

    if (!hasSession && !hasBypass) {
      // Security by Obscurity: Silently return a 404 Not Found for ALL unauthorized traffic
      // This completely hides the existence of the admin portal from the public
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
      
      // Rewrite the URL to a non-existent path to trigger Next.js default 404
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


