"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useProductFormStore, type ProductLink } from "@/lib/product-form-store"
import { useConfigStore } from "@/lib/config-store"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Info,
  Loader2,
  Calendar,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface OrderInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { productLinks: ProductLink[] }) => Promise<void>
}

export function OrderInvoiceModal({ open, onOpenChange, onSubmit }: OrderInvoiceModalProps) {
  const { productLinks } = useProductFormStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const currentDate = new Date().toLocaleDateString()
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
  const uniqueProductTypes = productLinks.length;
  
  // Calculate transport fee as flat fee multiplied by number of product types
  const totalTransportFee = transportFeePerProduct * uniqueProductTypes;

  // Calculate totals for all products
  const orderTotals = productLinks.reduce<OrderTotals>(
    (totals, link) => {
      if (link.price > 0) {
        const fees = calculateFees(link.price, link.quantity)
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

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Transform product links to include calculated fees
      const enrichedProductLinks = productLinks.map((link, index) => {
        const fees = link.price > 0 ? calculateFees(link.price, link.quantity) : null
        return {
          ...link,
          priceGBP: link.price * link.quantity,
          priceEUR: link.price * exchangeRate * link.quantity,  // Use exchange rate from config
          customsFee: fees?.customsFee || 0,
          transportFee: transportFeePerProduct // Fixed flat fee per product type, NOT to be multiplied by quantity
        }
      })
      
      await onSubmit({ productLinks: enrichedProductLinks })
      toast({
        title: "Sukses",
        description: "Porosia juaj u dërgua me sukses.",
      })
      
      // Redirect to orders page
      router.push("/orders")
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">FATURË</DialogTitle>
        </DialogHeader>
        
        {/* PDF-like header */}
        <div className="mb-4 pb-2 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Data: {currentDate}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-800">Pako24</div>
              <div className="text-sm text-gray-600">info@pako24.com</div>
              <div className="text-sm text-gray-600">+355 69 123 4567</div>
            </div>
          </div>
        </div>
        
        {/* Product table */}
        <div className="mb-4">
          <h2 className="text-base font-semibold mb-2">Produktet</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-1 px-2 text-center font-medium text-gray-700 border-b" style={{ width: '30px' }}>Nr.</th>
                  <th className="py-1 px-2 text-left font-medium text-gray-700 border-b">Produkti</th>
                  <th className="py-1 px-2 text-right font-medium text-gray-700 border-b" style={{ width: '80px' }}>Çmimi</th>
                  <th className="py-1 px-2 text-center font-medium text-gray-700 border-b" style={{ width: '50px' }}>Sasia</th>
                  <th className="py-1 px-2 text-right font-medium text-gray-700 border-b" style={{ width: '80px' }}>Totali</th>
                </tr>
              </thead>
              <tbody>
                {productLinks.map((link, index) => {
                  const fees = link.price > 0 ? calculateFees(link.price, link.quantity) : null
                  return (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-1 px-2 text-center font-medium text-gray-800 border-b">{index + 1}</td>
                      <td className="py-1 px-2 text-gray-800 border-b break-words">
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          {link.url}
                          <ExternalLink className="h-3 w-3 ml-1 inline" />
                        </a>
                        <div className="flex gap-2 mt-1">
                          {link.size && <span className="text-xs text-gray-500">Size: {link.size}</span>}
                          {link.color && <span className="text-xs text-gray-500">Color: {link.color}</span>}
                        </div>
                        {link.additionalInfo && (
                          <div className="text-xs text-gray-500 mt-1">{link.additionalInfo}</div>
                        )}
                      </td>
                      <td className="py-1 px-2 text-right font-medium text-gray-800 border-b">
                        {link.price > 0 ? (
                          <>
                            €{(link.price * exchangeRate).toFixed(2)}
                            <span className="block text-xs text-gray-500">£{link.price.toFixed(2)}</span>
                          </>
                        ) : "-"}
                      </td>
                      <td className="py-1 px-2 text-center text-gray-800 border-b">{link.quantity}</td>
                      <td className="py-1 px-2 text-right font-medium text-gray-800 border-b">
                        {link.price > 0 ? (
                          <span className="font-bold">€{(link.price * exchangeRate * link.quantity).toFixed(2)}</span>
                        ) : "-"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Totals section */}
        <div className="mb-4">
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
              <span className="text-sm text-gray-600">Menaxhimi dhe Transporti:</span>
              <span className="text-sm font-medium">€{orderTotals.shippingFee.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold">Totali:</span>
              <span className="text-lg font-bold text-primary">€{orderTotals.totalEUR.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mb-4">
          <div className="bg-amber-50 border border-amber-100 rounded-md p-2 text-xs">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-700">
                  Nëse pesha e produkteve është më shumë se 1kg, çmimi mund të rritet 2.5 euro çdo kg shtesë. Çmimi përfundimtar do të konfirmohet nga ekipi ynë pas verifikimit të porosisë.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between gap-1 pt-1 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  )
}
