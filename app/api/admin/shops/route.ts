import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

// GET /api/admin/shops - Get all shops
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all shops with their categories
    const shops = await prisma.shop.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
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

// POST /api/admin/shops - Create a new shop
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission (ADMIN or SUPER_ADMIN)
    if (admin.role === "MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    const { name, description, logoUrl, website, active, categoryId } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Shop name is required" },
        { status: 400 }
      )
    }

    // If categoryId is provided, check if it exists
    if (categoryId) {
      const category = await prisma.shopCategory.findUnique({
        where: { id: categoryId },
      })
      
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400 }
        )
      }
    }

    // Create shop
    const shop = await prisma.shop.create({
      data: {
        name,
        description,
        logoUrl,
        website,
        active: active !== undefined ? active : true,
        categoryId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    console.error("Error creating shop:", error)
    return NextResponse.json(
      { error: "Failed to create shop" },
      { status: 500 }
    )
  }
}
