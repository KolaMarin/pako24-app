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

  const calculateFees = (price: number, quantity: number) => {
    const euroPrice = price * 1.15 // Approximate GBP to EUR conversion
    const basePriceEUR = euroPrice * quantity
    const customsFee = basePriceEUR * 0.2 // 20% of price in EUR
    const shippingFee = transportFeePerProduct // Base shipping fee per product
    
    return {
      basePriceGBP: price * quantity,
      basePriceEUR,
      customsFee,
      shippingFee: shippingFee, // Flat fee, not multiplied by quantity
      totalEUR: basePriceEUR + customsFee + shippingFee,
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

  // Calculate totals for all products
  const orderTotals = productLinks.reduce<OrderTotals>(
    (totals, link) => {
      if (link.price > 0) {
        const fees = calculateFees(link.price, link.quantity)
        return {
          basePriceGBP: totals.basePriceGBP + fees.basePriceGBP,
          basePriceEUR: totals.basePriceEUR + fees.basePriceEUR,
          customsFee: totals.customsFee + fees.customsFee,
          shippingFee: totals.shippingFee, // Keep the flat fee
          totalEUR: totals.totalEUR + fees.basePriceEUR + fees.customsFee,
        }
      }
      return totals
    },
    { basePriceGBP: 0, basePriceEUR: 0, customsFee: 0, shippingFee: transportFeePerProduct * productLinks.length, totalEUR: 0 }
  )
  
  // Add shipping fee to total
  orderTotals.totalEUR += orderTotals.shippingFee

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Calculate transport fee based on the number of products
      const totalTransportFee = transportFeePerProduct * productLinks.length;
      
      // Transform product links to include calculated fees
      const enrichedProductLinks = productLinks.map((link, index) => {
        const fees = link.price > 0 ? calculateFees(link.price, link.quantity) : null
        return {
          ...link,
          priceGBP: link.price * link.quantity,  // Price already includes quantity
          priceEUR: link.price * 1.15 * link.quantity,  // Price already includes quantity
          customsFee: fees?.customsFee || 0,
          // Use flat fee per product from configuration
          transportFee: transportFeePerProduct
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">FATURË</DialogTitle>
        </DialogHeader>
        
        {/* PDF-like header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
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
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Produktet</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-3 text-center text-sm font-medium text-gray-700 border-b" style={{ width: '60px' }}>Nr.</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 border-b">Produkti</th>
                  <th className="py-2 px-3 text-center text-sm font-medium text-gray-700 border-b">Madhësia</th>
                  <th className="py-2 px-3 text-center text-sm font-medium text-gray-700 border-b">Ngjyra</th>
                  <th className="py-2 px-3 text-center text-sm font-medium text-gray-700 border-b">Sasia</th>
                  <th className="py-2 px-3 text-right text-sm font-medium text-gray-700 border-b">Çmimi Njësi</th>
                  <th className="py-2 px-3 text-right text-sm font-medium text-gray-700 border-b">Totali</th>
                </tr>
              </thead>
              <tbody>
                {productLinks.map((link, index) => {
                  const fees = link.price > 0 ? calculateFees(link.price, link.quantity) : null
                  return (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-2 px-3 text-sm text-center font-medium text-gray-800 border-b">{index + 1}</td>
                      <td className="py-2 px-3 text-sm text-gray-800 border-b">
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          {link.url.length > 40 ? `${link.url.substring(0, 40)}...` : link.url}
                          <ExternalLink className="h-3 w-3 ml-1 inline" />
                        </a>
                        {link.additionalInfo && (
                          <div className="text-xs text-gray-500 mt-1">{link.additionalInfo}</div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-sm text-center text-gray-800 border-b">{link.size || "-"}</td>
                      <td className="py-2 px-3 text-sm text-center text-gray-800 border-b">{link.color || "-"}</td>
                      <td className="py-2 px-3 text-sm text-center text-gray-800 border-b">{link.quantity}</td>
                      <td className="py-2 px-3 text-sm text-right font-medium text-gray-800 border-b">
                        {link.price > 0 ? (
                          <>
                            €{(link.price * 1.15).toFixed(2)}
                            <span className="text-xs text-gray-500 ml-1">(£{link.price.toFixed(2)})</span>
                          </>
                        ) : "-"}
                      </td>
                      <td className="py-2 px-3 text-sm text-right font-medium text-gray-800 border-b">
                        {link.price > 0 ? (
                          <>
                            <span className="font-bold">€{(link.price * 1.15 * link.quantity).toFixed(2)}</span>
                          </>
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
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Çmimi bazë:</span>
              <div className="text-right">
                <span className="text-sm font-medium">€{orderTotals.basePriceEUR.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Dogana (20%):</span>
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
        <div className="mb-6">
          <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm">
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

        <DialogFooter className="flex justify-between sm:justify-between gap-2 pt-2 border-t border-gray-200">
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
