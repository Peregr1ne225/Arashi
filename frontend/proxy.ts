import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('accessToken');
    const { pathname } = request.nextUrl;

    // Define protected routes
    const protectedRoutes = ['/account', '/checkout', '/orders'];

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) &&
        !pathname.startsWith('/checkout/success') &&
        !pathname.startsWith('/checkout/cancel');

    if (isProtectedRoute && !token) {
        // Redirect to login page if no token is found
        const loginUrl = new URL('/login', request.url);
        // Optional: Add redirect param to return after login
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images|placeholder.jpg).*)',
    ],
};
