"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBasketStore } from "@/lib/basket-store"
import { type ProductLink } from "@/lib/product-form-store"
import { useConfigStore } from "@/lib/config-store"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { LoginModal } from "@/components/login-modal"
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Info,
  Loader2,
  Calendar,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Package
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BasketInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { productLinks: ProductLink[] }) => Promise<void>
}

export function BasketInvoiceModal({ open, onOpenChange, onSubmit }: BasketInvoiceModalProps) {
  const { items, removeItem, updateItem, clearBasket, itemCount } = useBasketStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const currentDate = new Date().toLocaleDateString()
  const configs = useConfigStore(state => state.configs)
  const transportFeePerProduct = useConfigStore(state => state.getTransportFee())
  const customsFeePercentage = useConfigStore(state => state.getCustomsFeePercentage())
  const exchangeRate = useConfigStore(state => state.getExchangeRate())

  const calculateFees = (price: number, quantity: number) => {
    const euroPrice = price * exchangeRate // GBP to EUR conversion from config
    const basePriceEUR = euroPrice * quantity
    const customsFee = basePriceEUR * customsFeePercentage // Customs fee percentage from config
    const shippingFee = transportFeePerProduct // Base shipping fee per product type (flat fee, not multiplied by quantity)
    
    return {
      basePriceGBP: price * quantity,
      basePriceEUR,
      customsFee,
      shippingFee, 
      totalEUR: basePriceEUR + customsFee + shippingFee, // Total in EUR
    }
  }

  // Define the type for order totals
  interface OrderTotals {
    basePriceGBP: number;
    basePriceEUR: number;
    customsFee: number;
    shippingFee: number;
    totalEUR: number;
  }

  // Count unique product types (not considering quantities)
  const uniqueProductTypes = items.length;
  
  // Calculate transport fee as flat fee multiplied by number of product types
  const totalTransportFee = transportFeePerProduct * uniqueProductTypes;

  // Calculate totals for all products
  const orderTotals = items.reduce<OrderTotals>(
    (totals, item) => {
      if (item.price > 0) {
        const fees = calculateFees(item.price, item.quantity)
        return {
          basePriceGBP: totals.basePriceGBP + fees.basePriceGBP,
          basePriceEUR: totals.basePriceEUR + fees.basePriceEUR,
          customsFee: totals.customsFee + fees.customsFee,
          shippingFee: totalTransportFee, // Keep the total transport fee
          totalEUR: totals.totalEUR + fees.basePriceEUR + fees.customsFee,
        }
      }
      return totals
    },
    { basePriceGBP: 0, basePriceEUR: 0, customsFee: 0, shippingFee: totalTransportFee, totalEUR: 0 }
  )
  
  // Add shipping fee to total
  orderTotals.totalEUR += orderTotals.shippingFee

  const handleQuantityChange = (index: number, increment: boolean) => {
    const currentQty = items[index].quantity
    const newQty = increment ? currentQty + 1 : Math.max(1, currentQty - 1)
    updateItem(index, "quantity", newQty)
  }

  const handleCheckUserLoggedIn = () => {
    if (!user) {
      // Show login modal if user is not logged in
      setShowLoginModal(true)
      return false
    }
    return true
  }

  const handleContinueShopping = () => {
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    // Check if user is logged in first
    if (!handleCheckUserLoggedIn()) {
      return;
    }
    
    setIsSubmitting(true)
    try {
      // Transform product links to include calculated fees
      const enrichedProductLinks = items.map((item) => {
        const fees = item.price > 0 ? calculateFees(item.price, item.quantity) : null
        return {
          ...item,
          priceGBP: item.price * item.quantity,
          priceEUR: item.price * exchangeRate * item.quantity,  // Use exchange rate from config
          customsFee: fees?.customsFee || 0,
          transportFee: transportFeePerProduct // Fixed flat fee per product type
        }
      })
      
      // Submit the order and get the response with the order ID
      const orderResponse = await onSubmit({ productLinks: enrichedProductLinks })
      toast({
        title: "Sukses",
        description: "Porosia juaj u dërgua me sukses.",
      })
      
      // Clear the basket after successful order
      clearBasket()
      
      // Redirect to orders page with a parameter to auto-expand this order
      router.push("/orders?newOrder=true")
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Dërgimi i porosisë dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      onOpenChange(false)
    }
  }

  const totalItems = itemCount()

  return (
    <>
      <LoginModal 
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white p-4">
          <DialogTitle className="sr-only">Shporta</DialogTitle>
          
          {items.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Shporta juaj është bosh</h3>
              <p className="text-gray-500 mb-6 text-center">Shtoni produkte në shportë për të vazhduar me porosinë.</p>
              <Button 
                onClick={handleContinueShopping}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Kthehu në dyqan
              </Button>
            </div>
          ) : (
            <>
              {/* Invoice header with logo and company info */}
              <div className="mb-0 pt-2 pb-3 border-b border-gray-200">
                <div className="flex flex-col">
                  <div className="flex items-center mb-3">
                    <Package className="h-6 w-6 mr-2 text-secondary" />
                    <span className="text-primary font-extrabold text-xl">{configs.COMPANY_NAME}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-600">{configs.COMPANY_EMAIL}</div>
                      <div className="text-sm text-gray-600">{configs.COMPANY_PHONE}</div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mt-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Data: {currentDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product table */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Produkte në shportë</h3>
                </div>
                <div className="w-full">
                  <table className="w-full border-collapse text-xs table-fixed">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-1 px-2 text-center font-medium text-gray-700 border-b" style={{ width: '30px' }}>Nr.</th>
                        <th className="py-1 px-2 text-left font-medium text-gray-700 border-b">Produkti</th>
                        <th className="py-1 px-2 text-right font-medium text-gray-700 border-b" style={{ width: '80px' }}>Çmimi</th>
                        <th className="py-1 px-2 text-center font-medium text-gray-700 border-b" style={{ width: '80px' }}>Sasia</th>
                        <th className="py-1 px-2 text-right font-medium text-gray-700 border-b" style={{ width: '80px' }}>Totali</th>
                        <th className="py-1 px-2 text-center font-medium text-gray-700 border-b" style={{ width: '40px' }}>Veprim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => {
                        const fees = item.price > 0 ? calculateFees(item.price, item.quantity) : null
                        return (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="py-1 px-2 text-center font-medium text-gray-800 border-b">{index + 1}</td>
                            <td className="py-1 px-2 text-gray-800 border-b">
                              <div className="max-w-full overflow-hidden">
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-start"
                                >
                                  <span className="truncate block">{item.title || item.url}</span>
                                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                                </a>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {item.size && <span className="text-xs text-gray-500">Madhësia: {item.size}</span>}
                                  {item.color && <span className="text-xs text-gray-500">Ngjyra: {item.color}</span>}
                                </div>
                                {item.additionalInfo && (
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.additionalInfo}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-1 px-2 text-right font-medium text-gray-800 border-b">
                              {item.price > 0 ? (
                                <>
                                  €{(item.price * exchangeRate).toFixed(2)}
                                  <span className="block text-xs text-gray-500">£{item.price.toFixed(2)}</span>
                                </>
                              ) : "-"}
                            </td>
                            <td className="py-1 px-2 text-center text-gray-800 border-b">
                              <div className="flex items-center justify-center">
                                <Button
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleQuantityChange(index, false)}
                                  className="h-5 w-5 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="mx-1">{item.quantity}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleQuantityChange(index, true)}
                                  className="h-5 w-5 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-1 px-2 text-right font-medium text-gray-800 border-b">
                              {item.price > 0 ? (
                                <span className="font-bold">€{(item.price * exchangeRate * item.quantity).toFixed(2)}</span>
                              ) : "-"}
                            </td>
                            <td className="py-1 px-2 text-center border-b">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(index)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Totals section */}
              <div className="mb-0">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Çmimi bazë:</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">€{orderTotals.basePriceEUR.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Dogana ({(customsFeePercentage * 100).toFixed(0)}%):</span>
                    <span className="text-sm font-medium">€{orderTotals.customsFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Menaxhimi dhe Transporti {uniqueProductTypes > 0 && `(x${uniqueProductTypes})`}:</span>
                    <span className="text-sm font-medium">€{orderTotals.shippingFee.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">Totali:</span>
                    <span className="text-lg font-bold text-primary">€{orderTotals.totalEUR.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order confirmation message - always visible in both modes */}
              <div>
                <div className="bg-blue-50 border border-primary-100 rounded-md p-2">
                  <div className="flex gap-2">
                    <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-primary-700 text-sm">
                        Pasi të dërgoni porosinë, ekipi ynë do t'ju kontaktojë për të konfirmuar detajet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between gap-1 pt-1 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={handleContinueShopping}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kthehu
                </Button>
                
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Duke dërguar porosinë...
                    </>
                  ) : (
                    <>
                      Konfirmo Porosinë
                      <Check className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
