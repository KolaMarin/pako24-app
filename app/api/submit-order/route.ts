import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { ProductLink } from "@/lib/types"
import { recalculateOrderTotals } from "@/lib/prisma-utils"
import { sendOrderNotificationToAdmin, type OrderNotificationData } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const { productLinks } = await request.json()

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

    // Create order with product links and initial zero totals
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "PENDING",
        totalPriceGBP: 0,
        totalPriceEUR: 0,
        totalCustomsFee: 0,
        totalTransportFee: 0,
        totalFinalPriceEUR: 0, // Add the missing required field
        productLinks: {
          create: productLinks.map((link: ProductLink) => {

            return {
              url: link.url,
              quantity: link.quantity,
              size: link.size,
              color: link.color,
              priceGBP: link.priceGBP,
              priceEUR: link.priceEUR,
              customsFee: link.customsFee,
              transportFee: link.transportFee,
              title: link.title // Add title here
            };
          })
        }
      },
      include: {
        productLinks: true
      }
    })

    // Recalculate order totals
    const updatedOrder = await recalculateOrderTotals(order.id)
    
    // Send email notification to admin
    try {
      const emailData: OrderNotificationData = {
        orderId: updatedOrder.id,
        customerEmail: user.email,
        customerPhone: user.phoneNumber,
        products: updatedOrder.productLinks.map((link) => ({
          url: link.url,
          quantity: link.quantity,
          size: link.size,
          color: link.color,
          priceEUR: link.priceEUR,
          priceGBP: link.priceGBP,
          customsFee: link.customsFee,
          transportFee: link.transportFee,
          title: link.title || undefined,
        })),
        totalPriceEUR: updatedOrder.totalPriceEUR,
        totalPriceGBP: updatedOrder.totalPriceGBP,
        totalCustomsFee: updatedOrder.totalCustomsFee,
        totalTransportFee: updatedOrder.totalTransportFee,
        totalFinalPriceEUR: updatedOrder.totalFinalPriceEUR,
        createdAt: updatedOrder.createdAt,
      }
      
      const emailSent = await sendOrderNotificationToAdmin(emailData)
      if (emailSent) {
        console.log('Order notification email sent successfully')
      } else {
        console.error('Failed to send order notification email')
      }
    } catch (emailError) {
      console.error('Error sending order notification email:', emailError)
      // Don't fail the order creation if email fails
    }
    
    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    // Ensure error is properly formatted before logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error("Failed to submit order:", { message: errorMessage })
    return NextResponse.json({ success: false, error: "Dërgimi i porosisë dështoi" }, { status: 500 })
  }
}
