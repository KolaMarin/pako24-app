import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

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

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id
      }
    })

    if (!order) {
      return NextResponse.json({ success: false, error: "Porosia nuk u gjet" }, { status: 404 })
    }

    // Check if order can be cancelled (only PENDING orders can be cancelled)
    if (order.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "Porosia nuk mund të anulohet" }, { status: 400 })
    }

    // Update order status to CANCELLED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to cancel order:", error)
    return NextResponse.json({ success: false, error: "Anulimi i porosisë dështoi" }, { status: 500 })
  }
}
