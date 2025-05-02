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

    // Get date range and status from query parameters
    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get("from")
      ? new Date(searchParams.get("from") as string)
      : new Date(new Date().setDate(new Date().getDate() - 30)) // Default to last 30 days
    const toDate = searchParams.get("to")
      ? new Date(searchParams.get("to") as string)
      : new Date() // Default to today
    const statusFilter = searchParams.get("status") || null

    // Ensure toDate is at the end of the day
    toDate.setHours(23, 59, 59, 999)

    // Build the query conditions
    const whereCondition: any = {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      }
    }

    // Add status filter if provided, otherwise keep the original behavior of excluding CANCELLED orders
    if (statusFilter) {
      whereCondition.status = statusFilter
    } else {
      whereCondition.status = {
        not: "CANCELLED"  // Exclude cancelled orders from calculations by default
      }
    }

    // Get orders within date range and with status filter if provided
    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        productLinks: true,
      },
    })

    // Calculate analytics data
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPriceEUR, 0)
    const totalCustomsFees = orders.reduce((sum, order) => sum + order.totalCustomsFee, 0)
    const totalTransportFees = orders.reduce((sum, order) => sum + order.totalTransportFee, 0)
    
    // Calculate total final revenue correctly, ensuring consistency
    const totalFinalRevenue = orders.reduce((sum, order) => {
      // If totalFinalPriceEUR exists, use it; otherwise calculate it from components
      const finalPrice = order.totalFinalPriceEUR !== null && order.totalFinalPriceEUR !== undefined
        ? order.totalFinalPriceEUR
        : (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee);
      return sum + finalPrice;
    }, 0)
    
    const totalPriceGBP = orders.reduce((sum, order) => sum + order.totalPriceGBP, 0)
    
    // Calculate percentages for revenue breakdown, ensuring we don't divide by zero
    const baseRevenuePct = totalFinalRevenue > 0 ? (totalRevenue / totalFinalRevenue) * 100 : 0
    const customsFeesPct = totalFinalRevenue > 0 ? (totalCustomsFees / totalFinalRevenue) * 100 : 0
    const transportFeesPct = totalFinalRevenue > 0 ? (totalTransportFees / totalFinalRevenue) * 100 : 0
    
    const averageOrderValue = totalOrders > 0 ? totalFinalRevenue / totalOrders : 0

    // Count orders by status and calculate actual total values per status
    // If we have a status filter, we only need to count the filtered orders
    // Otherwise, get all orders including CANCELLED ones for status counting
    const allOrdersWithCancelled = statusFilter 
      ? orders
      : await prisma.order.findMany({
          where: {
            createdAt: {
              gte: fromDate,
              lte: toDate,
            }
          }
        });
    
    // Group orders by status and calculate actual totals
    const pendingOrdersList = allOrdersWithCancelled.filter((order) => order.status === "PENDING");
    const processingOrdersList = allOrdersWithCancelled.filter((order) => order.status === "PROCESSING");
    const shippedOrdersList = allOrdersWithCancelled.filter((order) => order.status === "SHIPPED");
    const deliveredOrdersList = allOrdersWithCancelled.filter((order) => order.status === "DELIVERED");
    const cancelledOrdersList = allOrdersWithCancelled.filter((order) => order.status === "CANCELLED");
    
    // Count of orders per status
    const pendingOrders = pendingOrdersList.length;
    const processingOrders = processingOrdersList.length;
    const shippedOrders = shippedOrdersList.length;
    const deliveredOrders = deliveredOrdersList.length;
    const cancelledOrders = cancelledOrdersList.length;
    
    // Calculate actual total value for each status using totalFinalPriceEUR or fallback to calculated total
    const pendingOrdersValue = pendingOrdersList.reduce((sum, order) => {
      const finalPrice = order.totalFinalPriceEUR !== null && order.totalFinalPriceEUR !== undefined
        ? order.totalFinalPriceEUR
        : (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee);
      return sum + finalPrice;
    }, 0);
    
    const processingOrdersValue = processingOrdersList.reduce((sum, order) => {
      const finalPrice = order.totalFinalPriceEUR !== null && order.totalFinalPriceEUR !== undefined
        ? order.totalFinalPriceEUR
        : (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee);
      return sum + finalPrice;
    }, 0);
    
    const shippedOrdersValue = shippedOrdersList.reduce((sum, order) => {
      const finalPrice = order.totalFinalPriceEUR !== null && order.totalFinalPriceEUR !== undefined
        ? order.totalFinalPriceEUR
        : (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee);
      return sum + finalPrice;
    }, 0);
    
    const deliveredOrdersValue = deliveredOrdersList.reduce((sum, order) => {
      const finalPrice = order.totalFinalPriceEUR !== null && order.totalFinalPriceEUR !== undefined
        ? order.totalFinalPriceEUR
        : (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee);
      return sum + finalPrice;
    }, 0);
    
    // Cancelled orders value is 0 since they're cancelled
    const cancelledOrdersValue = 0;

    // Group orders by date with correct revenue calculation
    const dailyOrdersMap = new Map()
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0]
      if (!dailyOrdersMap.has(date)) {
        dailyOrdersMap.set(date, { count: 0, revenue: 0 })
      }
      
      // Use the total final price for revenue calculation
      const finalPrice = order.totalFinalPriceEUR !== null && order.totalFinalPriceEUR !== undefined
        ? order.totalFinalPriceEUR
        : (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee);
        
      dailyOrdersMap.get(date).count += 1
      dailyOrdersMap.get(date).revenue += finalPrice
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

    // Calculate daily financial metrics with consistent calculations
    const dailyFinancialMetricsMap = new Map()
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0]
      if (!dailyFinancialMetricsMap.has(date)) {
        dailyFinancialMetricsMap.set(date, { 
          baseRevenue: 0, 
          customsFees: 0, 
          transportFees: 0,
          totalRevenue: 0,
          count: 0 
        })
      }
      const dailyData = dailyFinancialMetricsMap.get(date)
      
      // Calculate the finalPrice consistently
      const finalPrice = order.totalFinalPriceEUR !== null && order.totalFinalPriceEUR !== undefined
        ? order.totalFinalPriceEUR
        : (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee);
      
      dailyData.baseRevenue += order.totalPriceEUR
      dailyData.customsFees += order.totalCustomsFee
      dailyData.transportFees += order.totalTransportFee
      dailyData.totalRevenue += finalPrice
      dailyData.count += 1
    })

    const dailyFinancialMetrics = Array.from(dailyFinancialMetricsMap.entries()).map(([date, data]) => ({
      date,
      baseRevenue: data.baseRevenue,
      customsFees: data.customsFees,
      transportFees: data.transportFees,
      totalRevenue: data.totalRevenue,
      count: data.count
    }))

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalCustomsFees,
      totalTransportFees,
      totalFinalRevenue,
      totalPriceGBP,
      baseRevenuePct,
      customsFeesPct,
      transportFeesPct,
      averageOrderValue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      pendingOrdersValue,
      processingOrdersValue,
      shippedOrdersValue,
      deliveredOrdersValue,
      cancelledOrdersValue,
      dailyOrders,
      dailyFinancialMetrics,
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
