import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"
import bcrypt from "bcryptjs"

// POST /api/admin/change-password - Change current admin user password
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      )
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Get admin with password
    const adminWithPassword = await prisma.admin.findUnique({
      where: {
        id: admin.id,
      },
      select: {
        id: true,
        password: true,
      },
    })

    if (!adminWithPassword) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      adminWithPassword.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect", code: "INVALID_CREDENTIALS" },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update admin password
    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}
