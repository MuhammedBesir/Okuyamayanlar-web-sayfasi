import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // API routes ve statik dosyalar için middleware'i atla
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/uploads')
  ) {
    return NextResponse.next()
  }

  // Auth durumunu cookie'den kontrol et
  const sessionToken = request.cookies.get('next-auth.session-token') || 
                       request.cookies.get('__Secure-next-auth.session-token')
  
  const isLoggedIn = !!sessionToken
  const isAdminPath = pathname.startsWith("/admin")
  const isAuthPath = pathname.startsWith("/auth")
  const isProfilePath = pathname.startsWith("/profile")

  // Korunan sayfalara giriş yapmadan erişim engelle
  if (!isLoggedIn && (isAdminPath || isProfilePath)) {
    const url = new URL("/auth/signin", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Auth sayfalarına giriş yapmış kullanıcı erişemez
  if (isLoggedIn && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon, logo (icon files)
     * - uploads (uploaded files)
     */
    "/((?!api|_next/static|_next/image|favicon|logo|uploads).*)"
  ],
}
