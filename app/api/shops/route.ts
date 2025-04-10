import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/shops - Get all active shops for users
export async function GET(request: NextRequest) {
  try {
    // Get all active shops with their categories
    const shops = await prisma.shop.findMany({
      where: {
        active: true
      },
      include: {
        category: true
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(shops)
  } catch (error) {
    console.error("Error fetching shops:", error)
    return NextResponse.json(
      { error: "Failed to fetch shops" },
      { status: 500 }
    )
  }
}
