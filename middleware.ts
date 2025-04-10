import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")
  const isAdminLoginPage = request.nextUrl.pathname === "/admin/login"
  const isAdminApiRoute = request.nextUrl.pathname.startsWith("/api/admin")
  const isAdminLoginApiRoute = request.nextUrl.pathname === "/api/admin/login"

  // Protect admin pages (except login page)
  if ((isAdminPage && !isAdminLoginPage) || (isAdminApiRoute && !isAdminLoginApiRoute)) {
    // Check for admin session cookie
    const adminSession = request.cookies.get("admin_session")?.value
    
    if (!adminSession) {
      // Redirect API requests to 401 response
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
      
      // Redirect page requests to login
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
    
    // In a real app, you would verify the session token here
    // For example, by checking it against a database of valid sessions
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
