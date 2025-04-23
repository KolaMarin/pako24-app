"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { debounce } from "lodash"
import { OrderInvoiceModal } from "@/components/order-invoice-modal"
import { LoginModal } from "@/components/login-modal"
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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
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

  // Function to fetch product details from URL
  const fetchProductDetails = async (url: string, index: number) => {
    if (!url || !url.startsWith('http')) return

    setUrlsLoading(prev => ({ ...prev, [index]: true }))
    
    try {
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        console.error('Error fetching product details:', await response.text())
        return
      }

      const data = await response.json()
      
      // Update product details with fetched data
      if (data.price) {
        updateProductLinkInStore(index, 'price', data.price)
      }
      
      if (data.size) {
        updateProductLinkInStore(index, 'size', data.size)
      }
      
      if (data.color) {
        updateProductLinkInStore(index, 'color', data.color)
      }
      
    } catch (error) {
      console.error('Error fetching product details:', error)
    } finally {
      setUrlsLoading(prev => ({ ...prev, [index]: false }))
    }
  }

  // Debounced version of fetchProductDetails to avoid too many requests
  const debouncedFetchProductDetails = useCallback(
    debounce((url: string, index: number) => fetchProductDetails(url, index), 800),
    []
  )

  const updateProductLink = (index: number, field: keyof ProductLink, value: string | number | boolean) => {
    // Use the store's function to update a product
    updateProductLinkInStore(index, field, value)

    // Clear validation error when field is updated
    if (validationErrors[`${index}-${field}`]) {
      const newErrors = { ...validationErrors }
      delete newErrors[`${index}-${field}`]
      setValidationErrors(newErrors)
    }
    
    // If URL field is updated, fetch product details
    if (field === 'url' && typeof value === 'string' && value.startsWith('http')) {
      debouncedFetchProductDetails(value, index)
    }
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

  // Save order to localStorage for later retrieval after login
  const savePendingOrder = () => {
    localStorage.setItem("pendingOrder", JSON.stringify({ productLinks }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Gabim",
        description: "Ju lutemi korrigjoni fushat e shënuara me të kuqe.",
        variant: "destructive",
      })
      return
    }

    // Check if user is authenticated
    if (!user) {
      // Save the current order to localStorage
      savePendingOrder()
      
      // Show login modal
      setShowLoginModal(true)
      
      toast({
        title: "Identifikim i nevojshëm",
        description: "Ju duhet të identifikoheni ose të regjistroheni për të vazhduar me porosinë.",
      })
      return
    }

    // User is authenticated, show invoice modal
    setShowInvoiceModal(true)
  }

  const handleFinalSubmit = async (data: { productLinks: ProductLink[] }) => {
    try {
      await onSubmit(data)
      // Clear the form using the store's function
      clearFormInStore()
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
      {/* Invoice Modal */}
      <OrderInvoiceModal 
        open={showInvoiceModal} 
        onOpenChange={setShowInvoiceModal} 
        onSubmit={handleFinalSubmit} 
      />
      
      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Si të bëni një porosi</h3>
            <p className="text-sm text-blue-700">
              Shtoni linqet e produkteve që dëshironi të blini. Për çdo produkt, specifikoni sasinë, madhësinë dhe
              ngjyrën. Mund të shtoni sa produkte të dëshironi duke klikuar butonin "Shto Produkt Tjetër".
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {productLinks.map((link, index) => {
          const fees = link.price > 0 ? calculateFees(link.price, link.quantity) : null

          return (
            <motion.div
              key={index}
              id={`product-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="absolute -left-1 top-0 h-full w-1 bg-primary rounded-r-md" />
              <div
                className={cn(
                  "bg-white rounded-lg border shadow-sm overflow-hidden transition-all duration-200",
                  expandedProductIndex === index ? "border-primary-300 shadow-md" : "border-gray-200",
                )}
              >
                {/* Product header - always visible */}
                <div
                  className={cn(
                    "p-4 cursor-pointer transition-colors",
                    expandedProductIndex === index ? "bg-primary-50" : "bg-gray-50/50 hover:bg-gray-50",
                  )}
                  onClick={() => toggleProductExpansion(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-medium text-gray-700">Produkti {index + 1}</h3>
                      {link.quantity > 0 && (
                        <Badge variant="outline" className="text-xs bg-primary-50 text-primary-700 border-primary-200">
                          {link.quantity} copë
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                        {link.price > 0 && (
                          <div className="text-sm font-medium text-primary">
                            €{(link.price * 1.15 * link.quantity).toFixed(2)}
                            <span className="text-xs text-gray-500 ml-1">(£{(link.price * link.quantity).toFixed(2)})</span>
                          </div>
                        )}
                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => removeProductLink(index, e)}
                          className="h-8 w-8 p-0 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Fshi produktin</span>
                        </Button>
                        {expandedProductIndex === index ? (
                          <ChevronUp className="h-5 w-5 text-primary" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-1 truncate text-sm text-gray-500 max-w-[300px]">
                    {link.url || "Kliko për të shtuar URL e produktit"}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {link.size && (
                      <Badge variant="outline" className="text-xs bg-primary-50 text-primary-700 border-primary-200">
                        {link.size}
                      </Badge>
                    )}
                    {link.color && (
                      <Badge variant="outline" className="text-xs bg-primary-50 text-primary-700 border-primary-200">
                        {link.color}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Expandable edit form */}
                <AnimatePresence>
                  {expandedProductIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-primary-100 p-4 bg-white space-y-4">
                        <div className="space-y-4">
                          {/* URL and Quantity */}
                          <div className="flex flex-wrap gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-1.5">
                                <LinkIcon className="h-4 w-4 text-primary mr-1.5" />
                                <Label className="text-sm font-medium text-gray-700">
                                  URL e Produktit <span className="text-red-500">*</span>
                                </Label>
                              </div>
                              <div className="relative">
                                <div className="relative">
                                  <Input
                                    value={link.url}
                                    onChange={(e) => updateProductLink(index, "url", e.target.value)}
                                    required
                                    placeholder="https://www.example.com/product"
                                    className={cn(
                                      "h-10 pl-3 pr-10 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0",
                                      validationErrors[`${index}-url`] ? "border-red-500 focus-visible:ring-red-500" : "",
                                    )}
                                  />
                                  {urlsLoading[index] && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                  )}
                                </div>
                                {validationErrors[`${index}-url`] && (
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              {validationErrors[`${index}-url`] && (
                                <p className="mt-1.5 text-xs text-red-500 flex items-center">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {validationErrors[`${index}-url`]}
                                </p>
                              )}
                            </div>

                            <div className="w-24">
                              <div className="flex items-center mb-1.5">
                                <Label className="text-sm font-medium text-gray-700">
                                  Sasia <span className="text-red-500">*</span>
                                </Label>
                              </div>
                              <div className="flex items-center border rounded-md overflow-hidden">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-8 rounded-none border-r border-gray-200 hover:bg-gray-50"
                                  onClick={() => {
                                    if (link.quantity > 1) {
                                      updateProductLink(index, "quantity", Math.max(1, link.quantity - 1))
                                    }
                                  }}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  value={link.quantity}
                                  onChange={(e) => {
                                    const value = Number.parseInt(e.target.value)
                                    if (!isNaN(value) && value >= 1) {
                                      updateProductLink(index, "quantity", value)
                                    }
                                  }}
                                  min="1"
                                  step="1"
                                  required
                                  className={cn(
                                    "h-10 text-center text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 border-0 rounded-none",
                                    validationErrors[`${index}-quantity`]
                                      ? "border-red-500 focus-visible:ring-red-500"
                                      : "",
                                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                  )}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-8 rounded-none border-l border-gray-200 hover:bg-gray-50"
                                  onClick={() => updateProductLink(index, "quantity", link.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Size, Color, Price */}
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <div className="flex items-center mb-1.5">
                                <Ruler className="h-4 w-4 text-primary mr-1.5" />
                                <Label className="text-sm font-medium text-gray-700">Madhësia</Label>
                              </div>
                              <Input
                                value={link.size}
                                onChange={(e) => updateProductLink(index, "size", e.target.value)}
                                placeholder="S/M/L/XL/42/..."
                                className="h-10 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                              />
                            </div>

                            <div>
                              <div className="flex items-center mb-1.5">
                                <Palette className="h-4 w-4 text-primary mr-1.5" />
                                <Label className="text-sm font-medium text-gray-700">Ngjyra</Label>
                              </div>
                              <Input
                                value={link.color}
                                onChange={(e) => updateProductLink(index, "color", e.target.value)}
                                placeholder="E zezë, e bardhë, etj."
                                className="h-10 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                              />
                            </div>

                            <div>
                              <div className="flex items-center mb-1.5">
                                <PoundSterling className="h-4 w-4 text-primary mr-1.5" />
                                <Label className="text-sm font-medium text-gray-700">Çmimi (£)</Label>
                              </div>
                              <Input
                                type="number"
                                inputMode="decimal"
                                value={link.price || ""}
                                onChange={(e) => {
                                  const value = Number.parseFloat(e.target.value)
                                  updateProductLink(index, "price", isNaN(value) ? 0 : value)
                                }}
                                step="0.01"
                                placeholder="0.00"
                                className="h-10 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          </div>


                          {/* Additional info */}
                          <div>
                            <div className="flex items-center mb-1.5">
                              <Info className="h-4 w-4 text-primary mr-1.5" />
                              <Label className="text-sm font-medium text-gray-700">Informacion shtesë</Label>
                            </div>
                            <Textarea
                              value={link.additionalInfo}
                              onChange={(e) => updateProductLink(index, "additionalInfo", e.target.value)}
                              placeholder="Detaje shtesë për këtë produkt..."
                              className="min-h-0 h-16 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 resize-y"
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={() => setExpandedProductIndex(null)}
                            className="bg-primary hover:bg-primary/90 text-white"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Konfirmo
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <Button
        type="button"
        onClick={addProductLink}
        variant="outline"
        className="w-full border-dashed border-2 py-6 hover:border-primary hover:text-primary transition-colors duration-200 text-base"
      >
        <Plus className="mr-2 h-5 w-5" /> Shto Produkt Tjetër
      </Button>

      <Separator className="my-8" />

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-6 bg-primary hover:bg-primary/90 text-white font-medium text-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Duke dërguar porosinë...
            </>
          ) : (
            <>
              Dërgo Porosinë
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        <div className="space-y-4">
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-primary-700">
                Pasi të dërgoni porosinë, ekipi ynë do t'ju kontaktojë për të konfirmuar detajet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
