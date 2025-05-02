import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

// GET /api/admin/analytics/download - Download analytics data in CSV format
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get date range, status, and granularity from query parameters
    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get("from")
      ? new Date(searchParams.get("from") as string)
      : new Date(new Date().setDate(new Date().getDate() - 30)) // Default to last 30 days
    const toDate = searchParams.get("to")
      ? new Date(searchParams.get("to") as string)
      : new Date() // Default to today
    const statusFilter = searchParams.get("status") || null
    // New parameter for data granularity: "order" (default) or "product"
    const granularity = searchParams.get("granularity") || "order"

    // Ensure toDate is at the end of the day
    toDate.setHours(23, 59, 59, 999)

    // Build the query conditions
    const whereCondition: any = {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      }
    }

    // Add status filter if provided
    if (statusFilter) {
      whereCondition.status = statusFilter
    }

    // Get orders within date range and with status filter if provided
    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
          },
        },
        productLinks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Generate CSV data based on granularity
    let data
    let fileName
    
    if (granularity === "product") {
      data = generateProductCSV(orders)
      fileName = `product-analytics-${fromDate.toISOString().split("T")[0]}-to-${toDate.toISOString().split("T")[0]}.csv`
    } else {
      data = generateOrderCSV(orders)
      fileName = `order-analytics-${fromDate.toISOString().split("T")[0]}-to-${toDate.toISOString().split("T")[0]}.csv`
    }
    const contentType = "text/csv"

    // Return the data with appropriate headers
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error generating analytics report:", error)
    return NextResponse.json(
      { error: "Failed to generate analytics report" },
      { status: 500 }
    )
  }
}

// Define interfaces for type safety
interface ProductLink {
  id: string;
  url: string;
  quantity: number;
  size: string;
  color: string;
  priceGBP: number;
  priceEUR: number;
  customsFee: number;
  transportFee: number;
  title?: string | null;
  orderId: string;
}

interface User {
  email: string;
  phoneNumber: string;
}

interface Order {
  id: string;
  createdAt: Date;
  status: string;
  totalPriceGBP: number;
  totalPriceEUR: number;
  totalCustomsFee: number;
  totalTransportFee: number;
  totalFinalPriceEUR?: number | null;
  user: User;
  productLinks: ProductLink[];
}

// Helper function to generate order-level CSV data
function generateOrderCSV(orders: Order[]): string {
  // CSV header
  let csv = "Invoice ID,Order ID,Date,Customer Email,Customer Phone,Status,Base Price (EUR),Base Price (GBP),Customs Fee,Transport Fee,Total (EUR),Products Count\n"

  // Add rows for each order
  orders.forEach((order) => {
    const finalTotal = order.totalFinalPriceEUR !== null && order.totalFinalPriceEUR !== undefined
      ? order.totalFinalPriceEUR
      : (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee);
    const shortOrderId = order.id.slice(0, 8); // First 8 characters of UUID for a friendlier ID
    
    // Format the phone number as a string with quotes to prevent scientific notation
    const formattedPhone = `"${order.user.phoneNumber}"`;
    
    const row = [
      shortOrderId, // Invoice ID (shorter, more user-friendly)
      order.id,     // Full Order ID
      new Date(order.createdAt).toISOString().split("T")[0],
      order.user.email,
      formattedPhone,
      order.status,
      `"${order.totalPriceEUR.toFixed(2)}"`, // Quote numeric values to ensure proper formatting
      `"${order.totalPriceGBP.toFixed(2)}"`,
      `"${order.totalCustomsFee.toFixed(2)}"`,
      `"${order.totalTransportFee.toFixed(2)}"`,
      `"${finalTotal.toFixed(2)}"`,
      order.productLinks.length,
    ]
    csv += row.join(",") + "\n"
  })

  return csv
}

// Helper function to generate product-level CSV data
function generateProductCSV(orders: Order[]): string {
  // CSV header
  let csv = "Invoice ID,Order ID,Date,Status,Product URL,Product Title,Quantity,Size,Color,Base Price (EUR),Base Price (GBP),Customs Fee,Transport Fee,Total (EUR)\n"

  // Add rows for each product within each order
  orders.forEach((order) => {
    const shortOrderId = order.id.slice(0, 8); // First 8 characters of UUID for a friendlier ID
    const orderDate = new Date(order.createdAt).toISOString().split("T")[0];

    // For each product in the order
    order.productLinks.forEach((product: ProductLink) => {
      // Calculate product total price
      const productTotal = product.priceEUR + product.customsFee + product.transportFee;
      
      // Format product title with fallback to URL if title is not available
      const productTitle = product.title 
        ? `"${product.title.replace(/"/g, '""')}"` // Escape quotes in title
        : `"${product.url.replace(/"/g, '""')}"`;  // Use URL as fallback
      
      const row = [
        shortOrderId,                      // Invoice ID (shorter, more user-friendly)
        order.id,                          // Full Order ID
        orderDate,                         // Order date
        order.status,                      // Order status
        `"${product.url.replace(/"/g, '""')}"`, // Product URL (escape quotes)
        productTitle,                      // Product title or URL as fallback
        product.quantity,                  // Quantity
        `"${product.size}"`,               // Size
        `"${product.color}"`,              // Color
        `"${product.priceEUR.toFixed(2)}"`,  // Base price EUR
        `"${product.priceGBP.toFixed(2)}"`,  // Base price GBP
        `"${product.customsFee.toFixed(2)}"`, // Customs fee
        `"${product.transportFee.toFixed(2)}"`, // Transport fee
        `"${productTotal.toFixed(2)}"`     // Total for this product
      ]
      csv += row.join(",") + "\n"
    });
  })

  return csv
}

