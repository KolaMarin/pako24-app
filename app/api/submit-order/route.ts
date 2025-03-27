import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { ProductLink } from "@/lib/types"
import { recalculateOrderTotals } from "@/lib/prisma-utils"

export async function POST(request: Request) {
  try {
    const { productLinks } = await request.json()

    // In a real application, you would get the user from the session or JWT token
    const mockUser = await prisma.user.findUnique({
      where: { email: "user@example.com" }
    })

    if (!mockUser) {
      return NextResponse.json({ success: false, error: "Përdoruesi nuk u gjet" }, { status: 401 })
    }

    // Create order with product links and initial zero totals
    const order = await prisma.order.create({
      data: {
        userId: mockUser.id,
        status: "PENDING",
        totalPriceGBP: 0,
        totalPriceEUR: 0,
        totalCustomsFee: 0,
        totalTransportFee: 0,
        productLinks: {
          create: productLinks.map((link: ProductLink) => ({
            url: link.url,
            quantity: link.quantity,
            size: link.size,
            color: link.color,
            priceGBP: link.priceGBP,
            priceEUR: link.priceEUR,
            customsFee: link.customsFee,
            transportFee: link.transportFee
          }))
        }
      },
      include: {
        productLinks: true
      }
    })

    // Recalculate order totals
    const updatedOrder = await recalculateOrderTotals(order.id)
    
    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error("Failed to submit order:", error)
    return NextResponse.json({ success: false, error: "Dërgimi i porosisë dështoi" }, { status: 500 })
  }
}
