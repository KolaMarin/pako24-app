import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, phoneNumber, location, oldPassword, newPassword } = await request.json()
    
    // Get the session cookie from the request
    const cookieHeader = request.headers.get("cookie")
    const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) acc[key] = value
      return acc
    }, {} as Record<string, string>) || {}
    
    const sessionId = cookies["session"]
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Ju nuk jeni të identifikuar" },
        { status: 401 }
      )
    }
    
    // Find the user by session ID
    const user = await prisma.user.findUnique({
      where: { id: sessionId }
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Përdoruesi nuk u gjet" },
        { status: 404 }
      )
    }
    
    // Prepare update data
    const updateData: any = {
      email,
      phoneNumber,
      location
    }
    
    // If password change is requested
    if (oldPassword && newPassword) {
      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Fjalëkalimi i vjetër është i pasaktë" },
          { status: 400 }
        )
      }
      
      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10)
    }
    
    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })
    
    return NextResponse.json({
      success: true,
      user: {
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        location: updatedUser.location
      }
    })
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json(
      { success: false, error: "Përditësimi i të dhënave dështoi" },
      { status: 500 }
    )
  }
}
