import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // We only protect the root '/' and '/api' (except /api/auth)
  const isProtectedPath = pathname === '/' || pathname.startsWith('/api/');
  const isAuthPath = pathname.startsWith('/api/auth');

  if (isProtectedPath && !isAuthPath) {
    const hasSession = request.cookies.has('device_session');

    if (!hasSession) {
      // Fast path: if the cookie isn't even present, immediately redirect to login.
      // We don't bother hitting the database because we know it's unauthorized.
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