// Helper function to generate HTML data (for PDF)
function generateHTML(orders: Order[]): string {
  // Calculate totals for the summary
  const totalBaseEUR = orders.reduce((sum, order) => sum + order.totalPriceEUR, 0);
  const totalBaseGBP = orders.reduce((sum, order) => sum + order.totalPriceGBP, 0);
  const totalCustomsFees = orders.reduce((sum, order) => sum + order.totalCustomsFee, 0);
  const totalTransportFees = orders.reduce((sum, order) => sum + order.totalTransportFee, 0);
  const totalFinalAmount = orders.reduce((sum, order) => {
    const finalPrice = order.totalFinalPriceEUR !== null && order.totalFinalPriceEUR !== undefined
      ? order.totalFinalPriceEUR
      : (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee);
    return sum + finalPrice;
  }, 0);

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Analytics Report</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .summary-table { margin-top: 30px; }
        .summary-table th { text-align: right; }
        .total-row { font-weight: bold; background-color: #e6f3ff; }
      </style>
    </head>
    <body>
      <h1>Analytics Report</h1>
      <p>Date Range: ${new Date(orders[0]?.createdAt || Date.now()).toISOString().split("T")[0]} to ${new Date(orders[orders.length - 1]?.createdAt || Date.now()).toISOString().split("T")[0]}</p>
      
      <h2>Financial Summary</h2>
      <table class="summary-table">
        <tr>
          <th>Total Base Price (EUR):</th>
          <td>€${totalBaseEUR.toFixed(2)}</td>
        </tr>
        <tr>
          <th>Total Base Price (GBP):</th>
          <td>£${totalBaseGBP.toFixed(2)}</td>
        </tr>
        <tr>
          <th>Total Customs Fees:</th>
          <td>€${totalCustomsFees.toFixed(2)}</td>
        </tr>
        <tr>
          <th>Total Transport & Management Fees:</th>
          <td>€${totalTransportFees.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <th>Final Total Revenue:</th>
          <td>€${totalFinalAmount.toFixed(2)}</td>
        </tr>
      </table>
      
      <h2>Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Order ID</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Base (EUR)</th>
            <th>Base (GBP)</th>
            <th>Customs</th>
            <th>Transport</th>
            <th>Total (EUR)</th>
            <th>Products</th>
          </tr>
        </thead>
        <tbody>
  `

  // Add rows for each order
  orders.forEach((order) => {
    const finalTotal = order.totalFinalPriceEUR !== null && order.totalFinalPriceEUR !== undefined
      ? order.totalFinalPriceEUR
      : (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee);
    const shortOrderId = order.id.slice(0, 8); // First 8 characters for a more user-friendly ID
    
    // Format the phone number for better display
    let phoneNumber = order.user.phoneNumber;
    if (phoneNumber && phoneNumber.length > 9) {
      // Basic formatting for longer phone numbers
      phoneNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
    
    html += `
      <tr>
        <td>${shortOrderId}</td>
        <td>${order.id}</td>
        <td>${new Date(order.createdAt).toISOString().split("T")[0]}</td>
        <td>${order.user.email}</td>
        <td>${phoneNumber}</td>
        <td>${order.status}</td>
        <td>€${order.totalPriceEUR.toFixed(2)}</td>
        <td>£${order.totalPriceGBP.toFixed(2)}</td>
        <td>€${order.totalCustomsFee.toFixed(2)}</td>
        <td>€${order.totalTransportFee.toFixed(2)}</td>
        <td>€${finalTotal.toFixed(2)}</td>
        <td>${order.productLinks.length}</td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
      <h2>Revenue Breakdown</h2>
      <table>
        <tr>
          <th>Revenue Source</th>
          <th>Amount (EUR)</th>
          <th>Percentage</th>
        </tr>
        <tr>
          <td>Base Price</td>
          <td>€${totalBaseEUR.toFixed(2)}</td>
          <td>${totalFinalAmount > 0 ? ((totalBaseEUR / totalFinalAmount) * 100).toFixed(2) : 0}%</td>
        </tr>
        <tr>
          <td>Customs Fees</td>
          <td>€${totalCustomsFees.toFixed(2)}</td>
          <td>${totalFinalAmount > 0 ? ((totalCustomsFees / totalFinalAmount) * 100).toFixed(2) : 0}%</td>
        </tr>
        <tr>
          <td>Transport & Management</td>
          <td>€${totalTransportFees.toFixed(2)}</td>
          <td>${totalFinalAmount > 0 ? ((totalTransportFees / totalFinalAmount) * 100).toFixed(2) : 0}%</td>
        </tr>
        <tr class="total-row">
          <td>Total Revenue</td>
          <td>€${totalFinalAmount.toFixed(2)}</td>
          <td>100%</td>
        </tr>
      </table>
      
      <h2>Summary</h2>
      <p>Total Orders: ${orders.length}</p>
      <p>Total Base Revenue: €${totalBaseEUR.toFixed(2)}</p>
      <p>Total Final Revenue: €${totalFinalAmount.toFixed(2)}</p>
      <p>Profit from Fees: €${(totalCustomsFees + totalTransportFees).toFixed(2)}</p>
    </body>
    </html>
  `

  return html
}
