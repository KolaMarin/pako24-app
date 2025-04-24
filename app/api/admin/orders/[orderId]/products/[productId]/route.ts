import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ProductLink } from "@/lib/types"
import { recalculateOrderTotals } from "@/lib/prisma-utils"

export async function PATCH(request: Request, { params }: { params: { orderId: string; productId: string } }) {
  try {
    // Ensure we await params before accessing properties
    const { orderId, productId } = await params
    const updatedProduct = await request.json()
    
    // Check if the order and product exist
    const productLink = await prisma.productLink.findFirst({
      where: {
        id: productId,
        orderId: orderId
      }
    })
    
    if (!productLink) {
      return NextResponse.json({ error: "Porosia ose produkti nuk u gjet" }, { status: 404 })
    }
    
    // Update only the allowed product link fields
    await prisma.productLink.update({
      where: { id: productId },
      data: {
        url: updatedProduct.url,
        quantity: updatedProduct.quantity,
        size: updatedProduct.size,
        color: updatedProduct.color,
        priceGBP: updatedProduct.priceGBP,
        priceEUR: updatedProduct.priceEUR,
        customsFee: updatedProduct.customsFee,
        transportFee: updatedProduct.transportFee
      }
    })
    
    // Recalculate order totals
    const updatedOrder = await recalculateOrderTotals(orderId)
    
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Failed to update product details:", error)
    return NextResponse.json({ error: "Përditësimi i detajeve të produktit dështoi" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { orderId: string; productId: string } }) {
  try {
    // Ensure we await params before accessing properties
    const { orderId, productId } = await params
    
    // Check if the order and product exist
    const productLink = await prisma.productLink.findFirst({
      where: {
        id: productId,
        orderId: orderId
      }
    })
    
    if (!productLink) {
      return NextResponse.json({ error: "Porosia ose produkti nuk u gjet" }, { status: 404 })
    }

    // Count products in order
    const productCount = await prisma.productLink.count({
      where: { orderId }
    })

    if (productCount === 1) {
      // This is the last product - delete the entire order
      await prisma.order.delete({
        where: { id: orderId }
      })
      return NextResponse.json({ message: "Porosia u fshi me sukses" })
    } else {
      // Delete just the product
      await prisma.productLink.delete({
        where: { id: productId }
      })
      
      // Recalculate order totals
      const updatedOrder = await recalculateOrderTotals(orderId)
      return NextResponse.json(updatedOrder)
    }
  } catch (error) {
    console.error("Failed to delete product:", error)
    return NextResponse.json({ error: "Fshirja e produktit dështoi" }, { status: 500 })
  }
}
