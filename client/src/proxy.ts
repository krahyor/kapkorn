/**
 * Authentication Proxy (Next.js 16)
 * Route protection and authentication checks for admin panel using NextAuth v5
 * Note: Renamed from middleware.ts to proxy.ts per Next.js 16 convention
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { ROUTES } from '@/constants';
import { PUBLIC_ROUTES } from './constants/routes';

/**
 * Check if the route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Middleware function to protect routes using NextAuth
 */
export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isAuthenticated = !!request.auth?.user;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    // If user is authenticated and trying to access login, redirect to returnUrl or dashboard
    if (pathname === ROUTES.LOGIN && isAuthenticated) {
      const returnUrl = request.nextUrl.searchParams.get('returnUrl') || ROUTES.DASHBOARD.ROOT;
      return NextResponse.redirect(new URL(returnUrl, request.url));
    }
    return NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  if (!isAuthenticated) {
    // Redirect to login with return URL
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
});

/**
 * Matcher configuration
 * Specify which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
