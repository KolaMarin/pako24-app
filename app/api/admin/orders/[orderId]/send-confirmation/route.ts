import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOrderConfirmationToCustomer, type CustomerConfirmationData } from "@/lib/email-service"

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: { 
        user: true,
        productLinks: true
      }
    })
    
    if (!order) {
      return NextResponse.json({ error: "Porosia nuk u gjet" }, { status: 404 })
    }

    if (!order.user) {
      return NextResponse.json({ error: "Përdoruesi nuk u gjet" }, { status: 404 })
    }

    // Send email confirmation to customer
    try {
      const emailData: CustomerConfirmationData = {
        orderId: order.id,
        customerEmail: order.user.email,
        customerName: order.user.email.split('@')[0], // Use part before @ as name
        products: order.productLinks.map((link) => ({
          url: link.url,
          quantity: link.quantity,
          size: link.size,
          color: link.color,
          priceEUR: link.priceEUR,
          title: link.title || undefined,
        })),
        totalFinalPriceEUR: order.totalFinalPriceEUR,
        createdAt: order.createdAt,
      }
      
      const emailSent = await sendOrderConfirmationToCustomer(emailData)
      
      if (emailSent) {
        console.log(`Order confirmation email sent successfully to ${order.user.email}`)
        return NextResponse.json({ success: true, message: "Emaili i konfirmimit u dërgua me sukses" })
      } else {
        throw new Error("Failed to send email")
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError)
      return NextResponse.json({ error: "Dërgimi i emailit të konfirmimit dështoi" }, { status: 500 })
    }
  } catch (error) {
    console.error("Failed to send order confirmation:", error)
    return NextResponse.json({ error: "Dërgimi i konfirmimit dështoi" }, { status: 500 })
  }
}
