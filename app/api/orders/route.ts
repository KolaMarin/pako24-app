import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Get the session cookie from the request
    const cookieHeader = request.headers.get("cookie")
    const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) acc[key] = value
      return acc
    }, {} as Record<string, string>) || {}
    
    const sessionId = cookies["session"]
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Ju nuk jeni të identifikuar" },
        { status: 401 }
      )
    }
    
    // Find the user by session ID
    const user = await prisma.user.findUnique({
      where: { id: sessionId }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "Përdoruesi nuk u gjet" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        productLinks: true
      }
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json({ success: false, error: "Marrja e porosive dështoi" }, { status: 500 })
  }
}
