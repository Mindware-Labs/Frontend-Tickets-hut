// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. PERMITIR SIEMPRE recursos estáticos y API routes
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

  // 2. Rutas públicas que siempre son accesibles
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

  // 3. Verificar autenticación
  const authToken = request.cookies.get('auth-token')?.value

  // 4. Si NO está autenticado y NO está en una ruta pública, redirigir a login
  if (!authToken && !publicRoutes.includes(pathname)) {
    const loginUrl = new URL('/login', request.url)
    // Agregar el pathname original como query param para redirigir después del login
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // 5. Si ESTÁ autenticado y está intentando acceder a login/register, redirigir al dashboard
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