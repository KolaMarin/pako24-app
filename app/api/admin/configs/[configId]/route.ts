import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

// GET /api/admin/configs/[configId] - Get a specific configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { configId: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { configId } = params

    // Get configuration
    const config = await prisma.appConfig.findUnique({
      where: {
        id: configId,
      },
    })

    if (!config) {
      return NextResponse.json({ error: "Configuration not found" }, { status: 404 })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error fetching configuration:", error)
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/configs/[configId] - Update a configuration
export async function PATCH(
  request: NextRequest,
  { params }: { params: { configId: string } }
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

    const { configId } = params
    const body = await request.json()
    const { value, description } = body

    // Check if configuration exists
    const existingConfig = await prisma.appConfig.findUnique({
      where: {
        id: configId,
      },
    })

    if (!existingConfig) {
      return NextResponse.json({ error: "Configuration not found" }, { status: 404 })
    }

    // Update configuration
    const updatedConfig = await prisma.appConfig.update({
      where: {
        id: configId,
      },
      data: {
        value: value !== undefined ? value : undefined,
        description: description !== undefined ? description : undefined,
      },
    })

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error("Error updating configuration:", error)
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/configs/[configId] - Delete a configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { configId: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission (SUPER_ADMIN only)
    if (admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { configId } = params

    // Check if configuration exists
    const existingConfig = await prisma.appConfig.findUnique({
      where: {
        id: configId,
      },
    })

    if (!existingConfig) {
      return NextResponse.json({ error: "Configuration not found" }, { status: 404 })
    }

    // Delete configuration
    await prisma.appConfig.delete({
      where: {
        id: configId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting configuration:", error)
    return NextResponse.json(
      { error: "Failed to delete configuration" },
      { status: 500 }
    )
  }
}
