import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

// PUT /api/admin/shop-categories/update-order - Update category orders
export async function PUT(request: NextRequest) {
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
    if (!Array.isArray(body.categories)) {
      return NextResponse.json(
        { error: "Categories array is required" },
        { status: 400 }
      )
    }

    // Validate each category has id and order
    for (const category of body.categories) {
      if (!category.id || typeof category.order !== 'number') {
        return NextResponse.json(
          { error: "Each category must have id and order" },
          { status: 400 }
        )
      }
    }

    // Update category orders in a transaction
    const updatePromises = body.categories.map((category: { id: string, order: number }) =>
      prisma.shopCategory.update({
        where: { id: category.id },
        data: { order: category.order }
      })
    )

    await prisma.$transaction(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating category orders:", error)
    
    return NextResponse.json(
      { error: "Failed to update category orders" },
      { status: 500 }
    )
  }
}
