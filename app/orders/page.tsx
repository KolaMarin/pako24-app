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
import { cn, formatPriceHTML } from "@/lib/utils"
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
import { Price } from "@/components/ui/price"

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
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login")
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
                      <a href="${product.url}" class="product-url" target="_blank">
                        ${product.title ? product.title : (product.url.length > 60 ? product.url.substring(0, 60) + '...' : product.url)}
                        <svg style="display: inline; width: 12px; height: 12px; margin-left: 4px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15,3 21,3 21,9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                      ${product.title && product.url.length > 60 ? 
                        `<div style="margin-top: 3px; font-size: 10px; color: #888; word-break: break-all;">${product.url.substring(0, 80)}...</div>` : ''
                      }
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
                      ${formatPriceHTML((product.priceEUR || 0) / product.quantity)}
                    </td>
                    <td class="text-right">${formatPriceHTML(product.priceEUR || 0)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span>Çmimi bazë:</span>
                <span>${formatPriceHTML(order.totalPriceEUR || 0)}</span>
              </div>
              <div class="total-row">
                <span>Dogana (${(configs.CUSTOMS_FEE_PERCENTAGE * 100).toFixed(0)}%):</span>
                <span>${formatPriceHTML(order.totalCustomsFee || 0)}</span>
              </div>
              <div class="total-row">
                <span>Menaxhimi dhe Transporti (x${order.productLinks.length}):</span>
                <span>${formatPriceHTML(order.totalTransportFee || 0)}</span>
              </div>
              <div class="total-row final-total">
                <span>TOTALI:</span>
                <span>${formatPriceHTML(order.totalFinalPriceEUR || (
                  (order.totalPriceEUR || 0) + 
                  (order.totalCustomsFee || 0) + 
                  (order.totalTransportFee || 0)
                ))}</span>
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
      order.productLinks.some((product) =>
        product.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase()))
      )

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
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-center py-10">
            <Card className="max-w-md w-full border-2 border-purple-100 shadow-xl rounded-xl">
              <CardContent className="flex flex-col items-center p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Blerjet Tuaja</h2>
                <p className="text-center mb-6 text-gray-600">
                  Identifikohuni për të parë historinë e porosive tuaja dhe për të ndjekur statusin e tyre.
                </p>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Identifikohu
                </Button>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Nuk keni llogari? <button onClick={() => {setShowAuthModal(true); setAuthModalTab('register')}} className="text-purple-600 hover:underline">Regjistrohu këtu</button>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab={authModalTab}
      />
    </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
      <div className={`${isMobile ? 'w-full px-0' : 'max-w-4xl mx-auto px-4'} pb-20`}>
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
        <div className={`${isMobile ? 'w-full px-2' : 'max-w-4xl mx-auto px-4'} pb-16`}>
        {/* Compact search and filters section */}
        <Card className="mb-4 bg-gradient-to-r from-white via-slate-50/50 to-white shadow-lg border-0 rounded-lg">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                <Input
                  placeholder={isMobile ? "Kërko porosi..." : "Kërko porosi sipas ID ose produktit..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 bg-white border border-gray-200 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-400 transition-all duration-200 ${
                    isMobile ? 'h-9 text-sm' : 'h-10 text-sm'
                  }`}
                />
                {searchTerm && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">
                      {sortedOrders.length}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-1.5 pb-1 min-w-max">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      size="sm"
                      className={`flex-shrink-0 rounded-full transition-all ${isMobile ? 'px-3 py-1 text-xs h-7' : 'px-3 py-1.5 text-xs h-8'}
                        ${statusFilter === "all" 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm" 
                          : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200"
                        }`}
                      onClick={() => setStatusFilter("all")}
                    >
                      Të gjitha
                    </Button>
                    <Button
                      variant={statusFilter === "PENDING" ? "default" : "outline"}
                      size="sm"
                      className={`flex-shrink-0 rounded-full transition-all ${isMobile ? 'px-3 py-1 text-xs h-7' : 'px-3 py-1.5 text-xs h-8'} flex items-center gap-1
                        ${statusFilter === "PENDING" 
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm" 
                          : "bg-white text-gray-700 hover:bg-amber-50 border-gray-200"
                        }`}
                      onClick={() => setStatusFilter("PENDING")}
                    >
                      <Clock className={isMobile ? "h-2.5 w-2.5" : "h-3 w-3"} />
                      {isMobile ? "Pritje" : "Në pritje"}
                    </Button>
                    <Button
                      variant={statusFilter === "PROCESSING" ? "default" : "outline"}
                      size="sm"
                      className={`flex-shrink-0 rounded-full transition-all ${isMobile ? 'px-3 py-1 text-xs h-7' : 'px-3 py-1.5 text-xs h-8'} flex items-center gap-1
                        ${statusFilter === "PROCESSING" 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm" 
                          : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200"
                        }`}
                      onClick={() => setStatusFilter("PROCESSING")}
                    >
                      <Package className={isMobile ? "h-2.5 w-2.5" : "h-3 w-3"} />
                      {isMobile ? "Proces" : "Në proces"}
                    </Button>
                    <Button
                      variant={statusFilter === "SHIPPED" ? "default" : "outline"}
                      size="sm"
                      className={`flex-shrink-0 rounded-full transition-all ${isMobile ? 'px-3 py-1 text-xs h-7' : 'px-3 py-1.5 text-xs h-8'} flex items-center gap-1
                        ${statusFilter === "SHIPPED" 
                          ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm" 
                          : "bg-white text-gray-700 hover:bg-purple-50 border-gray-200"
                        }`}
                      onClick={() => setStatusFilter("SHIPPED")}
                    >
                      <Truck className={isMobile ? "h-2.5 w-2.5" : "h-3 w-3"} />
                      Dërguar
                    </Button>
                    <Button
                      variant={statusFilter === "DELIVERED" ? "default" : "outline"}
                      size="sm"
                      className={`flex-shrink-0 rounded-full transition-all ${isMobile ? 'px-3 py-1 text-xs h-7' : 'px-3 py-1.5 text-xs h-8'} flex items-center gap-1
                        ${statusFilter === "DELIVERED" 
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm" 
                          : "bg-white text-gray-700 hover:bg-green-50 border-gray-200"
                        }`}
                      onClick={() => setStatusFilter("DELIVERED")}
                    >
                      <CheckCircle2 className={isMobile ? "h-2.5 w-2.5" : "h-3 w-3"} />
                      Dorëzuar
                    </Button>
                    <Button
                      variant={statusFilter === "CANCELLED" ? "default" : "outline"}
                      size="sm"
                      className={`flex-shrink-0 rounded-full transition-all ${isMobile ? 'px-3 py-1 text-xs h-7' : 'px-3 py-1.5 text-xs h-8'} flex items-center gap-1
                        ${statusFilter === "CANCELLED" 
                          ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm" 
                          : "bg-white text-gray-700 hover:bg-red-50 border-gray-200"
                        }`}
                      onClick={() => setStatusFilter("CANCELLED")}
                    >
                      <AlertCircle className={isMobile ? "h-2.5 w-2.5" : "h-3 w-3"} />
                      Anuluar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {sortedOrders.length === 0 ? (
            <Card className="bg-white shadow-lg border border-gray-100 rounded-xl">
              <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
                <div className="bg-blue-50 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className={`font-bold text-gray-800 mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>Nuk keni asnjë porosi</h3>
                <p className={`text-gray-600 mb-4 max-w-sm mx-auto ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {searchTerm || statusFilter !== "all"
                    ? "Nuk u gjet asnjë porosi që përputhet me kriteret."
                    : "Nuk keni bërë ende asnjë porosi."}
                </p>
                {searchTerm || statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    className="bg-white hover:bg-blue-50 border border-blue-200"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                    }}
                  >
                    Pastro filtrat
                  </Button>
                ) : (
                  <Button 
                    size={isMobile ? "sm" : "default"}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push("/")}
                  >
                    Shko tek Kryefaqja
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            sortedOrders.map((order, index) => (
              <div key={order.id} className="relative">
                <Card
                  className={cn(
                    "bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20 shadow-xl border-2 border-blue-200/80 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-blue-300/80 hover:-translate-y-1 shadow-blue-100/50",
                    expandedOrder === order.id ? "ring-2 ring-blue-400/60 shadow-2xl border-blue-300/80 transform -translate-y-1 shadow-blue-200/60 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30" : "",
                  )}
                >
                {/* Compact order header */}
                <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-gray-100 bg-gray-50/30`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          `px-2 py-1 ${isMobile ? 'text-xs' : 'text-sm'} font-medium text-white flex items-center gap-1.5 rounded-full border-0`,
                          order.status === "PENDING" && "bg-gradient-to-r from-amber-500 to-orange-500",
                          order.status === "PROCESSING" && "bg-gradient-to-r from-blue-500 to-blue-600",
                          order.status === "SHIPPED" && "bg-gradient-to-r from-purple-500 to-violet-600",
                          order.status === "DELIVERED" && "bg-gradient-to-r from-green-500 to-emerald-600",
                          order.status === "CANCELLED" && "bg-gradient-to-r from-red-500 to-rose-600"
                        )}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </Badge>
                      <div className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold text-xs">
                        #{order.id.slice(0, 8)}
                      </div>
                    </div>

                    <div className="text-right">
                      {order.totalFinalPriceEUR && (
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className={`font-bold text-primary ${isMobile ? 'text-sm' : 'text-base'}`}>
                              <Price 
                                amount={order.totalFinalPriceEUR}
                                className={`font-bold text-primary ${isMobile ? 'text-sm' : 'text-base'}`}
                                decimalClassName="text-[0.7em]"
                              />
                            </div>
                            <div className="text-xs text-gray-600">
                              {order.productLinks.length} {order.productLinks.length === 1 ? 'produkt' : 'produkte'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600">
                    <Calendar className="h-3 w-3 text-blue-500" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Compact Order Timeline */}
                {order.status !== "CANCELLED" ? (
                  <div className={`${isMobile ? 'px-3 py-2' : 'px-4 py-3'} bg-gray-50 border-b border-gray-100`}>
                    <OrderTimeline
                      status={order.status}
                      createdAt={order.createdAt}
                      updatedAt={order.updatedAt}
                      estimatedDelivery={order.estimatedDelivery}
                    />
                  </div>
                ) : (
                  <div className={`${isMobile ? 'p-3' : 'p-4'} bg-red-50 border-b border-red-100`}>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-500 p-1 rounded-full">
                        <AlertCircle className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <p className={`text-red-700 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>Porosi anuluar</p>
                        <p className="text-xs text-red-600">
                          {new Date(order.updatedAt).toLocaleDateString()}
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
                    <AccordionTrigger className={`${isMobile ? 'px-3 py-2' : 'px-4 py-3'} hover:no-underline hover:bg-blue-50/50 transition-all duration-200`}>
                      <span className={`flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-base'} font-medium w-full`}>
                        <div className="bg-blue-500 p-1.5 rounded-full">
                          <ShoppingBag className="h-3 w-3 text-white" />
                        </div>
                        <span className="flex-1">Produktet ({order.productLinks.length})</span>
                        <div className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
                          Detajet
                        </div>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className={`${isMobile ? 'px-3 pb-3 pt-2' : 'px-4 pb-4 pt-3'} bg-gray-50/30`}>
                      <div className="space-y-3">
                        {order.productLinks.map((product, index) => (
                          <div
                            key={index}
                            className={`bg-white rounded-xl border-2 border-gray-100 overflow-hidden ${isMobile ? 'p-3 mb-3' : 'p-4 mb-3'} w-full shadow-md hover:shadow-lg hover:border-blue-200 transition-all duration-200 relative`}
                          >
                            {/* Subtle gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20 pointer-events-none"></div>
                            <div className="relative z-10">
                              <div className="flex items-start gap-2">
                                {/* Number instead of icon */}
                                <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>

                                {/* Product details - compact */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1">
                                    {/* Product title/URL */}
                                    {product.title ? (
                                      <span className={`font-medium text-gray-800 truncate ${isMobile ? 'text-sm' : 'text-sm'} block flex-1 mr-2`}>
                                        {product.title}
                                      </span>
                                    ) : (
                                      <a
                                        href={product.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`font-medium text-primary hover:text-primary/80 hover:underline truncate ${isMobile ? 'text-sm' : 'text-sm'} flex-1 mr-2`}
                                      >
                                        {isMobile ? (
                                          <>
                                            {product.url.substring(0, 25)}...
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
                                    
                                    {/* Product price */}
                                    {product.priceEUR && (
                                      <span className="text-xs font-bold text-primary flex-shrink-0">
                                        <Price 
                                          amount={product.priceEUR || 0}
                                          className="text-xs font-bold text-primary"
                                          decimalClassName="text-[0.6em]"
                                        />
                                      </span>
                                    )}
                                  </div>

                                  {/* Show URL if title exists */}
                                  {product.title && (
                                    <a
                                      href={product.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-gray-500 hover:text-primary/80 hover:underline truncate block mb-1"
                                    >
                                      {isMobile ? (
                                        <>
                                          {product.url.substring(0, 30)}...
                                          <ExternalLink className="inline h-2.5 w-2.5 ml-1" />
                                        </>
                                      ) : (
                                        <>
                                          {product.url}
                                          <ExternalLink className="inline h-3 w-3 ml-1" />
                                        </>
                                      )}
                                    </a>
                                  )}

                                  {/* Compact product attributes */}
                                  <div className="flex flex-wrap items-center text-xs text-gray-600 gap-2">
                                    <span>Sasia: <strong>{product.quantity}</strong></span>
                                    {product.size && (
                                      <span>Madhësia: <strong>{product.size}</strong></span>
                                    )}
                                    {product.color && (
                                      <span>Ngjyra: <strong>{product.color}</strong></span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Additional info if present */}
                      {order.additionalInfo && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <h4 className="text-sm font-medium mb-1">Informacion shtesë:</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{order.additionalInfo}</p>
                        </div>
                      )}

                      {/* Compact order summary */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className={`space-y-2 ${isMobile ? 'text-xs' : 'text-sm'} bg-blue-50/50 ${isMobile ? 'p-2' : 'p-3'} rounded-lg border border-blue-200/50`}>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Çmimi bazë:</span>
                            <Price 
                              amount={order.totalPriceEUR || 0}
                              className="font-medium"
                              decimalClassName="text-[0.65em]"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Dogana ({configs.CUSTOMS_FEE_PERCENTAGE ? `${(configs.CUSTOMS_FEE_PERCENTAGE * 100).toFixed(0)}%` : 'N/A'}):
                            </span>
                            <Price 
                              amount={order.totalCustomsFee || 0}
                              className="font-medium"
                              decimalClassName="text-[0.65em]"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transport (x{order.productLinks.length}):</span>
                            <Price 
                              amount={order.totalTransportFee || 0}
                              className="font-medium"
                              decimalClassName="text-[0.65em]"
                            />
                          </div>
                          <div className="flex justify-between font-bold pt-1 mt-1 border-t border-blue-300/50">
                            <span>Totali:</span>
                            <Price 
                              amount={order.totalFinalPriceEUR || 0}
                              className="text-primary font-bold"
                              decimalClassName="text-[0.7em]"
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Compact actions */}
                <div className={`${isMobile ? 'p-2' : 'p-3'} border-t border-gray-100 bg-gray-50/50`}>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {order.status === "PENDING" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className={`${isMobile ? 'text-xs h-7 px-2' : 'text-xs h-8 px-3'}`}
                        onClick={() => {
                          setSelectedOrderId(order.id)
                          setShowCancelDialog(true)
                        }}
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {isMobile ? "Anulo" : "Anulo Porosinë"}
                      </Button>
                    )}

                    {order.status === "DELIVERED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${isMobile ? 'text-xs h-7 px-2' : 'text-xs h-8 px-3'}`}
                        onClick={() => {
                          toast({
                            title: "Porosi e re",
                            description: "Produktet u shtuan në porosi të re.",
                          })
                        }}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {isMobile ? "Përsëri" : "Porosit Përsëri"}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className={`${isMobile ? 'text-xs h-7 px-2' : 'text-xs h-8 px-3'}`}
                      onClick={() => {
                        generateOrderInvoice(order)
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {isMobile ? "Faturë" : "Shkarko Faturën"}
                    </Button>
                  </div>
                </div>
              </Card>
                
                {/* Beautiful separator between orders - only show if not the last order */}
                {index < sortedOrders.length - 1 && (
                  <div className="flex items-center justify-center my-6">
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    <div className="px-4">
                      <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  </div>
                )}
              </div>
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
