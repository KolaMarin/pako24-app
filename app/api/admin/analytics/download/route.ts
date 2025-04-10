import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminAuth } from "@/lib/admin-auth"

// GET /api/admin/analytics/download - Download analytics data in various formats
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get date range and format from query parameters
    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get("from")
      ? new Date(searchParams.get("from") as string)
      : new Date(new Date().setDate(new Date().getDate() - 30)) // Default to last 30 days
    const toDate = searchParams.get("to")
      ? new Date(searchParams.get("to") as string)
      : new Date() // Default to today
    const format = searchParams.get("format") || "csv" // Default to CSV

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

    // Format data based on requested format
    let data: string | Buffer
    let contentType: string
    let fileName: string

    switch (format.toLowerCase()) {
      case "csv":
        data = generateCSV(orders)
        contentType = "text/csv"
        fileName = `analytics-report-${fromDate.toISOString().split("T")[0]}-to-${toDate.toISOString().split("T")[0]}.csv`
        break
      case "excel":
        // In a real application, you would use a library like exceljs to generate Excel files
        // For this example, we'll just return a CSV with a different extension
        data = generateCSV(orders)
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        fileName = `analytics-report-${fromDate.toISOString().split("T")[0]}-to-${toDate.toISOString().split("T")[0]}.xlsx`
        break
      case "pdf":
        // In a real application, you would use a library like PDFKit to generate PDF files
        // For this example, we'll just return a simple HTML that could be rendered as PDF
        data = generateHTML(orders)
        contentType = "application/pdf"
        fileName = `analytics-report-${fromDate.toISOString().split("T")[0]}-to-${toDate.toISOString().split("T")[0]}.pdf`
        break
      default:
        return NextResponse.json(
          { error: "Unsupported format" },
          { status: 400 }
        )
    }

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

// Helper function to generate CSV data
function generateCSV(orders: any[]): string {
  // CSV header
  let csv = "Order ID,Date,Customer Email,Customer Phone,Status,Total (EUR),Total (GBP),Products Count\n"

  // Add rows for each order
  orders.forEach((order) => {
    const row = [
      order.id,
      new Date(order.createdAt).toISOString().split("T")[0],
      order.user.email,
      order.user.phoneNumber,
      order.status,
      order.totalPriceEUR.toFixed(2),
      order.totalPriceGBP.toFixed(2),
      order.productLinks.length,
    ]
    csv += row.join(",") + "\n"
  })

  return csv
}

// Helper function to generate HTML data (for PDF)
function generateHTML(orders: any[]): string {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Analytics Report</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>Analytics Report</h1>
      <p>Date Range: ${new Date(orders[0]?.createdAt || Date.now()).toISOString().split("T")[0]} to ${new Date(orders[orders.length - 1]?.createdAt || Date.now()).toISOString().split("T")[0]}</p>
      <h2>Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total (EUR)</th>
            <th>Products</th>
          </tr>
        </thead>
        <tbody>
  `

  // Add rows for each order
  orders.forEach((order) => {
    html += `
      <tr>
        <td>${order.id}</td>
        <td>${new Date(order.createdAt).toISOString().split("T")[0]}</td>
        <td>${order.user.email}</td>
        <td>${order.status}</td>
        <td>€${order.totalPriceEUR.toFixed(2)}</td>
        <td>${order.productLinks.length}</td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
      <h2>Summary</h2>
      <p>Total Orders: ${orders.length}</p>
      <p>Total Revenue: €${orders.reduce((sum, order) => sum + order.totalPriceEUR, 0).toFixed(2)}</p>
    </body>
    </html>
  `

  return html
}
