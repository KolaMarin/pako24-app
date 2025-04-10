import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"
import bcrypt from "bcryptjs"

// GET /api/admin/users/[userId] - Get a specific admin user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only SUPER_ADMIN and ADMIN can view user details
    // Or the user can view their own details
    if (admin.role === "MANAGER" && admin.id !== params.userId) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { userId } = params

    // Get admin user
    const user = await prisma.admin.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching admin user:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin user" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users/[userId] - Update an admin user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params
    
    // Get request body
    const body = await request.json()
    const { email, password, role } = body

    // Check if user exists
    const existingUser = await prisma.admin.findUnique({
      where: {
        id: userId,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Admins can update their own information (email, password) but not role
    // SUPER_ADMIN can update any user's information including role
    // ADMIN can update MANAGER's information including role
    if (
      admin.id !== userId &&
      (admin.role !== "SUPER_ADMIN" && (admin.role !== "ADMIN" || existingUser.role !== "MANAGER"))
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    // For role changes, only SUPER_ADMIN can create/modify ADMIN roles
    if (
      role && 
      role !== existingUser.role && 
      (role === "ADMIN" || role === "SUPER_ADMIN") && 
      admin.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can create ADMIN or SUPER_ADMIN roles" },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (email) {
      // Check if email is already in use by a different user
      const emailExists = await prisma.admin.findFirst({
        where: {
          email,
          id: {
            not: userId,
          },
        },
      })
      
      if (emailExists) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 }
        )
      }
      
      updateData.email = email
    }
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }
    
    if (role && admin.role === "SUPER_ADMIN") {
      updateData.role = role
    }

    // Update user
    const updatedUser = await prisma.admin.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating admin user:", error)
    return NextResponse.json(
      { error: "Failed to update admin user" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[userId] - Delete an admin user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params

    // Check if user exists
    const existingUser = await prisma.admin.findUnique({
      where: {
        id: userId,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only SUPER_ADMIN can delete ADMIN and self
    // ADMIN can delete MANAGER
    if (
      admin.id === userId && admin.role !== "SUPER_ADMIN" ||
      admin.id !== userId && (
        admin.role !== "SUPER_ADMIN" && 
        (admin.role !== "ADMIN" || existingUser.role !== "MANAGER")
      )
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    // Prevent deleting the last SUPER_ADMIN
    if (existingUser.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.admin.count({
        where: {
          role: "SUPER_ADMIN",
        },
      })
      
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last SUPER_ADMIN account" },
          { status: 403 }
        )
      }
    }

    // Delete user
    await prisma.admin.delete({
      where: {
        id: userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return NextResponse.json(
      { error: "Failed to delete admin user" },
      { status: 500 }
    )
  }
}
