import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: { user: true }
    })
    
    if (!order) {
      return NextResponse.json({ error: "Porosia nuk u gjet" }, { status: 404 })
    }

    if (!order.user) {
      return NextResponse.json({ error: "Përdoruesi nuk u gjet" }, { status: 404 })
    }

    // Here you would integrate with a WhatsApp API to send the confirmation
    // For this example, we'll just simulate sending a message
    console.log(`Sending WhatsApp confirmation to ${order.user.phoneNumber} for order ${order.id}`)

    // In a real application, you would use a WhatsApp API here
    // For example, using the Twilio API for WhatsApp:
    // await twilioClient.messages.create({
    //   body: `Your order ${order.id} has been confirmed. Total: £${order.totalPriceGBP.toFixed(2)}`,
    //   from: 'whatsapp:+14155238886',
    //   to: `whatsapp:${order.user.phoneNumber}`
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to send WhatsApp confirmation:", error)
    return NextResponse.json({ error: "Dërgimi i konfirmimit në WhatsApp dështoi" }, { status: 500 })
  }
}
