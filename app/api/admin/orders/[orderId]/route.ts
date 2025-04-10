import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { status } = await request.json()
    
    // Check if the order exists
    const order = await prisma.order.findUnique({
      where: { id: params.orderId }
    })
    
    if (!order) {
      return NextResponse.json({ error: "Porosia nuk u gjet" }, { status: 404 })
    }
    
    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.orderId },
      data: { status },
      include: { productLinks: true }
    })
    
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Failed to update order status:", error)
    return NextResponse.json({ error: "Përditësimi i statusit të porosisë dështoi" }, { status: 500 })
  }
}
