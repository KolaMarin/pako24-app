import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/configs/timestamp - Get the latest config update timestamp
export async function GET() {
  try {
    // Get the most recent configuration update timestamp
    const latestConfig = await prisma.appConfig.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        updatedAt: true,
      },
    })

    const lastUpdated = latestConfig?.updatedAt 
      ? new Date(latestConfig.updatedAt).getTime() 
      : Date.now()

    return NextResponse.json({ lastUpdated })
  } catch (error) {
    console.error("Error fetching config timestamp:", error)
    return NextResponse.json(
      { error: "Failed to fetch config timestamp" },
      { status: 500 }
    )
  }
}
