// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. PERMITIR SIEMPRE recursos estáticos
  if (
    pathname.startsWith('/_next') ||
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
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }
  
  // 3. Verificar autenticación
  // IMPORTANTE: Asegúrate que el nombre de la cookie coincida con lo que estableces en login
  const authToken = request.cookies.get('auth-token')?.value
  
  console.log('🔐 Verificando autenticación para:', pathname)
  console.log('🔐 Token presente:', !!authToken)
  
  // 4. Si NO está autenticado, redirigir a login (no a register)
  if (!authToken) {
    console.log('🚫 No autenticado, redirigiendo a /login')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 5. Si ESTÁ autenticado y está intentando acceder a login/register, redirigir al dashboard
  if (authToken && publicRoutes.includes(pathname)) {
    console.log('✅ Ya autenticado, redirigiendo a /dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}