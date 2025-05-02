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
        totalFinalPriceEUR: true;
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
  { params }: { params: { customerId: string | Promise<string> } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First ensure params is properly awaited before accessing its properties
    const awaitedParams = await Promise.resolve(params);
    // Explicitly cast to string to satisfy TypeScript
    const customerId = String(awaitedParams.customerId);

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
            totalFinalPriceEUR: true,
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

    // Get all orders for this customer, grouped by status
    const orders = await prisma.order.findMany({
      where: {
        userId: customerId,
      },
      select: {
        status: true,
        totalFinalPriceEUR: true,
      }
    });

    // Calculate total spent across all orders
    const totalSpent = await prisma.order.aggregate({
      where: {
        userId: customerId,
      },
      _sum: {
        totalFinalPriceEUR: true,
      },
    });

    // Initialize order status data with counts and value per status
    type OrderStatusData = {
      count: number;
      totalValue: number;
    };
    
    type OrderStatusesData = Record<Lowercase<OrderStatus>, OrderStatusData>;

    // Initialize the order status data
    const ordersByStatus: OrderStatusesData = {
      pending: { count: 0, totalValue: 0 },
      processing: { count: 0, totalValue: 0 },
      shipped: { count: 0, totalValue: 0 },
      delivered: { count: 0, totalValue: 0 },
      cancelled: { count: 0, totalValue: 0 },
    };

    // Calculate counts and total values per status
    orders.forEach(order => {
      const statusLower = order.status.toLowerCase() as keyof OrderStatusesData;
      if (statusLower in ordersByStatus) {
        ordersByStatus[statusLower].count++;
        // Ensure totalFinalPriceEUR is a number and not null/undefined
        const orderValue = typeof order.totalFinalPriceEUR === 'number' ? order.totalFinalPriceEUR : 0;
        ordersByStatus[statusLower].totalValue += orderValue;
      }
    });

    return NextResponse.json({
      ...customer,
      statistics: {
        totalOrders: customer._count.orders,
        totalSpent: totalSpent._sum.totalFinalPriceEUR || 0,
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
  { params }: { params: { customerId: string | Promise<string> } }
) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First ensure params is properly awaited before accessing its properties
    const awaitedParams = await Promise.resolve(params);
    // Explicitly cast to string to satisfy TypeScript
    const customerId = String(awaitedParams.customerId);
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
