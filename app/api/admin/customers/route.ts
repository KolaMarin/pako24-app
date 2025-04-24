import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"

// Define types for our query results
type UserWithOrderCount = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    phoneNumber: true;
    location: true;
    isBlocked: true;
    createdAt: true;
    updatedAt: true;
    _count: {
      select: {
        orders: true;
      };
    };
  };
}>;

// GET /api/admin/customers - Get all customers (regular users)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const skip = (page - 1) * limit
    const status = searchParams.get("status") || "all"

    // Build filter conditions
    const whereCondition: any = {}
    
    if (search) {
      whereCondition.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status === "active") {
      whereCondition.isBlocked = false
    } else if (status === "blocked") {
      whereCondition.isBlocked = true
    }

    // Get customers with pagination
    const [customers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          location: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }) as Promise<UserWithOrderCount[]>,
      prisma.user.count({ where: whereCondition }),
    ])

    // Format the response
    const formattedCustomers = customers.map((customer) => ({
      ...customer,
      totalOrders: customer._count.orders,
      _count: undefined,
    }))

    return NextResponse.json({
      customers: formattedCustomers,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}
