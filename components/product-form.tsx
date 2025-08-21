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
  Sparkles,
  Tag,
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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
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
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl shadow-slate-900/5 overflow-hidden"
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500"></div>

          <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-6 border-b border-slate-600/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white mb-1">Detajet e Produktit</h2>
                    <p className="text-xs md:text-sm text-slate-200 flex items-center gap-2">
                      Plotëso detajet dhe shto në shportë
                      <ShoppingCart className="h-4 w-4" />
                    </p>
                  </div>
                </div>

                {productLinks[0].price > 0 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl shadow-lg border border-white/20"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <div className="text-right">
                        <Price
                          amount={calculateEuroPrice(productLinks[0].price, productLinks[0].currency) * productLinks[0].quantity}
                          className="text-white font-bold text-sm md:text-lg"
                        />
                        {productLinks[0].quantity > 1 && (
                          <div className="text-white/80 text-xs">×{productLinks[0].quantity} copë</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        
          <div className="p-6 space-y-6">
            <div className="group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                  <LinkIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <Label className="font-semibold text-slate-800 text-base">
                  URL e Produktit <span className="text-red-500 ml-1">*</span>
                </Label>
              </div>
              <div className="relative">
                <Input
                  value={productLinks[0].url}
                  onChange={(e) => updateProductLink(0, "url", e.target.value)}
                  required
                  placeholder="https://zara.com/product/..."
                  className={cn(
                    "h-12 pl-4 pr-12 text-base bg-slate-50/50 border-2 rounded-xl transition-all duration-200",
                    validationErrors["0-url"]
                      ? "border-red-400 bg-red-50/50 focus-visible:border-red-500"
                      : "border-slate-200 focus-visible:border-blue-500 hover:border-slate-300 group-hover:border-blue-300",
                    "focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm",
                  )}
                />
                {urlsLoading[0] && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  </div>
                )}
                {validationErrors["0-url"] && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors["0-url"] && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg"
                >
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors["0-url"]}
                </motion.p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-sm">
                    <PoundSterling className="h-3.5 w-3.5 text-white" />
                  </div>
                  <Label className="font-semibold text-slate-800 text-base">Çmimi</Label>
                </div>
                <div className="flex h-12 border-2 border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm group-hover:border-emerald-300 transition-colors">
                  <Select value={productLinks[0].currency} onValueChange={(value) => updateProductLink(0, "currency", value)}>
                    <SelectTrigger className="w-20 h-full border-0 border-r-2 border-slate-200 rounded-none bg-slate-50 text-sm font-medium">
                      <SelectValue>{productLinks[0].currency === "EUR" ? "€" : "£"}</SelectValue>
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
                    className="h-full border-0 rounded-none text-base font-semibold focus-visible:ring-0 flex-1 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-4"
                  />
                </div>
                {productLinks[0].price > 0 && productLinks[0].currency === "GBP" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg"
                  >
                    ≈ <Price amount={productLinks[0].price * exchangeRate} className="text-emerald-600 font-medium" />
                  </motion.p>
                )}
              </div>

              <div className="group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-sm">
                    <Package className="h-3.5 w-3.5 text-white" />
                  </div>
                  <Label className="font-semibold text-slate-800 text-base">
                    Sasia <span className="text-red-500 ml-1">*</span>
                  </Label>
                </div>
                <div className="flex h-12 border-2 border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm group-hover:border-purple-300 transition-colors">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-full w-12 rounded-none border-r-2 border-slate-200 hover:bg-purple-50 transition-colors"
                    onClick={() => {
                      if (productLinks[0].quantity > 1) {
                        updateProductLink(0, "quantity", Math.max(1, productLinks[0].quantity - 1))
                      }
                    }}
                    disabled={productLinks[0].quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
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
                    className="h-full text-center text-base font-bold bg-white focus-visible:ring-0 border-0 rounded-none flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-full w-12 rounded-none border-l-2 border-slate-200 hover:bg-purple-50 transition-colors"
                    onClick={() => updateProductLink(0, "quantity", productLinks[0].quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {validationErrors["0-quantity"] && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors["0-quantity"]}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <div className="flex items-center gap-3 mb-3">
                  <Ruler className="h-4 w-4 text-indigo-600" />
                  <Label className="font-semibold text-slate-800 text-base">Madhësia</Label>
                </div>
                <Input
                  value={productLinks[0].size}
                  onChange={(e) => updateProductLink(0, "size", e.target.value)}
                  placeholder="XL, 42, Medium..."
                  className="h-12 text-base bg-slate-50/50 border-2 border-slate-200 rounded-xl focus-visible:border-indigo-500 focus-visible:ring-0 px-4 group-hover:border-indigo-300 transition-colors shadow-sm"
                />
              </div>

              <div className="group">
                <div className="flex items-center gap-3 mb-3">
                  <Palette className="h-4 w-4 text-pink-600" />
                  <Label className="font-semibold text-slate-800 text-base">Ngjyra</Label>
                </div>
                <Input
                  value={productLinks[0].color}
                  onChange={(e) => updateProductLink(0, "color", e.target.value)}
                  placeholder="Blu, Kuqe, Bardhë..."
                  className="h-12 text-base bg-slate-50/50 border-2 border-slate-200 rounded-xl focus-visible:border-pink-500 focus-visible:ring-0 px-4 group-hover:border-pink-300 transition-colors shadow-sm"
                />
              </div>
            </div>

            <div className="group">
              <div className="flex items-center gap-3 mb-3">
                <Info className="h-4 w-4 text-amber-600" />
                <Label className="font-semibold text-slate-800 text-base">Informacione Shtesë</Label>
              </div>
              <Textarea
                value={productLinks[0].additionalInfo}
                onChange={(e) => updateProductLink(0, "additionalInfo", e.target.value)}
                placeholder="Udhëzime speciale, preferenca, ose detaje të tjera..."
                className="min-h-[100px] text-base bg-slate-50/50 border-2 border-slate-200 rounded-xl focus-visible:border-amber-500 focus-visible:ring-0 resize-none py-3 px-4 group-hover:border-amber-300 transition-colors shadow-sm"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={clearForm}
                className="h-12 px-6 rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium flex items-center justify-center gap-3 transition-all duration-200 shadow-sm bg-transparent"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Pastro Formularin</span>
              </Button>

              <Button
                onClick={handleAddToBasket}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Po shtohet...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Shto në Shportë</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
