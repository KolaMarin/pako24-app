"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useConfigStore } from "@/lib/config-store"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Edit2, Save, X, Trash2, Package, Send, Download, Search, Clock, RefreshCw, Truck, CheckCircle, XCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Price } from "@/components/ui/price"
import { formatPriceHTML } from "@/lib/utils"

interface ProductLink {
  id: string
  url: string
  quantity: number
  size: string
  color: string
  priceGBP: number
  priceEUR: number
  customsFee: number
  transportFee: number
}

interface Order {
  id: string
  userId: string
  productLinks: ProductLink[]
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  createdAt: string
  updatedAt: string
  userEmail: string
  userPhoneNumber: string
  totalPriceGBP: number
  totalPriceEUR: number
  totalCustomsFee: number
  totalTransportFee: number
  totalFinalPriceEUR?: number // Add the new property with optional marker
}

const statusColors = {
  PENDING: "bg-yellow-500",
  PROCESSING: "bg-blue-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
}

const statusLabels = {
  PENDING: "Në pritje",
  PROCESSING: "Në proces",
  SHIPPED: "Dërguar",
  DELIVERED: "Dorëzuar",
  CANCELLED: "Anuluar",
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  
  // ProductEditor component to handle editing with proper state management
  const ProductEditor = ({ 
    product, 
    orderId, 
    onSave, 
    onCancel 
  }: { 
    product: ProductLink; 
    orderId: string; 
    onSave: (orderId: string, productId: string, updatedProduct: Partial<ProductLink>) => Promise<void>;
    onCancel: () => void;
  }) => {
    // Create a copy of the product for editing to avoid modifying the original until save
    const [editedProduct, setEditedProduct] = useState<ProductLink>({...product})
    
    // Handle number input validation and formatting
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ProductLink) => {
      const value = e.target.value === '' ? 0 : Number(e.target.value)
      setEditedProduct({ ...editedProduct, [field]: value })
    }
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">URL e Produktit</label>
            <Input
              value={editedProduct.url}
              onChange={(e) => setEditedProduct({ ...editedProduct, url: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Sasia</label>
            <Input
              type="number"
              min="1"
              value={editedProduct.quantity}
              onChange={(e) => handleNumberChange(e, 'quantity')}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Madhësia</label>
            <Input
              value={editedProduct.size}
              onChange={(e) => setEditedProduct({ ...editedProduct, size: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Ngjyra</label>
            <Input
              value={editedProduct.color}
              onChange={(e) => setEditedProduct({ ...editedProduct, color: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Çmimi (EUR)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={editedProduct.priceEUR}
              onChange={(e) => handleNumberChange(e, 'priceEUR')}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Dogana</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={editedProduct.customsFee}
              onChange={(e) => handleNumberChange(e, 'customsFee')}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Transporti</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={editedProduct.transportFee}
              onChange={(e) => handleNumberChange(e, 'transportFee')}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Anulo
          </Button>
          <Button onClick={() => onSave(orderId, product.id, editedProduct)}>
            <Save className="w-4 h-4 mr-2" />
            Ruaj
          </Button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter((order) => order.status === statusFilter))
    }
  }, [statusFilter, orders])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
        setFilteredOrders(data)
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
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map((order) => (order.id === orderId ? updatedOrder : order)))
        toast({
          title: "Sukses",
          description: "Statusi i porosisë u përditësua me sukses.",
        })
      } else {
        throw new Error("Failed to update order status")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Përditësimi i statusit të porosisë dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const updateProductDetails = async (orderId: string, productId: string, updatedProduct: Partial<ProductLink>) => {
    try {
      // Ensure transport fee is not accidentally multiplied by quantity when updating
      // We want to maintain the flat fee per product concept
      const response = await fetch(`/api/admin/orders/${orderId}/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      })
      
      if (response.ok) {
        const updatedOrder = await response.json()
        
        // Update the orders state while preserving customer info
        setOrders(orders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order, // Keep existing customer info
              productLinks: updatedOrder.productLinks, // Update products
              totalPriceGBP: updatedOrder.totalPriceGBP,
              totalPriceEUR: updatedOrder.totalPriceEUR,
              totalCustomsFee: updatedOrder.totalCustomsFee,
              totalTransportFee: updatedOrder.totalTransportFee,
              totalFinalPriceEUR: updatedOrder.totalFinalPriceEUR
            }
          }
          return order
        }))
        
        // Also update filtered orders
        setFilteredOrders(filteredOrders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order, // Keep existing customer info
              productLinks: updatedOrder.productLinks, // Update products
              totalPriceGBP: updatedOrder.totalPriceGBP,
              totalPriceEUR: updatedOrder.totalPriceEUR,
              totalCustomsFee: updatedOrder.totalCustomsFee,
              totalTransportFee: updatedOrder.totalTransportFee,
              totalFinalPriceEUR: updatedOrder.totalFinalPriceEUR
            }
          }
          return order
        }))
        
        setEditingProduct(null)
        toast({
          title: "Sukses",
          description: "Detajet e produktit u përditësuan me sukses dhe totalet u rillogaritur.",
        })
      } else {
        throw new Error("Failed to update product details")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Përditësimi i detajeve të produktit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const deleteProduct = async (orderId: string, productId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/products/${productId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map((order) => (order.id === orderId ? updatedOrder : order)))
        toast({
          title: "Sukses",
          description: "Produkti u fshi me sukses nga porosia.",
        })
      } else {
        throw new Error("Failed to delete product")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Fshirja e produktit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const sendWhatsAppConfirmation = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/send-confirmation`, {
        method: "POST",
      })
      if (response.ok) {
        toast({
          title: "Sukses",
          description: "Konfirmimi u dërgua me sukses në WhatsApp.",
        })
      } else {
        throw new Error("Failed to send WhatsApp confirmation")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Dërgimi i konfirmimit në WhatsApp dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const ProductCard = ({ product, orderId }: { product: ProductLink; orderId: string }) => {
    // Initialize the state with the current product values
    const [editedProduct, setEditedProduct] = useState(product)
    // Reset the editedProduct when the product prop changes (after updates)
    useEffect(() => {
      setEditedProduct(product)
    }, [product])
    
    const isEditing = editingProduct === product.id

    // Handle number input validation and formatting
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ProductLink) => {
      const value = e.target.value === '' ? 0 : Number(e.target.value)
      setEditedProduct({ ...editedProduct, [field]: value })
    }

    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">URL e Produktit</label>
                  <Input
                    value={editedProduct.url}
                    onChange={(e) => setEditedProduct({ ...editedProduct, url: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sasia</label>
                  <Input
                    type="number"
                    min="1"
                    value={editedProduct.quantity}
                    onChange={(e) => handleNumberChange(e, 'quantity')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Madhësia</label>
                  <Input
                    value={editedProduct.size}
                    onChange={(e) => setEditedProduct({ ...editedProduct, size: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ngjyra</label>
                  <Input
                    value={editedProduct.color}
                    onChange={(e) => setEditedProduct({ ...editedProduct, color: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Çmimi (EUR)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedProduct.priceEUR}
                    onChange={(e) => handleNumberChange(e, 'priceEUR')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Dogana</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedProduct.customsFee}
                    onChange={(e) => handleNumberChange(e, 'customsFee')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Transporti</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedProduct.transportFee}
                    onChange={(e) => handleNumberChange(e, 'transportFee')}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Anulo
                </Button>
                <Button onClick={() => updateProductDetails(orderId, product.id, editedProduct)}>
                  <Save className="w-4 h-4 mr-2" />
                  Ruaj
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm max-w-full overflow-hidden">
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline truncate inline-block max-w-full overflow-hidden"
                      title={product.url}
                    >
                      {product.url.length > 60 ? `${product.url.substring(0, 60)}...` : product.url}
                    </a>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Sasia: {product.quantity}, Madhësia: {product.size}, Ngjyra: {product.color}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingProduct(product.id)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Ndrysho
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Fshi
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Konfirmo fshirjen</DialogTitle>
                        <DialogDescription>
                          A jeni i sigurt që dëshironi të fshini këtë produkt nga porosia?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>
                          Anulo
                        </Button>
                        <Button variant="destructive" onClick={() => deleteProduct(orderId, product.id)}>
                          Fshi
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Çmimi (EUR)</p>
                  <Price 
                    amount={product.priceEUR}
                    className="font-medium"
                    decimalClassName="text-[0.65em]"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dogana</p>
                  <Price 
                    amount={product.customsFee}
                    className="font-medium"
                    decimalClassName="text-[0.65em]"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transporti</p>
                  <Price 
                    amount={product.transportFee}
                    className="font-medium"
                    decimalClassName="text-[0.65em]"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const generatePDF = (order: Order) => {
    try {
      // Open a new window for the invoice
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
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
      printWindow.document.write(`
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
                  Statusi: <span class="status-badge status-${order.status}">${statusLabels[order.status]}</span>
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
              <div><strong>Klienti:</strong> ${order.userEmail}</div>
              <div><strong>Telefoni:</strong> ${order.userPhoneNumber || 'N/A'}</div>
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
                        ${product.url.length > 60 ? product.url.substring(0, 60) + '...' : product.url}
                        <svg style="display: inline; width: 12px; height: 12px; margin-left: 4px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15,3 21,3 21,9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                      ${product.url.length > 60 ? 
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
                      ${formatPriceHTML(product.priceEUR)}
                      ${product.priceGBP ? `<span style="display: block; font-size: 11px; color: #777;">${formatPriceHTML(product.priceGBP, '£')}</span>` : ''}
                    </td>
                    <td class="text-right">${formatPriceHTML(product.priceEUR * product.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row">
                <span>Çmimi bazë:</span>
                <span>€${order.totalPriceEUR.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Dogana (${(configs.CUSTOMS_FEE_PERCENTAGE * 100).toFixed(0)}%):</span>
                <span>€${order.totalCustomsFee.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Menaxhimi dhe Transporti (x${order.productLinks.length}):</span>
                <span>€${order.totalTransportFee.toFixed(2)}</span>
              </div>
              <div class="total-row final-total">
                <span>TOTALI:</span>
                <span>€${order.totalFinalPriceEUR?.toFixed(2) || (
                  order.totalPriceEUR + 
                  order.totalCustomsFee + 
                  order.totalTransportFee
                ).toFixed(2)}</span>
              </div>
            </div>

            <div style="margin: 30px 0;">
              <button onclick="window.print()" style="padding: 10px 20px; background-color: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Printo Faturën
              </button>
            </div>

            <div class="footer">
              <p>Faleminderit për porosinë tuaj!</p>
              <p>Për çdo pyetje ose nevojë, ju lutemi na kontaktoni në ${configs.COMPANY_EMAIL} ose ${configs.COMPANY_PHONE}</p>
            </div>
          </div>
        </body>
        </html>
      `)
      
      printWindow.document.close()
      
      // After a slight delay, trigger print dialog
      setTimeout(() => {
        printWindow.print()
      }, 500)
    } catch (error) {
      console.error("Error generating invoice:", error)
      toast({
        title: "Gabim",
        description: "Gjenerimi i faturës dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const filteredAndSearchedOrders = filteredOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productLinks.some((product) => product.url.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Duke ngarkuar...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <CardTitle>Menaxhimi i Porosive</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Kërko porosi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Tabs defaultValue={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
              <TabsTrigger value="ALL" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Të Gjitha</span>
              </TabsTrigger>
              <TabsTrigger value="PENDING" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Në Pritje</span>
              </TabsTrigger>
              <TabsTrigger value="PROCESSING" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Në Proces</span>
              </TabsTrigger>
              <TabsTrigger value="SHIPPED" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>Dërguar</span>
              </TabsTrigger>
              <TabsTrigger value="DELIVERED" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Dorëzuar</span>
              </TabsTrigger>
              <TabsTrigger value="CANCELLED" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                <span>Anuluar</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-2">
              <div className="text-sm text-muted-foreground mb-4">
                {statusFilter === "ALL" 
                  ? "Të gjitha porositë" 
                  : `Porositë me status: ${statusLabels[statusFilter as keyof typeof statusLabels]}`} 
                ({filteredAndSearchedOrders.length} porosi)
              </div>
            </div>
          </Tabs>
        </div>

        <div className="grid gap-6">
          {filteredAndSearchedOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>#{order.id.slice(0, 8)}</CardTitle>
                      <Badge className={`${statusColors[order.status]}`}>{statusLabels[order.status]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Në pritje</SelectItem>
                        <SelectItem value="PROCESSING">Në proces</SelectItem>
                        <SelectItem value="SHIPPED">Dërguar</SelectItem>
                        <SelectItem value="DELIVERED">Dorëzuar</SelectItem>
                        <SelectItem value="CANCELLED">Anuluar</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => generatePDF(order)} title="Shkarko PDF">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => sendWhatsAppConfirmation(order.id)}
                      title="Dërgo në WhatsApp"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Fshi porosinë">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Konfirmo fshirjen</DialogTitle>
                          <DialogDescription>
                            A jeni i sigurt që dëshironi të fshini këtë porosi? Kjo veprim do të fshijë të gjitha produktet e porosisë.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Anulo</Button>
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/admin/orders', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ orderId: order.id })
                                })
                                if (response.ok) {
                                  setOrders(orders.filter(o => o.id !== order.id))
                                  setFilteredOrders(filteredOrders.filter(o => o.id !== order.id))
                                  toast({
                                    title: "Sukses",
                                    description: "Porosia u fshi me sukses.",
                                  })
                                } else {
                                  throw new Error("Failed to delete order")
                                }
                              } catch (error) {
                                toast({
                                  title: "Gabim",
                                  description: "Fshirja e porosisë dështoi. Ju lutemi provoni përsëri.",
                                  variant: "destructive",
                                })
                              }
                            }}
                          >
                            Fshi
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Accordion 
                  type="single" 
                  collapsible 
                  className="w-full overflow-x-hidden"
                  value={expandedOrder === order.id ? "details" : undefined}
                  onValueChange={(value) => setExpandedOrder(value === "details" ? order.id : null)}
                >
                  <AccordionItem value="details">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>{order.productLinks.length} produkte</span>
                        <span className="text-muted-foreground">
                          (€{order.totalFinalPriceEUR?.toFixed(2) || (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee).toFixed(2)})
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Klienti</p>
                              <p className="text-sm">{order.userEmail}</p>
                              <p className="text-sm text-muted-foreground">{order.userPhoneNumber}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid gap-4">
                            {order.productLinks.map((product, index) => (
                                <div key={product.id} className="p-4 rounded-lg border bg-card">
                                  {editingProduct === product.id ? (
                                    // Editing form for the product with proper state management
                                    <ProductEditor 
                                      product={product} 
                                      orderId={order.id} 
                                      onSave={updateProductDetails}
                                      onCancel={() => setEditingProduct(null)}
                                    />
                                  ) : (
                                    // Read-only view of the product
                                    <div className="flex justify-between items-start gap-4">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium max-w-full overflow-hidden">
                                          <a 
                                            href={product.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 hover:underline truncate inline-block max-w-full overflow-hidden"
                                            title={product.url}
                                          >
                                            {product.url.length > 60 ? `${product.url.substring(0, 60)}...` : product.url}
                                          </a>
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                                          <span>Sasia: {product.quantity}</span>
                                          <span>•</span>
                                          <span>Madhësia: {product.size}</span>
                                          <span>•</span>
                                          <span>Ngjyra: {product.color}</span>
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                          <div>
                                            <p className="text-sm text-muted-foreground">Çmimi (GBP)</p>
                                            <p className="font-medium">£{product.priceGBP.toFixed(2)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Çmimi (EUR)</p>
                                            <p className="font-medium">€{product.priceEUR.toFixed(2)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Dogana</p>
                                            <p className="font-medium">€{product.customsFee.toFixed(2)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Transporti</p>
                                            <p className="font-medium">€{product.transportFee.toFixed(2)}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => {
                                            setEditingProduct(product.id)
                                            // Ensure the order is expanded when editing
                                            setExpandedOrder(order.id)
                                          }}
                                        >
                                          <Edit2 className="h-4 w-4 mr-2" />
                                          Ndrysho
                                        </Button>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Konfirmo fshirjen</DialogTitle>
                                              <DialogDescription>
                                                A jeni i sigurt që dëshironi të fshini këtë produkt?
                                              </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                              <Button variant="outline">Anulo</Button>
                                              <Button
                                                variant="destructive"
                                                onClick={() => deleteProduct(order.id, product.id)}
                                              >
                                                Fshi
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    </div>
                                  )}
                                </div>
                            ))}
                          </div>

                          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                            <h3 className="font-medium mb-4">Përmbledhje e Porosisë</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Totali i produkteve:</span>
                                <span>
                                  €{order.productLinks.reduce((sum, p) => sum + p.priceEUR, 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Dogana:</span>
                                <span>€{order.totalCustomsFee.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Menaxhimi dhe Transporti:</span>
                                <span>€{order.totalTransportFee.toFixed(2)}</span>
                              </div>
                              <div className="pt-2 mt-2 border-t flex justify-between font-medium">
                                <span>Totali përfundimtar:</span>
                                <div className="text-right">
                                  <div>€{order.totalFinalPriceEUR?.toFixed(2) || (order.totalPriceEUR + order.totalCustomsFee + order.totalTransportFee).toFixed(2)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
