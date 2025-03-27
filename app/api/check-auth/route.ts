import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  // In a real application, you would check the session or JWT token here
  // For this example, we'll just return a mock authenticated user
  const mockUser = await prisma.user.findUnique({
    where: { email: "user@example.com" }
  })

  if (mockUser) {
    return NextResponse.json({ email: mockUser.email, phoneNumber: mockUser.phoneNumber })
  } else {
    return NextResponse.json(null)
  }
}
