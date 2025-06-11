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
    <div className="w-full mx-auto px-1 py-0 sm:p-2 space-y-2 sm:space-y-3 pt-1 md:pt-2 sm:relative bg-gray-50 sm:bg-transparent">
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
      <div className="relative bg-white rounded-xl overflow-hidden border border-primary/10 shadow-lg w-full h-auto md:flex md:flex-col">
        {/* Left accent bar - hidden on mobile */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary to-primary/70 hidden md:block"></div>
        
        {/* Header section - FIXED on desktop, scrolls on mobile */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 py-2.5 sm:py-2 px-3 sm:px-3 border-b border-slate-200 md:flex-shrink-0">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="bg-primary/10 p-1 sm:p-1.5 rounded-full">
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-800">Detajet e Produktit</h2>
              </div>
              
              {productLinks[0].price > 0 && (
                <div className="flex items-center">
                  <Badge 
                    variant="outline" 
                    className="bg-primary/5 border-primary/20 text-primary font-semibold px-1.5 py-0.5"
                  >
                    <Price 
                      amount={calculateEuroPrice(productLinks[0].price, productLinks[0].currency) * productLinks[0].quantity}
                      className="text-primary"
                    />
                    {productLinks[0].quantity > 1 && <span className="ml-0.5 text-primary/80 font-medium">(x{productLinks[0].quantity})</span>}
                  </Badge>
                </div>
              )}
            </div>
            <p className="text-[11px] text-blue-500">
              Vendosni URL dhe detajet. Klikoni Shto dhe vazhdoni me <span className="font-bold">shportën</span> <ShoppingCart className="h-3 w-3 inline-block font-bold" />
            </p>
          </div>
        </div>
        
        {/* Form body with buttons - SCROLLABLE on desktop, normal flow on mobile */}
        <div className="p-3 sm:p-4 md:p-3 lg:p-4">
          <div className="grid gap-4 sm:gap-5 md:gap-3 lg:gap-4">
            {/* URL - full width */}
            <div className="flex flex-col space-y-2 sm:space-y-3">
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <LinkIcon className="h-3.5 w-3.5 text-primary" />
                  <Label className="font-medium text-gray-700 text-xs">
                    URL <span className="text-red-500">*</span>
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    value={productLinks[0].url}
                    onChange={(e) => updateProductLink(0, "url", e.target.value)}
                    required
                    placeholder="https://example.com/..."
                    className={cn(
                      "h-11 pl-2 pr-7 text-xs focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 transition-all",
                      validationErrors["0-url"] ? "border-red-500 focus-visible:ring-red-300" : "border-gray-200",
                    )}
                  />
                  {urlsLoading[0] && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    </div>
                  )}
                  {validationErrors["0-url"] && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500">
                      <AlertCircle className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                {validationErrors["0-url"] && (
                  <p className="mt-0.5 text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-0.5 flex-shrink-0" />
                    {validationErrors["0-url"]}
                  </p>
                )}
              </div>
            </div>

            {/* Price and Quantity - 2 columns */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <Label className="font-medium text-gray-700 text-xs">Çmimi</Label>
                </div>
                <div className="relative">
                  <div className="flex h-11 border border-gray-200 rounded-md overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
                    {/* Currency Selector */}
                    <Select 
                      value={productLinks[0].currency} 
                      onValueChange={(value) => updateProductLink(0, "currency", value)}
                    >
                      <SelectTrigger className="w-16 h-full border-0 border-r border-gray-200 rounded-none bg-gray-50/50 hover:bg-gray-50 focus:ring-0 focus:ring-offset-0">
                        <SelectValue>
                          <div className="flex items-center gap-1">
                            {productLinks[0].currency === 'EUR' ? (
                              <Euro className="h-3.5 w-3.5 text-gray-600" />
                            ) : (
                              <PoundSterling className="h-3.5 w-3.5 text-gray-600" />
                            )}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">
                          <div className="flex items-center gap-2">
                            <span>GBP (£)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="EUR">
                          <div className="flex items-center gap-2">
                            <span>EUR (€)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Price Input */}
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
                      className="h-full border-0 rounded-none text-xs focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  
                  {/* Real-time conversion display */}
                  {productLinks[0].price > 0 && productLinks[0].currency === 'GBP' && (
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                       ≈ <Price 
                         amount={productLinks[0].price * exchangeRate}
                         className="text-gray-500"
                         decimalClassName="text-[0.65em]"
                       />
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <Label className="font-medium text-gray-700 text-xs">
                    Sasia <span className="text-red-500">*</span>
                  </Label>
                </div>
                <div className="flex h-11 border border-gray-200 rounded-md overflow-hidden shadow-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-full rounded-none border-r border-gray-200 hover:bg-gray-50 flex-1 px-1"
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
                    step="1"
                    required
                    className={cn(
                      "h-full text-center text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 border-0 rounded-none flex-1 p-0 w-6",
                      validationErrors["0-quantity"] ? "border-red-500 focus-visible:ring-red-300" : "",
                      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-full rounded-none border-l border-gray-200 hover:bg-gray-50 flex-1 px-1"
                    onClick={() => updateProductLink(0, "quantity", productLinks[0].quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {validationErrors["0-quantity"] && (
                  <p className="mt-0.5 text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-0.5" />
                    {validationErrors["0-quantity"]}
                  </p>
                )}
              </div>
            </div>

            {/* Size and Color - 2 columns */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <Ruler className="h-3.5 w-3.5 text-primary" />
                  <Label className="font-medium text-gray-700 text-xs">Madhësia</Label>
                </div>
                <Input
                  value={productLinks[0].size}
                  onChange={(e) => updateProductLink(0, "size", e.target.value)}
                  placeholder="XL/42"
                  inputMode="text"
                  className="h-11 text-xs focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 transition-all pl-2 border-gray-200"
                />
              </div>

              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <Palette className="h-3.5 w-3.5 text-primary" />
                  <Label className="font-medium text-gray-700 text-xs">Ngjyra</Label>
                </div>
                <Input
                  value={productLinks[0].color}
                  onChange={(e) => updateProductLink(0, "color", e.target.value)}
                  placeholder="blu/kuqe"
                  inputMode="text"
                  className="h-11 text-xs focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 transition-all pl-2 border-gray-200"
                />
              </div>
            </div>

            {/* Additional info - more compact for mobile */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <Info className="h-3.5 w-3.5 text-primary" />
                <Label className="font-medium text-gray-700 text-xs">Info shtesë</Label>
              </div>
              <Textarea
                value={productLinks[0].additionalInfo}
                onChange={(e) => updateProductLink(0, "additionalInfo", e.target.value)}
                placeholder="p.sh. Dërgesa të bëhet pas orës 17:00"
                className="min-h-[60px] text-xs focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 transition-all border-gray-200 resize-none py-2 px-2 overflow-hidden"
                rows={2}
              />
            </div>
            
            {/* Action buttons - inside scrollable area for all screen sizes */}
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline"
                size="sm"
                onClick={clearForm}
                className="text-gray-700 border-gray-300 shadow-sm text-xs h-8 px-2 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Pastro
              </Button>
              
              <Button
                onClick={handleAddToBasket}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white text-xs h-8 px-3 shadow-sm"
                size="sm"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Shto në Shportë</span>
                    <span className="sm:hidden">Shto</span>
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
