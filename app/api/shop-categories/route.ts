import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/shop-categories - Get all categories ordered by their order field
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.shopCategory.findMany({
      orderBy: {
        order: "asc"
      },
      include: {
        _count: {
          select: {
            shops: {
              where: {
                active: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
