import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

// GET /api/admin/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get date range from query parameters
    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get("from")
      ? new Date(searchParams.get("from") as string)
      : new Date(new Date().setDate(new Date().getDate() - 30)) // Default to last 30 days
    const toDate = searchParams.get("to")
      ? new Date(searchParams.get("to") as string)
      : new Date() // Default to today

    // Ensure toDate is at the end of the day
    toDate.setHours(23, 59, 59, 999)

    // Get orders within date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        productLinks: true,
      },
    })

    // Calculate analytics data
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPriceEUR, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Count orders by status
    const pendingOrders = orders.filter((order) => order.status === "PENDING").length
    const processingOrders = orders.filter((order) => order.status === "PROCESSING").length
    const shippedOrders = orders.filter((order) => order.status === "SHIPPED").length
    const deliveredOrders = orders.filter((order) => order.status === "DELIVERED").length
    const cancelledOrders = orders.filter((order) => order.status === "CANCELLED").length

    // Group orders by date
    const dailyOrdersMap = new Map()
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0]
      if (!dailyOrdersMap.has(date)) {
        dailyOrdersMap.set(date, { count: 0, revenue: 0 })
      }
      dailyOrdersMap.get(date).count += 1
      dailyOrdersMap.get(date).revenue += order.totalPriceEUR
    })

    const dailyOrders = Array.from(dailyOrdersMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      revenue: data.revenue,
    }))

    // Get top products
    const productCounts = new Map()
    orders.forEach((order) => {
      order.productLinks.forEach((product) => {
        if (!productCounts.has(product.url)) {
          productCounts.set(product.url, 0)
        }
        productCounts.set(product.url, productCounts.get(product.url) + product.quantity)
      })
    })

    const topProducts = Array.from(productCounts.entries())
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Get top 10 products

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      dailyOrders,
      topProducts,
    })
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}
