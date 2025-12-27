// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. ALWAYS ALLOW static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/images/') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.jpeg') ||
    pathname.includes('.gif') ||
    pathname.includes('.svg') ||
    pathname.includes('.ico') ||
    pathname.includes('.webp') ||
    pathname.includes('.css') ||
    pathname.includes('.js')
  ) {
    return NextResponse.next()
  }

  // 2. Public routes that are always accessible
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

  // 3. Check authentication
  const authToken = request.cookies.get('auth-token')?.value

  // 4. If NOT authenticated and NOT on a public route, redirect to login
  if (!authToken && !publicRoutes.includes(pathname)) {
    const loginUrl = new URL('/login', request.url)
    // Add the original pathname as a query param for redirect after login
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // 5. If authenticated and trying to access login/register, redirect to dashboard
  if (authToken && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
