import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"
import bcrypt from "bcryptjs"

// GET /api/admin/users - Get all admin users
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only SUPER_ADMIN and ADMIN can view all users
    if (admin.role === "MANAGER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    // Get all admin users
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(admins)
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create a new admin user
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only SUPER_ADMIN can create new admin users
    if (admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    const { email, password, role } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if email is already in use
    const existingAdmin = await prisma.admin.findUnique({
      where: {
        email,
      },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "ADMIN",
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(newAdmin, { status: 201 })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    )
  }
}
