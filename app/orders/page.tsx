"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Layout from "@/components/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { useConfigStore } from "@/lib/config-store" // Already imported, no change needed here, but good to confirm
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Clock,
  ExternalLink,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  AlertCircle,
  Search,
  Download,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { OrderTimeline } from "@/components/order-timeline"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AuthModal } from "@/components/auth-modal"

interface ProductLink {
  url: string
  quantity: number
  size: string
  color: string
  priceGBP?: number
  priceEUR?: number
  customsFee?: number
  transportFee?: number
  imageUrl?: string
  isHeavy?: boolean
  title?: string // Add optional title field
}

interface Order {
  id: string
  createdAt: string
  updatedAt: string
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  productLinks: ProductLink[]
  additionalInfo?: string
  totalPriceGBP?: number
  totalPriceEUR?: number
  totalCustomsFee?: number
  totalTransportFee?: number
  totalFinalPriceEUR?: number
  estimatedDelivery?: string
  trackingNumber?: string
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder] = useState<"newest">("newest")
  const [isMobile, setIsMobile] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { configs } = useConfigStore() // Get configs from the store

  useEffect(() => {
    // Check if we're on mobile (for styling purposes only)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    // Only fetch orders if user is logged in
    if (!user) {
      return;
    }
    
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/orders")
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        } else {
          throw new Error("Failed to fetch orders")
        }
      } catch (error) {
        toast({
          title: "Gabim",
          description: "Marrja e porosive dështoi. Ju lutemi provoni përsëri.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user, router])

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return

    try {
      const response = await fetch("/api/cancel-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: selectedOrderId }),
      })

      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.id === selectedOrderId ? { ...order, status: "CANCELLED" } : order)),
        )
        toast({
          title: "Sukses",
          description: "Porosia u anulua me sukses.",
        })
      } else {
        throw new Error("Failed to cancel order")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Anulimi i porosisë dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setShowCancelDialog(false)
      setSelectedOrderId(null)
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500"
      case "PROCESSING":
        return "bg-blue-500"
      case "SHIPPED":
        return "bg-purple-500"
      case "DELIVERED":
        return "bg-green-500"
      case "CANCELLED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "Në pritje"
      case "PROCESSING":
        return "Në proces"
      case "SHIPPED":
        return "Dërguar"
      case "DELIVERED":
        return "Dorëzuar"
      case "CANCELLED":
        return "Anuluar"
      default:
        return status
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "PROCESSING":
        return <Package className="h-4 w-4" />
      case "SHIPPED":
        return <Truck className="h-4 w-4" />
      case "DELIVERED":
        return <CheckCircle2 className="h-4 w-4" />
      case "CANCELLED":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Function to generate and download the order invoice
  const generateOrderInvoice = (order: Order) => {
    try {
      // Open a new window for the invoice
      const invoiceWindow = window.open("", "_blank")
      if (!invoiceWindow) {
        toast({
          title: "Gabim",
          description: "Nuk mund të hapet dritarja e faturës. Ju lutemi kontrolloni bllokuesin e pop-up.",
          variant: "destructive",
        })
        return
      }

      // Current date formatted
      const currentDate = new Date().toLocaleDateString()
      
      // Get the configurations from the store
      const configs = useConfigStore.getState().configs
      
      // Write the invoice HTML
      invoiceWindow.document.write(`
        <html>
        <head>
          <title>Faturë - Porosi #${order.id.slice(0, 8)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 1px solid #eee;
            }
            .company-details {
              text-align: right;
            }
            .company-logo {
              display: flex;
              align-items: center;
              margin-bottom: 5px;
            }
            .company-name-primary {
              color: #2563eb;
              font-weight: 800;
              font-size: 20px;
            }
            .company-name-secondary {
              color: #64748b;
              font-weight: 800;
              font-size: 20px;
            }
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #2563eb;
            }
            .order-details {
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            .text-right {
              text-align: right;
            }
            .totals {
              width: 300px;
              margin-left: auto;
              margin-bottom: 40px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .final-total {
              font-weight: bold;
              border-top: 2px solid #ddd;
              padding-top: 10px;
              font-size: 18px;
              color: #2563eb;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .product-url {
              color: #2563eb;
              text-decoration: none;
              word-break: break-all;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              color: white;
            }
            .package-icon {
              display: inline-block;
              width: 24px;
              height: 24px;
              margin-right: 8px;
              color: #64748b;
            }
            .status-PENDING { background-color: #f59e0b; }
            .status-PROCESSING { background-color: #3b82f6; }
            .status-SHIPPED { background-color: #8b5cf6; }
            .status-DELIVERED { background-color: #22c55e; }
            .status-CANCELLED { background-color: #ef4444; }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <div>
                <div class="invoice-title">FATURË</div>
                <div>Datë: ${currentDate}</div>
                <div>Porosi ID: #${order.id.slice(0, 8)}</div>
                <div style="margin-top: 10px;">
                  Statusi: <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
                </div>
              </div>
              <div class="company-details">
                <div style="display: flex; justify-content: flex-end;">
                  <div class="company-logo">
                    <svg class="package-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    <span class="company-name-primary">PAKO</span><span class="company-name-secondary">24</span>
                  </div>
                </div>
                <div>${configs.COMPANY_EMAIL}</div>
                <div>${configs.COMPANY_PHONE}</div>
                <div>${configs.COMPANY_ADDRESS}</div>
              </div>
            </div>

            <div class="order-details">
              <div><strong>Data e porosisë:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>

            <h3>Produktet</h3>
            <table>
              <thead>
                <tr>
                  <th>Nr.</th>
                  <th>Produkti</th>
                  <th>Sasia</th>
                  <th>Çmimi</th>
                  <th class="text-right">Totali</th>
                </tr>
              </thead>
              <tbody>
                ${order.productLinks.map((product, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>
                      <a href="${product.url}" class="product-url" target="_blank">${product.title || product.url}</a>
                      ${product.size || product.color ? 
                        `<div style="margin-top: 5px; font-size: 12px; color: #666;">
                          ${product.size ? `Madhësia: ${product.size}` : ''}
                          ${product.size && product.color ? ' • ' : ''}
                          ${product.color ? `Ngjyra: ${product.color}` : ''}
                        </div>` : ''
                      }
                    </td>
                    <td>${product.quantity}</td>
                    <td>
                      €${(product.priceEUR || 0).toFixed(2)}
                      ${product.priceGBP ? `<span style="display: block; font-size: 11px; color: #777;">£${product.priceGBP.toFixed(2)}</span>` : ''}
                    </td>
                    <td class="text-right">€${((product.priceEUR || 0) * product.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span>Çmimi bazë:</span>
                <span>€${order.totalPriceEUR?.toFixed(2) || "0.00"}</span>
              </div>
              <div class="total-row">
                <span>Dogana (${(configs.CUSTOMS_FEE_PERCENTAGE * 100).toFixed(0)}%):</span>
                <span>€${order.totalCustomsFee?.toFixed(2) || "0.00"}</span>
              </div>
              <div class="total-row">
                <span>Menaxhimi dhe Transporti (x${order.productLinks.length}):</span>
                <span>€${order.totalTransportFee?.toFixed(2) || "0.00"}</span>
              </div>
              <div class="total-row final-total">
                <span>TOTALI:</span>
                <span>€${order.totalFinalPriceEUR?.toFixed(2) || (
                  (order.totalPriceEUR || 0) + 
                  (order.totalCustomsFee || 0) + 
                  (order.totalTransportFee || 0)
                ).toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              <p>Faleminderit për porosinë tuaj!</p>
              <p>Për çdo pyetje ose nevojë, ju lutemi na kontaktoni në ${configs.COMPANY_EMAIL} ose ${configs.COMPANY_PHONE}</p>
            </div>
          </div>
        </body>
        </html>
      `)
      
      invoiceWindow.document.close()
      
      // Show success message
      toast({
        title: "Sukses",
        description: "Fatura u hap në dritare të re. Mund ta printoni duke përdorur Ctrl+P.",
      })
    } catch (error) {
      console.error("Error generating invoice:", error)
      toast({
        title: "Gabim",
        description: "Gjenerimi i faturës dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    // Filter by search term
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productLinks.some((product) => product.url.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by status
    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Check for newOrder parameter to automatically expand the first (most recent) order
  // but only do it once on initial load
  useEffect(() => {
    const hasNewOrder = searchParams.get('newOrder') === 'true'
    if (hasNewOrder && sortedOrders.length > 0 && !isLoading) {
      // Expand the first order in the list (most recent order)
      setExpandedOrder(sortedOrders[0]?.id || null)
      
      // Remove the query parameter to prevent auto-reopening
      // when the user manually collapses the order
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('newOrder')
        window.history.replaceState({}, '', url.toString())
      }
    }
  }, [searchParams, sortedOrders, isLoading]);

  // If user is not logged in, show login prompt instead of redirecting
  if (!user) {
    return (
      <Layout>
        <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-20">
          {/* Removed title for logged out users */}
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
              <CardContent className="flex flex-col items-center p-6">
                <p className="text-center mb-4 text-gray-700">
                  Ju duhet të identifikoheni për të parë porositë tuaja
                </p>
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Identifikohu
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
        defaultTab="login" 
      />
    </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-20">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-center sm:text-left text-primary">Porositë e Mia</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white shadow-md overflow-hidden">
                <CardHeader className="p-4 pb-2 border-b">
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <div className="flex gap-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
        <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 pb-20">
        {/* Mobile-optimized filters */}
        <Card className="mb-4 sm:mb-6 bg-white shadow-md">
          <CardContent className="p-2 sm:p-3">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Kërko porosi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Tabs defaultValue={statusFilter} onValueChange={setStatusFilter} className="w-full">
                <TabsList className="w-full h-auto flex overflow-x-auto py-1 justify-start gap-1 bg-transparent">
                  <TabsTrigger
                    value="all"
                    className={`px-3 py-1.5 text-xs rounded-full ${statusFilter === "all" ? "bg-primary text-white" : "bg-gray-100"}`}
                  >
                    Të gjitha
                  </TabsTrigger>
                  <TabsTrigger
                    value="PENDING"
                    className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${statusFilter === "PENDING" ? "bg-amber-500 text-white" : "bg-gray-100"}`}
                  >
                    <Clock className="h-3 w-3" />
                    Në pritje
                  </TabsTrigger>
                  <TabsTrigger
                    value="PROCESSING"
                    className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${statusFilter === "PROCESSING" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
                  >
                    <Package className="h-3 w-3" />
                    Në proces
                  </TabsTrigger>
                  <TabsTrigger
                    value="SHIPPED"
                    className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${statusFilter === "SHIPPED" ? "bg-purple-500 text-white" : "bg-gray-100"}`}
                  >
                    <Truck className="h-3 w-3" />
                    Dërguar
                  </TabsTrigger>
                  <TabsTrigger
                    value="DELIVERED"
                    className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${statusFilter === "DELIVERED" ? "bg-green-500 text-white" : "bg-gray-100"}`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Dorëzuar
                  </TabsTrigger>
                  <TabsTrigger
                    value="CANCELLED"
                    className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${statusFilter === "CANCELLED" ? "bg-red-500 text-white" : "bg-gray-100"}`}
                  >
                    <AlertCircle className="h-3 w-3" />
                    Anuluar
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {sortedOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-xl font-medium text-gray-700 mb-1">Nuk keni asnjë porosi</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Nuk u gjet asnjë porosi që përputhet me kriteret e kërkimit."
                    : "Nuk keni bërë ende asnjë porosi. Filloni duke shtuar produkte në porosi."}
                </p>
                {searchTerm || statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                    }}
                  >
                    Pastro filtrat
                  </Button>
                ) : (
                  <Button onClick={() => router.push("/")}>Shko tek Kryefaqja</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            sortedOrders.map((order) => (
              <Card
                key={order.id}
                className={cn(
                  "bg-white shadow-md overflow-hidden transition-all duration-200",
                  expandedOrder === order.id ? "border-primary-300" : "border-gray-200",
                )}
              >
                {/* Order header - always visible */}
                <div className="p-3 sm:p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "px-2 py-1 text-xs sm:text-sm text-white flex items-center gap-1",
                            getStatusColor(order.status),
                          )}
                        >
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </Badge>
                        <h3 className="text-sm sm:text-base font-medium">#{order.id.slice(0, 8)}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                    {order.totalFinalPriceEUR && (
                        <div className="text-right">
                          <div className="font-medium text-primary text-base sm:text-lg">€{order.totalFinalPriceEUR.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{order.productLinks.length} produkte</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Timeline - always visible */}
                {order.status !== "CANCELLED" ? (
                  <div className="px-3 py-3 bg-gray-50 border-b">
                    <OrderTimeline
                      status={order.status}
                      createdAt={order.createdAt}
                      updatedAt={order.updatedAt}
                      estimatedDelivery={order.estimatedDelivery}
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 border-b">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm text-red-600 font-medium">Kjo porosi është anuluar</p>
                        <p className="text-xs text-red-500">
                          Anuluar më: {new Date(order.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products section with accordion */}
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  value={expandedOrder === order.id ? "products" : ""}
                  onValueChange={(value) => {
                    setExpandedOrder(value === "products" ? order.id : null)
                  }}
                >
                  <AccordionItem value="products" className="border-b-0">
                    <AccordionTrigger className="px-3 py-3 sm:py-2 hover:no-underline hover:bg-gray-50">
                      <span className="flex items-center gap-2 text-sm sm:text-base font-medium w-full">
                        <ShoppingBag className="h-5 w-5 sm:h-4 sm:w-4 text-primary" />
                        <span className="flex-1">Produktet ({order.productLinks.length})</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-3">
                      <div className="space-y-3">
                        {order.productLinks.map((product, index) => (
                            <div
                            key={index}
                            className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden p-3 mb-2 w-full"
                          >
                            <div className="flex items-center gap-3">
                              {/* Package icon - no border, aligned left with no padding */}
                              <div className="flex-shrink-0 flex items-center justify-center mr-1.5">
                                <Package className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-primary" />
                              </div>

                              {/* Product details - better mobile layout */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap justify-between items-start gap-1 mb-1">
                                  {/* Display Title if available, otherwise URL - larger text for mobile */}
                                  {product.title ? (
                                    <span className="text-sm sm:text-xs font-medium text-gray-800 truncate max-w-full sm:max-w-[300px] block">
                                      {product.title}
                                    </span>
                                  ) : (
                                    <a
                                      href={product.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-medium text-primary hover:text-primary/80 hover:underline truncate max-w-[300px]"
                                    >
                                      {isMobile ? (
                                        <>
                                          {product.url.substring(0, 20)}...
                                          <ExternalLink className="inline h-3 w-3 ml-1" />
                                        </>
                                      ) : (
                                        <>
                                          {product.url}
                                          <ExternalLink className="inline h-3 w-3 ml-1" />
                                        </>
                                      )}
                                    </a>
                                  )}
                                  {/* Show URL below title if title exists */}
                                  {product.title && (
                                     <a
                                      href={product.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-gray-500 hover:text-primary/80 hover:underline truncate max-w-[200px] block mt-0.5"
                                    >
                                      {isMobile ? (
                                        <>
                                          {product.url.substring(0, 20)}...
                                          <ExternalLink className="inline h-3 w-3 ml-1" />
                                        </>
                                      ) : (
                                        <>
                                          {product.url}
                                          <ExternalLink className="inline h-3 w-3 ml-1" />
                                        </>
                                      )}
                                    </a>
                                  )}

                                  {/* Product price on the right */}
                                  {product.priceEUR && (
                                    <span className="text-xs font-medium text-primary">
                                      €{(product.priceEUR || 0).toFixed(2)}
                                      {!isMobile && (
                                        <span className="text-xs text-gray-500 ml-1">
                                          ({product.quantity} copë)
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>

                                {/* Product attributes with separators */}
                                <div className="flex flex-wrap items-center text-xs mt-1 border-b border-gray-100 pb-1.5">
                                  <span>
                                    <span className="text-gray-500">Sasia:</span> {product.quantity}
                                  </span>
                                  <span className="mx-1.5 text-gray-300">•</span>
                                  {product.size && (
                                    <span>
                                      <span className="text-gray-500">Madhësia:</span> {product.size}
                                    </span>
                                  )}
                                  {product.size && product.color && <span className="mx-1.5 text-gray-300">•</span>}
                                  {product.color && (
                                    <span>
                                      <span className="text-gray-500">Ngjyra:</span> {product.color}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Additional info if present */}
                      {order.additionalInfo && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <h4 className="text-sm font-medium mb-1">Informacion shtesë:</h4>
                          <p className="text-sm text-gray-600">{order.additionalInfo}</p>
                        </div>
                      )}

                      {/* Order summary - using database values */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <h4 className="text-sm sm:text-base font-medium mb-2">Përmbledhje e Porosisë</h4>
                        <div className="space-y-2 text-sm bg-gray-50 p-3 sm:p-4 rounded-md">
                          {/* Base price total */}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Çmimi bazë:</span>
                            <div>
                              <span className="font-medium">
                                €{order.totalPriceEUR?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                          </div>
                          {/* Customs fee total */}
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Dogana ({configs.CUSTOMS_FEE_PERCENTAGE ? `${(configs.CUSTOMS_FEE_PERCENTAGE * 100).toFixed(0)}%` : 'N/A'}):
                            </span>
                            <span className="font-medium">€{order.totalCustomsFee?.toFixed(2) || "0.00"}</span>
                          </div>
                          {/* Transport fee total */}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Menaxhimi dhe Transporti (x{order.productLinks.length}):</span>
                            <span className="font-medium">€{order.totalTransportFee?.toFixed(2) || "0.00"}</span>
                          </div>
                          {/* Grand total */}
                          <div className="flex justify-between font-medium pt-2 mt-2 border-t border-gray-200">
                            <span className="text-base">Totali:</span>
                            <span className="text-primary text-base">
                              €{order.totalFinalPriceEUR?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Order summary and actions */}
                <div className="p-3 sm:p-4 border-t border-gray-100">
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {order.status === "PENDING" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs sm:text-sm h-9 sm:h-8 px-4"
                        onClick={() => {
                          setSelectedOrderId(order.id)
                          setShowCancelDialog(true)
                        }}
                      >
                        <AlertCircle className="h-4 w-4 mr-1.5 sm:mr-1" />
                        Anulo Porosinë
                      </Button>
                    )}

                    {order.status === "DELIVERED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm h-9 sm:h-8 px-4"
                        onClick={() => {
                          // Handle reorder functionality
                          toast({
                            title: "Porosi e re",
                            description: "Produktet u shtuan në porosi të re.",
                          })
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1.5 sm:mr-1" />
                        Porosit Përsëri
                      </Button>
                    )}

                    {/* Allow invoice download for all orders regardless of status */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm h-9 sm:h-8 px-4"
                      onClick={() => {
                        // Generate and download the invoice
                        generateOrderInvoice(order)
                      }}
                    >
                      <Download className="h-4 w-4 mr-1.5 sm:mr-1" />
                      Shkarko Faturën
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-[90%]">
          <AlertDialogHeader>
            <AlertDialogTitle>Anulo Porosinë</AlertDialogTitle>
            <AlertDialogDescription>
              A jeni të sigurt që dëshironi të anuloni këtë porosi? Ky veprim nuk mund të zhbëhet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setSelectedOrderId(null)} className="mt-0">
              Jo, Mbaje
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelOrder} className="bg-red-500 hover:bg-red-600">
              Po, Anuloje
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  )
}
