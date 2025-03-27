import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ProductLink } from "@/lib/types"
import { recalculateOrderTotals } from "@/lib/prisma-utils"

export async function PATCH(request: Request, { params }: { params: { orderId: string; productId: string } }) {
  try {
    const updatedProduct = await request.json()
    
    // Check if the order and product exist
    const productLink = await prisma.productLink.findFirst({
      where: {
        id: params.productId,
        orderId: params.orderId
      }
    })
    
    if (!productLink) {
      return NextResponse.json({ error: "Porosia ose produkti nuk u gjet" }, { status: 404 })
    }
    
    // Update the product details
    await prisma.productLink.update({
      where: { id: params.productId },
      data: updatedProduct
    })
    
    // Recalculate order totals
    const updatedOrder = await recalculateOrderTotals(params.orderId)
    
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Failed to update product details:", error)
    return NextResponse.json({ error: "Përditësimi i detajeve të produktit dështoi" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { orderId: string; productId: string } }) {
  try {
    // Check if the order and product exist
    const productLink = await prisma.productLink.findFirst({
      where: {
        id: params.productId,
        orderId: params.orderId
      }
    })
    
    if (!productLink) {
      return NextResponse.json({ error: "Porosia ose produkti nuk u gjet" }, { status: 404 })
    }
    
    // Delete the product
    await prisma.productLink.delete({
      where: { id: params.productId }
    })
    
    // Recalculate order totals
    const updatedOrder = await recalculateOrderTotals(params.orderId)
    
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Failed to delete product:", error)
    return NextResponse.json({ error: "Fshirja e produktit dështoi" }, { status: 500 })
  }
}
