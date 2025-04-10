import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

// GET /api/admin/shops/[shopId] - Get a specific shop
export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shopId } = params

    // Get shop with its category
    const shop = await prisma.shop.findUnique({
      where: {
        id: shopId,
      },
      include: {
        category: true,
      },
    })

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    return NextResponse.json(shop)
  } catch (error) {
    console.error("Error fetching shop:", error)
    return NextResponse.json(
      { error: "Failed to fetch shop" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/shops/[shopId] - Update a shop
export async function PATCH(
  request: NextRequest,
  { params }: { params: { shopId: string } }
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

    const { shopId } = params
    const body = await request.json()
    const { name, description, logoUrl, website, active, categoryId } = body

    // Check if shop exists
    const existingShop = await prisma.shop.findUnique({
      where: {
        id: shopId,
      },
    })

    if (!existingShop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    // If categoryId is provided, check if it exists
    if (categoryId !== undefined) {
      if (categoryId !== null) {
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
    }

    // Update shop
    const updatedShop = await prisma.shop.update({
      where: {
        id: shopId,
      },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        website: website !== undefined ? website : undefined,
        active: active !== undefined ? active : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error("Error updating shop:", error)
    return NextResponse.json(
      { error: "Failed to update shop" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/shops/[shopId] - Delete a shop
export async function DELETE(
  request: NextRequest,
  { params }: { params: { shopId: string } }
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

    const { shopId } = params

    // Check if shop exists
    const existingShop = await prisma.shop.findUnique({
      where: {
        id: shopId,
      },
    })

    if (!existingShop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    // Delete shop
    await prisma.shop.delete({
      where: {
        id: shopId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting shop:", error)
    return NextResponse.json(
      { error: "Failed to delete shop" },
      { status: 500 }
    )
  }
}
