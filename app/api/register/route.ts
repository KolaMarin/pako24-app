import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, phoneNumber, password, location = "Tirana, Albania" } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Përdoruesi me këtë email ose numër telefoni ekziston tashmë" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber,
        password: hashedPassword,
        location
      }
    })

    // In a real application, you would set a session or JWT token here
    return NextResponse.json({ 
      success: true, 
      user: { 
        email: user.email, 
        phoneNumber: user.phoneNumber 
      } 
    })
  } catch (error) {
    console.error("Failed to register user:", error)
    return NextResponse.json({ success: false, error: "Regjistrimi dështoi" }, { status: 500 })
  }
}
