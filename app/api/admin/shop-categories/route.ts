import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

// GET /api/admin/shop-categories - Get all shop categories
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all categories with shop count, ordered by order field
    const categories = await prisma.shopCategory.findMany({
      include: {
        _count: {
          select: { shops: true }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching shop categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch shop categories" },
      { status: 500 }
    )
  }
}

// POST /api/admin/shop-categories - Create a new shop category
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
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }

    // Create new category
    const newCategory = await prisma.shopCategory.create({
      data: {
        name: body.name,
        description: body.description || null,
      }
    })

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error: any) {
    console.error("Error creating shop category:", error)
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create shop category" },
      { status: 500 }
    )
  }
}
