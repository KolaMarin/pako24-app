import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

// Define a simple type for the order with user information
interface OrderWithUser {
  id: string;
  userId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  totalPriceGBP: number;
  totalPriceEUR: number;
  totalCustomsFee: number;
  totalTransportFee: number;
  additionalInfo?: string | null;
  user: {
    email: string;
    phoneNumber: string;
  };
  productLinks: Array<{
    id: string;
    url: string;
    quantity: number;
    size: string;
    color: string;
    priceGBP: number;
    priceEUR: number;
    customsFee: number;
    transportFee: number;
    orderId: string;
  }>;
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await request.json()
    
    // First delete all product links for this order
    await prisma.productLink.deleteMany({
      where: { orderId }
    })

    // Then delete the order itself
    await prisma.order.delete({
      where: { id: orderId }
    })

    return NextResponse.json({ message: "Porosia u fshi me sukses" })
  } catch (error) {
    console.error("Failed to delete order:", error)
    return NextResponse.json({ error: "Fshirja e porosisë dështoi" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true
          }
        },
        productLinks: true
      }
    })

    const ordersWithUserInfo = orders.map((order: OrderWithUser) => {
      return {
        ...order,
        userEmail: order.user.email,
        userPhoneNumber: order.user.phoneNumber,
        // Remove the user object to maintain the same response structure
        user: undefined
      }
    })

    return NextResponse.json(ordersWithUserInfo)
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json({ error: "Marrja e porosive dështoi" }, { status: 500 })
  }
}
