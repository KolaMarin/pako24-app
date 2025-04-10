import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

// GET /api/admin/shop-categories/[categoryId] - Get a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { categoryId } = params

    // Get category with shops
    const category = await prisma.shopCategory.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        shops: true,
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/shop-categories/[categoryId] - Update a category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
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

    const { categoryId } = params
    const body = await request.json()
    const { name, description } = body

    // Check if category exists
    const existingCategory = await prisma.shopCategory.findUnique({
      where: {
        id: categoryId,
      },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Update category
    const updatedCategory = await prisma.shopCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error: any) {
    console.error("Error updating category:", error)
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/shop-categories/[categoryId] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
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

    const { categoryId } = params

    // Check if category exists
    const existingCategory = await prisma.shopCategory.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        shops: true,
      },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Delete category (shops will be automatically set to null for categoryId due to onDelete: SetNull)
    await prisma.shopCategory.delete({
      where: {
        id: categoryId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}
