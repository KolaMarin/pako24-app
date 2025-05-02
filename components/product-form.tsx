"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { debounce } from "lodash"
import { BasketInvoiceModal } from "@/components/basket-invoice-modal"
import { LoginModal } from "@/components/login-modal"
import { useBasketStore } from "@/lib/basket-store"
import { useProductFormStore, type ProductLink, getEmptyProduct } from "@/lib/product-form-store"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Trash2,
  LinkIcon,
  Info,
  ShoppingCart,
  Palette,
  Ruler,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
  Loader2,
  PoundSterling,
  Minus,
  RefreshCw,
  Download,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/toaster"

// ProductLink type is now imported from product-form-store.ts

interface ProductFormProps {
  onSubmit: (data: { productLinks: ProductLink[] }) => Promise<void>
}

export function ProductForm({ onSubmit }: ProductFormProps) {
  // Use the Zustand store instead of local state
  const { 
    productLinks, 
    addProductLink: addProductLinkToStore, 
    updateProductLink: updateProductLinkInStore,
    removeProductLink: removeProductLinkFromStore,
    clearForm: clearFormInStore
  } = useProductFormStore()
  const { addItem } = useBasketStore()
  const [showBasketModal, setShowBasketModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [urlsLoading, setUrlsLoading] = useState<{[key: number]: boolean}>({})
  const router = useRouter()
  const { user } = useAuth()
  
  // Function to clear the form
  const clearForm = () => {
    if (window.confirm("Jeni i sigurt që dëshironi të pastroni formularin? Të gjitha të dhënat do të fshihen.")) {
      clearFormInStore()
      toast({
        title: "Formulari u pastrua",
        description: "Të gjitha të dhënat e formularit u fshinë.",
      })
    }
  }
  
  // Function to reset form fields without clearing the form itself
  const resetFormFields = () => {
    updateProductLinkInStore(0, "url", "")
    updateProductLinkInStore(0, "quantity", 1)
    updateProductLinkInStore(0, "size", "")
    updateProductLinkInStore(0, "color", "")
    updateProductLinkInStore(0, "additionalInfo", "")
    updateProductLinkInStore(0, "price", 0)
    updateProductLinkInStore(0, "title", "")
    
    // Reset validation errors
    setValidationErrors({})
  }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [expandedProductIndex, setExpandedProductIndex] = useState<number | null>(0) // Start with first product expanded

  // No need for the useEffect to save to localStorage - Zustand handles that automatically

  const addProductLink = () => {
    // Use the store's function to add a product
    addProductLinkToStore()

    // Expand the new product
    setExpandedProductIndex(productLinks.length)

    // Scroll to the new product after a short delay to allow rendering
    setTimeout(() => {
      const newProductElement = document.getElementById(`product-${productLinks.length}`)
      if (newProductElement) {
        newProductElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 100)
  }

  const removeProductLink = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()

    if (productLinks.length > 1) {
      removeProductLinkFromStore(index)

      // If we're removing the expanded product, collapse all
      if (expandedProductIndex === index) {
        setExpandedProductIndex(null)
      }
      // If we're removing a product before the expanded one, adjust the index
      else if (expandedProductIndex !== null && expandedProductIndex > index) {
        setExpandedProductIndex(expandedProductIndex - 1)
      }
    } else {
      // Clear the form instead of showing a toast message
      updateProductLinkInStore(index, "url", "")
      updateProductLinkInStore(index, "quantity", 1)
      updateProductLinkInStore(index, "size", "")
      updateProductLinkInStore(index, "color", "")
      updateProductLinkInStore(index, "additionalInfo", "")
      updateProductLinkInStore(index, "price", 0)
      updateProductLinkInStore(index, "title", "")
    }
  }

  const calculateFees = (price: number, quantity: number) => {
    const euroPrice = price * 1.15 // Approximate GBP to EUR conversion
    const basePriceEUR = euroPrice * quantity
    const customsFee = basePriceEUR * 0.2 // 20% of price in EUR
    const shippingFee = 10 // Base shipping fee of 10€ per order, not per product
    
    return {
      basePriceGBP: price * quantity,
      basePriceEUR,
      customsFee,
      shippingFee: shippingFee, // Flat fee, not multiplied by quantity
      totalEUR: basePriceEUR + customsFee + shippingFee,
    }
  }

  // Empty placeholder function for URL loading indicator
  const setUrlLoadingState = (index: number, isLoading: boolean) => {
    setUrlsLoading(prev => ({ ...prev, [index]: isLoading }))
  }

  const updateProductLink = (index: number, field: keyof ProductLink, value: string | number | boolean) => {
    // Use the store's function to update a product
    updateProductLinkInStore(index, field, value)

    // Clear validation error when field is updated
    if (validationErrors[`${index}-${field}`]) {
      const newErrors = { ...validationErrors }
      delete newErrors[`${index}-${field}`]
      setValidationErrors(newErrors)
    }
    
    // No automatic data extraction - all fields must be manually entered
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    let firstErrorIndex: number | null = null

    productLinks.forEach((link, index) => {
      if (!link.url) {
        errors[`${index}-url`] = "URL është e detyrueshme"
        if (firstErrorIndex === null) firstErrorIndex = index
      } else if (!link.url.startsWith("http")) {
        errors[`${index}-url`] = "URL duhet të fillojë me http:// ose https://"
        if (firstErrorIndex === null) firstErrorIndex = index
      }

      if (link.quantity < 1) {
        errors[`${index}-quantity`] = "Sasia duhet të jetë të paktën 1"
        if (firstErrorIndex === null) firstErrorIndex = index
      }
    })

    setValidationErrors(errors)
    
    // Expand the first product with an error
    if (firstErrorIndex !== null) {
      setExpandedProductIndex(firstErrorIndex)
      
      // Scroll to the product with error
      setTimeout(() => {
        const errorElement = document.getElementById(`product-${firstErrorIndex}`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    }
    
    return Object.keys(errors).length === 0
  }

  const handleAddToBasket = () => {
    if (!validateForm()) {
      toast({
        title: "Gabim",
        description: "Ju lutemi korrigjoni fushat e shënuara me të kuqe.",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a copy of the product to add to basket
      const productToAdd = { ...productLinks[0] };
      
      // Add the product to the basket
      addItem(productToAdd);
      
      // Show success message with visual feedback
      toast({
        title: "Sukses!",
        description: (
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <span>Produkti u shtua në shportë me sukses.</span>
          </div>
        ),
        duration: 3000,
      })
      
      // Reset form fields without clearing the form itself
      resetFormFields()
    } catch (error) {
      console.error("Error adding item to basket:", error);
      toast({
        title: "Gabim",
        description: "Ndodhi një problem gjatë shtimit të produktit në shportë.",
        variant: "destructive",
      })
    }
  }
  
  const handleFinalSubmit = async (data: { productLinks: ProductLink[] }) => {
    try {
      await onSubmit(data)
      toast({
        title: "Sukses",
        description: "Porosia juaj u dërgua me sukses.",
      })
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Dërgimi i porosisë dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const toggleProductExpansion = (index: number) => {
    if (expandedProductIndex === index) {
      setExpandedProductIndex(null) // Collapse if already expanded
    } else {
      setExpandedProductIndex(index) // Expand this product
    }
  }


  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Basket/Invoice Modal */}
      <BasketInvoiceModal 
        open={showBasketModal} 
        onOpenChange={setShowBasketModal} 
        onSubmit={handleFinalSubmit} 
      />
      
      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
      
      {/* Compact Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mb-4 text-xs">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700">
            Vendosni URL e produktit, sasinë, madhësinë dhe ngjyrën. Klikoni <span className="font-medium">Shto në Shportë</span> dhe 
            vazhdoni me ikonën e shportës <ShoppingCart className="h-3.5 w-3.5 text-primary inline mx-0.5" /> në krye të faqes.
          </p>
        </div>
      </div>

      {/* Single product form, always open */}
      <div className="relative">
        <div className="absolute -left-1 top-0 h-full w-1 bg-primary rounded-r-md" />
        <div className="bg-white rounded-lg border shadow-md overflow-hidden border-primary-300">
          <div className="py-2 px-3 bg-primary-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <h3 className="text-base font-medium text-gray-800">Detajet e Produktit</h3>
              </div>
              
              <div className="flex items-center gap-2">
                {productLinks[0].price > 0 && (
                  <div className="text-sm font-medium text-primary">
                    €{(productLinks[0].price * 1.15 * productLinks[0].quantity).toFixed(2)}
                    <span className="text-xs text-gray-500 ml-1">(£{(productLinks[0].price * productLinks[0].quantity).toFixed(2)})</span>
                  </div>
                )}
                <Button
                  onClick={handleAddToBasket}
                  disabled={isSubmitting}
                  className="h-8 bg-primary hover:bg-primary/90 text-white"
                  size="sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      Shto në Shportë
                      <ShoppingCart className="ml-2 h-3.5 w-3.5" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
            
            {/* URL and quantity information removed from header */}
          </div>
          
          <div className="p-3 bg-white space-y-3">
            <div className="space-y-3">
              {/* URL and Quantity */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <LinkIcon className="h-3.5 w-3.5 text-primary mr-1" />
                    <Label className="text-xs font-medium text-gray-700">
                      URL e Produktit <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <div className="relative">
                      <Input
                        value={productLinks[0].url}
                        onChange={(e) => updateProductLink(0, "url", e.target.value)}
                        required
                        placeholder="https://www.example.com/product"
                        className={cn(
                          "h-9 pl-2 pr-8 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0",
                          validationErrors["0-url"] ? "border-red-500 focus-visible:ring-red-500" : "",
                        )}
                      />
                      {urlsLoading[0] && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                    {validationErrors["0-url"] && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  {validationErrors["0-url"] && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors["0-url"]}
                    </p>
                  )}
                </div>

                <div className="w-24">
                  <div className="flex items-center mb-1">
                    <Label className="text-xs font-medium text-gray-700">
                      Sasia <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-7 rounded-none border-r border-gray-200 hover:bg-gray-50"
                      onClick={() => {
                        if (productLinks[0].quantity > 1) {
                          updateProductLink(0, "quantity", Math.max(1, productLinks[0].quantity - 1))
                        }
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={productLinks[0].quantity}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (!isNaN(value) && value >= 1) {
                          updateProductLink(0, "quantity", value)
                        }
                      }}
                      min="1"
                      step="1"
                      required
                      className={cn(
                        "h-9 text-center text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 border-0 rounded-none",
                        validationErrors["0-quantity"]
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "",
                        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-7 rounded-none border-l border-gray-200 hover:bg-gray-50"
                      onClick={() => updateProductLink(0, "quantity", productLinks[0].quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Size, Color, Price */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center mb-1">
                    <Ruler className="h-3.5 w-3.5 text-primary mr-1" />
                    <Label className="text-xs font-medium text-gray-700">Madhësia</Label>
                  </div>
                  <Input
                    value={productLinks[0].size}
                    onChange={(e) => updateProductLink(0, "size", e.target.value)}
                    placeholder="S/M/L/XL/42/..."
                    className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                  />
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <Palette className="h-3.5 w-3.5 text-primary mr-1" />
                    <Label className="text-xs font-medium text-gray-700">Ngjyra</Label>
                  </div>
                  <Input
                    value={productLinks[0].color}
                    onChange={(e) => updateProductLink(0, "color", e.target.value)}
                    placeholder="E zezë, e bardhë, etj."
                    className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                  />
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <PoundSterling className="h-3.5 w-3.5 text-primary mr-1" />
                    <Label className="text-xs font-medium text-gray-700">Çmimi (£)</Label>
                  </div>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={productLinks[0].price || ""}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value)
                      updateProductLink(0, "price", isNaN(value) ? 0 : value)
                    }}
                    step="0.01"
                    placeholder="0.00"
                    className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Additional info */}
              <div>
                <div className="flex items-center mb-1">
                  <Info className="h-3.5 w-3.5 text-primary mr-1" />
                  <Label className="text-xs font-medium text-gray-700">Informacion shtesë</Label>
                </div>
                <Textarea
                  value={productLinks[0].additionalInfo}
                  onChange={(e) => updateProductLink(0, "additionalInfo", e.target.value)}
                  placeholder="Detaje shtesë për këtë produkt..."
                  className="min-h-0 h-14 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}
