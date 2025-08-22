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
import { AuthModal } from "@/components/auth-modal"
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
  Package,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Price } from "@/components/ui/price"

interface BasketInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { productLinks: ProductLink[] }) => Promise<void>
}

export function BasketInvoiceModal({ open, onOpenChange, onSubmit }: BasketInvoiceModalProps) {
  const { items, removeItem, updateItem, clearBasket, itemCount } = useBasketStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const currentDate = new Date().toLocaleDateString()
  const configs = useConfigStore(state => state.configs)
  const transportFeePerProduct = useConfigStore(state => state.getTransportFee())
  const previousTransportFee = useConfigStore(state => state.getPreviousTransportFee())
  const shouldShowPreviousPrice = useConfigStore(state => state.shouldShowPreviousPrice())
  const customsFeePercentage = useConfigStore(state => state.getCustomsFeePercentage())
  const exchangeRate = useConfigStore(state => state.getExchangeRate())

  const calculateFees = (price: number, quantity: number, currency: 'GBP' | 'EUR') => {
    const euroPrice = currency === 'EUR' ? price : price * exchangeRate // Only convert if GBP
    const basePriceEUR = euroPrice * quantity
    const customsFee = basePriceEUR * customsFeePercentage // Customs fee percentage from config
    const shippingFee = transportFeePerProduct // Base shipping fee per product type (flat fee, not multiplied by quantity)
    
    return {
      basePriceOriginal: price * quantity,
      basePriceEUR,
      customsFee,
      shippingFee, 
      totalEUR: basePriceEUR + customsFee + shippingFee, // Total in EUR
      currency
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
        const fees = calculateFees(item.price, item.quantity, item.currency)
        return {
          basePriceGBP: totals.basePriceGBP + fees.basePriceOriginal,
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
      setShowAuthModal(true)
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
        const fees = item.price > 0 ? calculateFees(item.price, item.quantity, item.currency) : null
        const euroPrice = item.currency === 'EUR' ? item.price : item.price * exchangeRate
        return {
          ...item,
          priceGBP: item.price * item.quantity,
          priceEUR: euroPrice * item.quantity,  // Respect currency selection
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
      <AuthModal 
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab="login"
      />
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[95vh] bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200/60 shadow-2xl rounded-xl p-0 flex flex-col [&>button]:hidden">
          <DialogTitle className="sr-only">Shporta</DialogTitle>
          
          {items.length === 0 ? (
            <div className="py-10 px-6 flex flex-col items-center justify-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-full mb-3">
                <ShoppingBag className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Shporta juaj është bosh</h3>
              <p className="text-gray-600 mb-5 text-center max-w-md text-sm">Shtoni produkte në shportë për të vazhduar me porosinë.</p>
              <Button
                onClick={handleContinueShopping}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200"
              >
                Kthehu në dyqan
              </Button>
            </div>
          ) : (
            <>
              {/* Fixed Invoice header with logo and company info */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-3 sm:px-4 py-2.5 rounded-t-xl relative flex-shrink-0 border-b border-slate-700/50">
                <div className="flex justify-between items-center gap-2">
                  {/* Left section - Company branding */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded border border-white/20 flex-shrink-0">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="font-bold text-sm sm:text-base tracking-tight truncate">{configs.COMPANY_NAME}</h1>
                      <p className="text-slate-300 text-xs hidden sm:block">Faturë porosie</p>
                    </div>
                  </div>
                  
                  {/* Center section - Order details */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
                      <Calendar className="h-3 w-3 text-slate-300" />
                      <span className="text-xs text-slate-200 font-medium">{currentDate}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-slate-400 hidden sm:block">Nr. porosie:</span>
                      <div className="text-xs sm:text-sm font-mono font-bold text-slate-200">
                        #{Math.random().toString(36).substr(2, 6).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Right section - Close button */}
                  <button
                    onClick={() => onOpenChange(false)}
                    className="text-white hover:text-slate-300 hover:bg-white/10 p-1.5 rounded transition-all duration-200 flex-shrink-0"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                {/* Product table */}
                <div className="px-4 py-3">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-gray-800">Produkte në shportë</h3>
                    <div className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {totalItems} {totalItems === 1 ? 'produkt' : 'produkte'}
                    </div>
                  </div>
                  
                  {/* Desktop Table View - Hidden on mobile */}
                  <div className="w-full hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full border-collapse text-xs table-fixed">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                          <th className="py-1.5 px-2 text-center font-semibold text-gray-700 border-b border-gray-200" style={{ width: '35px' }}>Nr.</th>
                          <th className="py-1.5 px-2 text-left font-semibold text-gray-700 border-b border-gray-200">Produkti</th>
                          <th className="py-1.5 px-2 text-right font-semibold text-gray-700 border-b border-gray-200" style={{ width: '70px' }}>Çmimi</th>
                          <th className="py-1.5 px-2 text-center font-semibold text-gray-700 border-b border-gray-200" style={{ width: '90px' }}>Sasia</th>
                          <th className="py-1.5 px-2 text-right font-semibold text-gray-700 border-b border-gray-200" style={{ width: '70px' }}>Totali</th>
                          <th className="py-1.5 px-2 text-center font-semibold text-gray-700 border-b border-gray-200" style={{ width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => {
                          const fees = item.price > 0 ? calculateFees(item.price, item.quantity, item.currency) : null
                          return (
                            <tr key={index} className={index % 2 === 0 ? "bg-white hover:bg-blue-50/30" : "bg-slate-50/50 hover:bg-blue-50/30"} style={{ transition: 'background-color 0.2s ease' }}>
                              <td className="py-1.5 px-2 text-center font-semibold text-gray-700 border-b border-gray-100">
                                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                              </td>
                              <td className="py-1.5 px-2 text-gray-800 border-b border-gray-100">
                                <div className="max-w-full overflow-hidden">
                                  <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center font-medium transition-colors duration-200"
                                  >
                                    <span className="truncate block">{item.title || item.url}</span>
                                    <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0 opacity-70" />
                                  </a>
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {item.size && (
                                      <span className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded text-xs">
                                        {item.size}
                                      </span>
                                    )}
                                    {item.color && (
                                      <span className="bg-purple-50 text-purple-700 px-1 py-0.5 rounded text-xs">
                                        {item.color}
                                      </span>
                                    )}
                                  </div>
                                  {item.additionalInfo && (
                                    <div className="text-xs text-gray-600 mt-0.5 truncate">{item.additionalInfo}</div>
                                  )}
                                </div>
                              </td>
                              <td className="py-1.5 px-2 text-right font-semibold text-gray-800 border-b border-gray-100">
                                {item.price > 0 ? (
                                  <Price 
                                    amount={item.currency === 'EUR' ? item.price : item.price * exchangeRate}
                                    className="font-semibold text-gray-800 text-xs"
                                  />
                                ) : (
                                  <span className="text-gray-400 font-medium">-</span>
                                )}
                              </td>
                              <td className="py-1.5 px-2 text-center text-gray-800 border-b border-gray-100">
                                <div className="flex items-center justify-center bg-gray-50 rounded p-0.5">
                                  <Button
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleQuantityChange(index, false)}
                                    className="h-5 w-5 p-0 hover:bg-white rounded transition-all duration-200"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="mx-1.5 font-bold text-gray-800 min-w-[1rem] text-center text-xs">{item.quantity}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleQuantityChange(index, true)}
                                    className="h-5 w-5 p-0 hover:bg-white rounded transition-all duration-200"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                              <td className="py-1.5 px-2 text-right font-bold text-gray-900 border-b border-gray-100">
                                {item.price > 0 ? (
                                  <Price 
                                    amount={(item.currency === 'EUR' ? item.price : item.price * exchangeRate) * item.quantity}
                                    className="font-bold text-gray-900 text-xs"
                                  />
                                ) : (
                                  <span className="text-gray-400 font-medium">-</span>
                                )}
                              </td>
                              <td className="py-1.5 px-2 text-center border-b border-gray-100">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(index)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-all duration-200"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Card View - Only visible on mobile */}
                  <div className="w-full sm:hidden space-y-2">
                    {items.map((item, index) => {
                      const fees = item.price > 0 ? calculateFees(item.price, item.quantity, item.currency) : null
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex justify-between items-start mb-1.5">
                            <div className="flex items-center">
                              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-1.5">
                                {index + 1}
                              </div>
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center text-xs font-semibold transition-colors duration-200"
                              >
                                <span className="truncate block max-w-[160px]">{item.title || item.url}</span>
                                <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0 opacity-70" />
                              </a>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-all duration-200"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="space-y-1 text-xs mb-2">
                            <div className="flex flex-wrap gap-1">
                              {item.size && (
                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                                  {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-xs">
                                  {item.color}
                                </span>
                              )}
                              {item.price > 0 && (
                                <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs">
                                  <Price 
                                    amount={item.currency === 'EUR' ? item.price : item.price * exchangeRate}
                                    className="font-medium"
                                    decimalClassName="text-[0.65em]"
                                  />
                                </span>
                              )}
                            </div>
                            
                            {item.additionalInfo && (
                              <div className="bg-gray-50 p-1.5 rounded text-xs text-gray-600 line-clamp-2">{item.additionalInfo}</div>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center border-t border-gray-200 pt-1.5 mt-1.5">
                            <div className="flex items-center bg-gray-50 rounded p-0.5">
                              <Button
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleQuantityChange(index, false)}
                                className="h-5 w-5 p-0 hover:bg-white rounded transition-all duration-200"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-xs font-bold min-w-[1rem] text-center mx-1">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleQuantityChange(index, true)}
                                className="h-5 w-5 p-0 hover:bg-white rounded transition-all duration-200"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Totali:</div>
                              <div className="font-bold text-xs">
                                {item.price > 0 ? (
                                  <Price 
                                    amount={(item.currency === 'EUR' ? item.price : item.price * exchangeRate) * item.quantity}
                                    className="font-bold text-gray-900"
                                    decimalClassName="text-[0.65em]"
                                  />
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Totals section */}
                <div className="px-4 py-2">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200 p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-xs text-gray-600">Çmimi bazë ({totalItems} produkte):</span>
                      <Price 
                        amount={orderTotals.basePriceEUR}
                        className="text-xs font-medium"
                        decimalClassName="text-[0.65em]"
                      />
                    </div>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-xs text-gray-600">Dogana ({(customsFeePercentage * 100).toFixed(0)}%):</span>
                      <Price 
                        amount={orderTotals.customsFee}
                        className="text-xs font-medium"
                        decimalClassName="text-[0.65em]"
                      />
                    </div>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-xs text-gray-600">Transport {uniqueProductTypes > 0 && `(${uniqueProductTypes} porosi)`}:</span>
                      <div className="text-right">
                        {shouldShowPreviousPrice ? (
                          <div className="flex items-center gap-1">
                            <Price 
                              amount={previousTransportFee * uniqueProductTypes}
                              className="text-xs text-gray-500 line-through"
                              decimalClassName="text-[0.65em]"
                            />
                            <Price 
                              amount={orderTotals.shippingFee}
                              className="text-xs font-medium"
                              decimalClassName="text-[0.65em]"
                            />
                          </div>
                        ) : (
                          <Price 
                            amount={orderTotals.shippingFee}
                            className="text-xs font-medium"
                            decimalClassName="text-[0.65em]"
                          />
                        )}
                      </div>
                    </div>
                    <Separator className="my-1.5" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Totali:</span>
                      <Price 
                        amount={orderTotals.totalEUR}
                        className="text-lg font-bold text-primary"
                        decimalClassName="text-[0.75em]"
                      />
                    </div>
                  </div>
                </div>

                {/* Order confirmation message */}
                <div className="px-4 pb-2">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2.5 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="bg-blue-100 p-0.5 rounded-full flex-shrink-0">
                        <Info className="h-3 w-3 text-blue-600" />
                      </div>
                      <p className="text-blue-800 text-xs font-medium">
                        Pasi të dërgoni porosinë, ekipi ynë do t'ju kontaktojë për të konfirmuar detajet dhe të organizojmë transportin.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Footer inside scrollable area */}
                <DialogFooter className="flex justify-between sm:justify-between gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-t-2 border-slate-200/60 rounded-b-xl">
                  <Button
                    variant="outline"
                    onClick={handleContinueShopping}
                    className="flex items-center gap-1.5 border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 px-3 py-1.5 font-medium text-sm"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Kthehu
                  </Button>
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-1.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Duke dërguar...
                      </>
                    ) : (
                      <>
                        Konfirmo Porosinë
                        <Check className="ml-1.5 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
