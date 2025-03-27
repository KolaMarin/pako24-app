import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    // In a real application, you would get the user from the session
    const mockUser = await prisma.user.findUnique({
      where: { email: "user@example.com" }
    })

    if (!mockUser) {
      return NextResponse.json({ success: false, error: "Përdoruesi nuk u gjet" }, { status: 401 })
    }

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: mockUser.id
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
