import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"
import bcrypt from "bcryptjs"
import { OrderStatus, Prisma } from "@prisma/client"

type UserWithOrdersAndCount = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    phoneNumber: true;
    location: true;
    isBlocked: true;
    createdAt: true;
    updatedAt: true;
    orders: {
      select: {
        id: true;
        status: true;
        createdAt: true;
        totalPriceGBP: true;
      };
      orderBy: {
        createdAt: "desc";
      };
      take: 5;
    };
    _count: {
      select: {
        orders: true;
      };
    };
  };
}>;

// GET /api/admin/customers/[customerId] - Get customer details
export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { customerId } = params

    // Get customer details including order statistics
    const customer = await prisma.user.findUnique({
      where: {
        id: customerId,
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        location: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            totalPriceGBP: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    }) as UserWithOrdersAndCount | null

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    // Calculate order statistics
    const orderStatistics = await prisma.order.groupBy({
      where: {
        userId: customerId,
      },
      by: ["status"],
      _count: {
        _all: true,
      },
    })

    // Calculate total spent
    const totalSpent = await prisma.order.aggregate({
      where: {
        userId: customerId,
        status: {
          in: ["DELIVERED", "SHIPPED"],
        },
      },
      _sum: {
        totalPriceGBP: true,
      },
    })

    type OrderStatusesLower = Record<Lowercase<OrderStatus>, number>;

    // Initialize the order status counters
    const ordersByStatus: OrderStatusesLower = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }

    // Update with the actual counts
    orderStatistics.forEach(stat => {
      const statusLower = stat.status.toLowerCase() as keyof OrderStatusesLower;
      if (statusLower in ordersByStatus) {
        ordersByStatus[statusLower] = stat._count._all;
      }
    });

    return NextResponse.json({
      ...customer,
      statistics: {
        totalOrders: customer._count.orders,
        totalSpent: totalSpent._sum.totalPriceGBP || 0,
        ordersByStatus,
      },
      _count: undefined,
    })
  } catch (error) {
    console.error("Error fetching customer details:", error)
    return NextResponse.json(
      { error: "Failed to fetch customer details" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/customers/[customerId] - Update customer details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { customerId } = params
    const body = await request.json()
    const { isBlocked, password } = body

    // Check if customer exists
    const existingCustomer = await prisma.user.findUnique({
      where: {
        id: customerId,
      },
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: Prisma.UserUpdateInput = {}

    if (isBlocked !== undefined) {
      updateData.isBlocked = isBlocked
    }

    if (password) {
      // Hash the new password
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update customer
    const updatedCustomer = await prisma.user.update({
      where: {
        id: customerId,
      },
      data: updateData,
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        location: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    )
  }
}
