import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // In a real application, you would get the user from the session
    // For now, we'll use the same mock user email as before
    const mockUser = await prisma.user.findUnique({
      where: { email: "user@example.com" }
    })

    if (!mockUser) {
      return NextResponse.json({ success: false, error: "Përdoruesi nuk u gjet" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: mockUser.id },
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
