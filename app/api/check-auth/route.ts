import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  // Get the session cookie from the request
  const cookieHeader = request.headers.get("cookie")
  const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    if (key && value) acc[key] = value
    return acc
  }, {} as Record<string, string>) || {}
  
  const sessionId = cookies["session"]
  
  if (!sessionId) {
    return NextResponse.json(null)
  }
  
  // Find the user by session ID (which is the user ID)
  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionId }
    })
    
    if (user && !user.isBlocked) {
      // Return user data (excluding password) only if user is not blocked
      return NextResponse.json({
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: user.location
      })
    } else {
      // Return null if user doesn't exist or is blocked
      return NextResponse.json(null)
    }
  } catch (error) {
    console.error("Error checking authentication:", error)
    return NextResponse.json(null)
  }
}
