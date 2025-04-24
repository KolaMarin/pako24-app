import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/configs - Get all public configuration items
export async function GET() {
  try {
    // Get all configurations (no auth required for public configs)
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
