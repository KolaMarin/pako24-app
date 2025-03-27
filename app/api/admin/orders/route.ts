import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

export async function GET() {
  try {
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
