import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")
  const isAdminLoginPage = request.nextUrl.pathname === "/admin/login"

  if (isAdminPage && !isAdminLoginPage) {
    const adminAuthenticated = request.cookies.get("adminAuthenticated")?.value === "true"

    if (!adminAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

