"use client"

import { useEffect, useState } from "react"
import Layout from "@/components/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
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
  const router = useRouter()

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
    // Redirect if not logged in
    if (!user) {
      router.push("/")
      return
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

  // If user is not logged in, don't render anything (redirect happens in useEffect)
  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-primary">Porositë e Mia</h1>
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
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-primary">Porositë e Mia</h1>

        {/* Mobile-optimized filters */}
        <Card className="mb-6 bg-white shadow-md">
          <CardContent className="p-3">
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
                  <Button onClick={() => router.push("/")}>Shko tek Porositë</Button>
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
                <div className="p-3 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">#{order.id.slice(0, 8)}</h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "px-2 py-0.5 text-xs text-white flex items-center gap-1",
                            getStatusColor(order.status),
                          )}
                        >
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                    {order.totalFinalPriceEUR && (
                        <div className="text-right">
                          <div className="font-medium text-primary">€{order.totalFinalPriceEUR.toFixed(2)}</div>
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
                    <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-gray-50">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        Produktet ({order.productLinks.length})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <div className="space-y-3">
                        {order.productLinks.map((product, index) => (
                            <div
                            key={index}
                            className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden p-2 mb-2"
                          >
                            <div className="flex items-center gap-2">
                              {/* Package icon */}
                              <div className="flex-shrink-0 bg-primary-100 rounded-md h-8 w-8 flex items-center justify-center">
                                <Package className="h-4 w-4 text-primary" />
                              </div>

                              {/* Product details - more compact layout */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap justify-between items-start gap-1">
                                  {/* Display Title if available, otherwise URL */}
                                  {product.title ? (
                                    <span className="text-xs font-medium text-gray-800 truncate max-w-[200px] block">
                                      {product.title}
                                    </span>
                                  ) : (
                                    <a
                                      href={product.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-medium text-primary hover:text-primary/80 hover:underline truncate max-w-[200px]"
                                    >
                                      {product.url}
                                      <ExternalLink className="inline h-3 w-3 ml-1" />
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
                                      {product.url}
                                      <ExternalLink className="inline h-3 w-3 ml-1" />
                                    </a>
                                  )}

                                  {/* Product price on the right */}
                                  {product.priceEUR && (
                                    <span className="text-xs font-medium text-primary">
                                      €{(product.priceEUR || 0).toFixed(2)}
                                      <span className="text-xs text-gray-500 ml-1">
                                        ({product.quantity} copë)
                                      </span>
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
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="text-sm font-medium mb-2">Përmbledhje e Porosisë</h4>
                        <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-md">
                          {/* Base price total */}
                          <div className="flex justify-between">
                            <span className="text-gray-500">Çmimi bazë:</span>
                            <div>
                              <span>
                                €{order.totalPriceEUR?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                          </div>
                          {/* Customs fee total */}
                          <div className="flex justify-between">
                            <span className="text-gray-500">Dogana:</span>
                            <span>€{order.totalCustomsFee?.toFixed(2) || "0.00"}</span>
                          </div>
                          {/* Transport fee total */}
                          <div className="flex justify-between">
                            <span className="text-gray-500">Menaxhimi dhe Transporti:</span>
                            <span>€{order.totalTransportFee?.toFixed(2) || "0.00"}</span>
                          </div>
                          {/* Grand total */}
                          <div className="flex justify-between font-medium pt-1 mt-1 border-t border-gray-200">
                            <span>Totali:</span>
                            <span className="text-primary">
                              €{order.totalFinalPriceEUR?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Order summary and actions */}
                <div className="p-3 border-t border-gray-100">
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === "PENDING" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          setSelectedOrderId(order.id)
                          setShowCancelDialog(true)
                        }}
                      >
                        Anulo Porosinë
                      </Button>
                    )}

                    {order.status === "DELIVERED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          // Handle reorder functionality
                          toast({
                            title: "Porosi e re",
                            description: "Produktet u shtuan në porosi të re.",
                          })
                        }}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Porosit Përsëri
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => {
                        // Handle download invoice functionality
                        toast({
                          title: "Fatura",
                          description: "Fatura u shkarkua me sukses.",
                        })
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
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
