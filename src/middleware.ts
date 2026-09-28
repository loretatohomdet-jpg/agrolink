import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define route protection rules
  const isFarmerRoute = pathname.startsWith('/farmer');
  const isBuyerRoute = pathname.startsWith('/buyer');
  const isAdminRoute = pathname.startsWith('/admin');
  const isSharedProtectedRoute = pathname.startsWith('/messages') || pathname.startsWith('/transactions');

  const token = request.cookies.get('token')?.value;

  // If trying to access any protected route
  if (isFarmerRoute || isBuyerRoute || isAdminRoute || isSharedProtectedRoute) {
    if (!token) {
      // Redirect to login if token is missing
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Decode JWT payload (part 1: header, part 2: payload, part 3: signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token structure');
      }

      // Decode base64url payload
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(base64);
      const user = JSON.parse(decodedPayload);

      // Check expiration
      if (user.exp && Date.now() >= user.exp * 1000) {
        throw new Error('Token expired');
      }

      // Role-based authorization checks
      if (isFarmerRoute && user.role !== 'farmer') {
        return NextResponse.redirect(new URL(user.role === 'buyer' ? '/buyer/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/onboarding', request.url));
      }

      if (isBuyerRoute && user.role !== 'buyer') {
        return NextResponse.redirect(new URL(user.role === 'farmer' ? '/farmer/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/onboarding', request.url));
      }

      if (isAdminRoute && user.role !== 'admin') {
        return NextResponse.redirect(new URL(user.role === 'farmer' ? '/farmer/dashboard' : user.role === 'buyer' ? '/buyer/dashboard' : '/onboarding', request.url));
      }

    } catch (error) {
      // Clear token and redirect to login if token is invalid or expired
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // If logged in and trying to access landing login/register screens, redirect to their dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const user = JSON.parse(atob(base64));
        
        if (user.exp && Date.now() < user.exp * 1000) {
          if (user.role === 'farmer') {
            return NextResponse.redirect(new URL('/farmer/dashboard', request.url));
          } else if (user.role === 'buyer') {
            return NextResponse.redirect(new URL('/buyer/dashboard', request.url));
          } else if (user.role === 'admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
          }
        }
      }
    } catch (e) {}
  }

  return NextResponse.next();
}

// Specify the paths where middleware should run
export const config = {
  matcher: [
    '/farmer/:path*',
    '/buyer/:path*',
    '/admin/:path*',
    '/messages/:path*',
    '/transactions/:path*',
    '/login',
    '/register'
  ]
};
