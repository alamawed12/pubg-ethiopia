import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API auth routes
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/register') ||
    pathname.startsWith('/api/announcements') ||
    pathname.startsWith('/api/stats') ||
    !pathname.startsWith('/admin')
  ) {
    return NextResponse.next();
  }

  // Check for NextAuth session token using getToken helper
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'pubg-ethiopia-assembly-fallback-secret-2026',
  });

  if (!token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection: Event Scanner staff is restricted ONLY to check-in
  const role = (token.role as string) || '';
  if (role === 'scanner') {
    if (pathname !== '/admin/check-in' && !pathname.startsWith('/admin/check-in')) {
      return NextResponse.redirect(new URL('/admin/check-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
