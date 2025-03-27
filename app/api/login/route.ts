import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { success: false, error: "Email ose fjalëkalimi është i pasaktë" },
        { status: 401 }
      )
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location: user.location
    })
    
    // Set a session cookie
    response.cookies.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/"
    })

    return response
  } catch (error) {
    console.error("Login failed:", error)
    return NextResponse.json(
      { success: false, error: "Identifikimi dështoi" },
      { status: 500 }
    )
  }
}
