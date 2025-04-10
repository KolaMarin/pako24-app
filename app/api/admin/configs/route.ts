import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

// GET /api/admin/configs - Get all configuration items
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all configurations
    const configs = await prisma.appConfig.findMany({
      orderBy: {
        key: "asc",
      },
    })

    return NextResponse.json(configs)
  } catch (error) {
    console.error("Error fetching configurations:", error)
    return NextResponse.json(
      { error: "Failed to fetch configurations" },
      { status: 500 }
    )
  }
}

// POST /api/admin/configs - Create a new configuration item
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
    const { key, value, description } = body

    // Validate required fields
    if (!key || !value) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existingConfig = await prisma.appConfig.findUnique({
      where: {
        key,
      },
    })

    if (existingConfig) {
      return NextResponse.json(
        { error: "Configuration key already exists" },
        { status: 400 }
      )
    }

    // Create configuration
    const config = await prisma.appConfig.create({
      data: {
        key,
        value,
        description,
      },
    })

    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    console.error("Error creating configuration:", error)
    return NextResponse.json(
      { error: "Failed to create configuration" },
      { status: 500 }
    )
  }
}
