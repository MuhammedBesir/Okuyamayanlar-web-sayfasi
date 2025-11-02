import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isAdminPath = nextUrl.pathname.startsWith("/admin")
  const isAuthPath = nextUrl.pathname.startsWith("/auth")
  const isProfilePath = nextUrl.pathname.startsWith("/profile")

  // Redirect to signin if not logged in and trying to access protected routes
  if (!isLoggedIn && (isAdminPath || isProfilePath)) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check if user is admin for admin routes
  if (isAdminPath && isLoggedIn && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl.origin))
  }

  // Redirect to home if logged in and trying to access auth pages
  if (isLoggedIn && isAuthPath) {
    return NextResponse.redirect(new URL("/", nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png, logo.jpg (favicon files)
     * - uploads (public uploads folder)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.png|logo.jpg|uploads|.*\\..*).+)"
  ],
}
