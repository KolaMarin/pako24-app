import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"
import bcrypt from "bcryptjs"

// GET /api/admin/me - Get current admin user information
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return admin user information (excluding password)
    return NextResponse.json({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    })
  } catch (error) {
    console.error("Error fetching current admin:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin information" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/me - Update current admin user information
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { email } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if email is already in use by a different user
    const emailExists = await prisma.admin.findFirst({
      where: {
        email,
        id: {
          not: admin.id,
        },
      },
    })

    if (emailExists) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      )
    }

    // Update admin user
    const updatedAdmin = await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        email,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedAdmin)
  } catch (error) {
    console.error("Error updating admin:", error)
    return NextResponse.json(
      { error: "Failed to update admin information" },
      { status: 500 }
    )
  }
}
