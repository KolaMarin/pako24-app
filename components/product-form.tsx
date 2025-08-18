"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BasketInvoiceModal } from "@/components/basket-invoice-modal"
import { LoginModal } from "@/components/login-modal"
import { useBasketStore } from "@/lib/basket-store"
import { useProductFormStore, type ProductLink, getEmptyProduct } from "@/lib/product-form-store"
import { useConfigStore } from "@/lib/config-store"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Euro,
  Minus,
  RefreshCw,
  Download,
  Package,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/toaster"
import { Price } from "@/components/ui/price"

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
  
  // Get configuration values
  const exchangeRate = useConfigStore(state => state.getExchangeRate())
  const customsFeePercentage = useConfigStore(state => state.getCustomsFeePercentage())
  const transportFee = useConfigStore(state => state.getTransportFee())
  
  // Function to clear the form - no confirmation dialog
  const clearForm = () => {
    clearFormInStore()
    toast({
      title: "Formulari u pastrua",
      description: "Të gjitha të dhënat e formularit u fshinë.",
    })
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

  // Calculate euro price based on currency selection
  const calculateEuroPrice = (price: number, currency: string) => {
    return currency === 'EUR' ? price : price * exchangeRate; // No conversion for EUR, convert GBP
  }

  const calculateFees = (price: number, quantity: number, currency: string) => {
    const euroPrice = calculateEuroPrice(price, currency)
    const basePriceEUR = euroPrice * quantity
    const customsFee = basePriceEUR * customsFeePercentage // Use config value
    const shippingFee = transportFee // Use config value
    
    return {
      basePriceOriginal: price * quantity,
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
    <div className="w-full bg-slate-50 sm:bg-transparent">
      {/* Modals */}
      <BasketInvoiceModal 
        open={showBasketModal} 
        onOpenChange={setShowBasketModal} 
        onSubmit={handleFinalSubmit} 
      />
      
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
      
      {/* Product form card - Buttons now in scrollable area for all screen sizes */}
      <div className="relative bg-white overflow-hidden border border-primary/10 shadow-lg w-full h-auto md:flex md:flex-col">
        {/* Left accent bar - visible on all screen sizes */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary to-primary/70"></div>
        
        {/* Enhanced header section with modern gradient */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 py-4 sm:py-3 px-4 sm:px-4 border-b border-slate-600 md:flex-shrink-0 relative overflow-hidden">
          
          <div className="flex flex-col space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Detajet e Produktit
                  </h2>
                  <p className="text-xs text-slate-200 font-medium">Plotëso detajet e produktit dhe shto ne <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 inline text-slate-200"/></p>
                </div>
              </div>
              
              {productLinks[0].price > 0 && (
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                    <div className="flex items-center gap-1">
                      <Price 
                        amount={calculateEuroPrice(productLinks[0].price, productLinks[0].currency) * productLinks[0].quantity}
                        className="text-white font-bold text-sm"
                      />
                      {productLinks[0].quantity > 1 && <span className="text-white/80 text-xs">(×{productLinks[0].quantity})</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced form body with responsive spacing */}
        <div className="p-3 sm:p-4 md:p-3 lg:p-4 bg-gradient-to-b from-white to-gray-50/30">
          <div className="grid gap-3 sm:gap-4 md:gap-3 lg:gap-4">
            {/* Enhanced URL input - more compact */}
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg">
                  <LinkIcon className="h-3 w-3 text-white" />
                </div>
                <Label className="font-semibold text-gray-800 text-sm">
                  URL e Produktit <span className="text-red-500">*</span>
                </Label>
              </div>
              <div className="relative">
                <Input
                  value={productLinks[0].url}
                  onChange={(e) => updateProductLink(0, "url", e.target.value)}
                  required
                  placeholder="https://zara.com/product/..."
                  className={cn(
                    "h-10 sm:h-11 pl-3 pr-10 text-sm bg-gray-50/50 border rounded-lg",
                    validationErrors["0-url"] 
                      ? "border-red-400 bg-red-50/30" 
                      : "border-gray-200 focus-visible:border-blue-400 hover:border-gray-300",
                    "focus-visible:ring-1 focus-visible:ring-blue-200 focus-visible:ring-offset-0"
                  )}
                />
                {urlsLoading[0] && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  </div>
                )}
                {validationErrors["0-url"] && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors["0-url"] && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors["0-url"]}
                </p>
              )}
            </div>

            {/* Compact Price and Quantity layout */}
            <div className="grid grid-cols-2 gap-3">
              {/* Price Section */}
              <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-1 rounded">
                    <PoundSterling className="h-3 w-3 text-white" />
                  </div>
                  <Label className="font-semibold text-gray-800 text-xs sm:text-sm">Çmimi</Label>
                </div>
                <div className="flex h-9 sm:h-10 border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
                  <Select 
                    value={productLinks[0].currency} 
                    onValueChange={(value) => updateProductLink(0, "currency", value)}
                  >
                    <SelectTrigger className="w-14 sm:w-16 h-full border-0 border-r border-gray-200 rounded-none bg-white text-xs">
                      <SelectValue>
                        {productLinks[0].currency === 'EUR' ? '€' : '£'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={productLinks[0].price || ""}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value)
                      updateProductLink(0, "price", isNaN(value) ? 0 : value)
                    }}
                    step="0.01"
                    placeholder="0.00"
                    className="h-full border-0 rounded-none text-xs sm:text-sm font-semibold focus-visible:ring-0 flex-1 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-2"
                  />
                </div>
                {productLinks[0].price > 0 && productLinks[0].currency === 'GBP' && (
                  <p className="mt-1 text-xs text-green-600">
                    ≈ <Price amount={productLinks[0].price * exchangeRate} className="text-green-600" />
                  </p>
                )}
              </div>

              {/* Quantity Section */}
              <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-1 rounded">
                    <Package className="h-3 w-3 text-white" />
                  </div>
                  <Label className="font-semibold text-gray-800 text-xs sm:text-sm">
                    Sasia <span className="text-red-500">*</span>
                  </Label>
                </div>
                <div className="flex h-9 sm:h-10 border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-full w-8 rounded-none border-r border-gray-200 hover:bg-purple-50 p-0"
                    onClick={() => {
                      if (productLinks[0].quantity > 1) {
                        updateProductLink(0, "quantity", Math.max(1, productLinks[0].quantity - 1))
                      }
                    }}
                    disabled={productLinks[0].quantity <= 1}
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
                    className="h-full text-center text-sm font-bold bg-white focus-visible:ring-0 border-0 rounded-none flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-full w-8 rounded-none border-l border-gray-200 hover:bg-purple-50 p-0"
                    onClick={() => updateProductLink(0, "quantity", productLinks[0].quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {validationErrors["0-quantity"] && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationErrors["0-quantity"]}
                  </p>
                )}
              </div>
            </div>

            {/* Compact Size, Color and Additional Info in one row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Size */}
              <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <Ruler className="h-3 w-3 text-indigo-600" />
                  <Label className="font-semibold text-gray-800 text-xs sm:text-sm">Madhësia</Label>
                </div>
                <Input
                  value={productLinks[0].size}
                  onChange={(e) => updateProductLink(0, "size", e.target.value)}
                  placeholder="XL, 42"
                  className="h-9 sm:h-10 text-sm bg-gray-50/50 border border-gray-200 rounded-lg focus-visible:border-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-200 px-3"
                />
              </div>

              {/* Color */}
              <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <Palette className="h-3 w-3 text-pink-600" />
                  <Label className="font-semibold text-gray-800 text-xs sm:text-sm">Ngjyra</Label>
                </div>
                <Input
                  value={productLinks[0].color}
                  onChange={(e) => updateProductLink(0, "color", e.target.value)}
                  placeholder="blu, kuqe"
                  className="h-9 sm:h-10 text-sm bg-gray-50/50 border border-gray-200 rounded-lg focus-visible:border-pink-400 focus-visible:ring-1 focus-visible:ring-pink-200 px-3"
                />
              </div>

              {/* Additional Info - spans full width on mobile */}
              <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm sm:col-span-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <Info className="h-3 w-3 text-amber-600" />
                  <Label className="font-semibold text-gray-800 text-xs sm:text-sm">Info</Label>
                </div>
                <Textarea
                  value={productLinks[0].additionalInfo}
                  onChange={(e) => updateProductLink(0, "additionalInfo", e.target.value)}
                  placeholder="Udhëzime speciale..."
                  className="min-h-[36px] sm:min-h-[40px] text-sm bg-gray-50/50 border border-gray-200 rounded-lg focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-200 resize-none py-2 px-3"
                  rows={1}
                />
              </div>
            </div>
            
            {/* Compact action buttons */}
            <div className="flex justify-between items-center gap-3 pt-3 border-t border-gray-100">
              <Button 
                variant="outline"
                onClick={clearForm}
                className="h-10 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Pastro</span>
              </Button>
              
              <Button
                onClick={handleAddToBasket}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold h-10 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Po shtohet...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-bold">Shto në Shportë</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
