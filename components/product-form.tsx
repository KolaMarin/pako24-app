"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface ProductLink {
  url: string
  quantity: number
  size: string
  color: string
  additionalInfo: string
  price: number
  isHeavy: boolean
}

interface ProductFormProps {
  onSubmit: (data: { productLinks: ProductLink[] }) => Promise<void>
}

export function ProductForm({ onSubmit }: ProductFormProps) {
  const [productLinks, setProductLinks] = useState<ProductLink[]>(() => {
    // Try to get saved product links from localStorage
    if (typeof window !== "undefined") {
      const savedLinks = localStorage.getItem("draftProductLinks")
      if (savedLinks) {
        try {
          return JSON.parse(savedLinks)
        } catch (e) {
          console.error("Failed to parse saved product links", e)
        }
      }
    }

    // Default initial state
    return [
      {
        url: "",
        quantity: 1,
        size: "",
        color: "",
        additionalInfo: "",
        price: 0,
        isHeavy: false,
      },
    ]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [expandedProductIndex, setExpandedProductIndex] = useState<number | null>(0) // Start with first product expanded

  useEffect(() => {
    // Save product links to localStorage whenever they change
    if (typeof window !== "undefined" && productLinks.length > 0) {
      localStorage.setItem("draftProductLinks", JSON.stringify(productLinks))
    }
  }, [productLinks])

  const addProductLink = () => {
    // Create a new empty product
    const newProduct = {
      url: "",
      quantity: 1,
      size: "",
      color: "",
      additionalInfo: "",
      price: 0,
      isHeavy: false,
    }

    // Add it to the list
    setProductLinks([...productLinks, newProduct])

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
      setProductLinks(productLinks.filter((_, i) => i !== index))

      // If we're removing the expanded product, collapse all
      if (expandedProductIndex === index) {
        setExpandedProductIndex(null)
      }
      // If we're removing a product before the expanded one, adjust the index
      else if (expandedProductIndex !== null && expandedProductIndex > index) {
        setExpandedProductIndex(expandedProductIndex - 1)
      }
    } else {
      toast({
        title: "Kujdes",
        description: "Duhet të keni të paktën një produkt në porosi.",
        variant: "default",
      })
    }
  }

  const calculateFees = (price: number, quantity: number, isHeavy: boolean) => {
    const euroPrice = price * 1.15 // Approximate GBP to EUR conversion
    const basePriceEUR = euroPrice * quantity
    const customsFee = basePriceEUR * 0.2 // 20% of price in EUR
    const shippingFee = isHeavy ? 20 : 10 // 10€ if under 1kg, 20€ if over
    const shippingTotal = shippingFee * quantity

    return {
      basePriceGBP: price * quantity,
      basePriceEUR,
      customsFee,
      shippingFee: shippingTotal,
      totalEUR: basePriceEUR + customsFee + shippingTotal,
    }
  }

  const updateProductLink = (index: number, field: keyof ProductLink, value: string | number | boolean) => {
    const updatedLinks = [...productLinks]

    // Ensure quantity is always an integer
    if (field === "quantity" && typeof value === "number") {
      value = Math.max(1, Math.floor(value))
    }

    updatedLinks[index] = { ...updatedLinks[index], [field]: value }
    setProductLinks(updatedLinks)

    // Clear validation error when field is updated
    if (validationErrors[`${index}-${field}`]) {
      const newErrors = { ...validationErrors }
      delete newErrors[`${index}-${field}`]
      setValidationErrors(newErrors)
    }
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    productLinks.forEach((link, index) => {
      if (!link.url) {
        errors[`${index}-url`] = "URL është e detyrueshme"
      } else if (!link.url.startsWith("http")) {
        errors[`${index}-url`] = "URL duhet të fillojë me http:// ose https://"
      }

      if (link.quantity < 1) {
        errors[`${index}-quantity`] = "Sasia duhet të jetë të paktën 1"
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
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

    setIsSubmitting(true)
    try {
      await onSubmit({ productLinks })
      // Clear the draft product links from localStorage after successful submission
      localStorage.removeItem("draftProductLinks")

      setProductLinks([{ url: "", quantity: 1, size: "", color: "", additionalInfo: "", price: 0, isHeavy: false }])
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
    } finally {
      setIsSubmitting(false)
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
          const fees = link.price > 0 ? calculateFees(link.price, link.quantity, link.isHeavy) : null

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
                    expandedProductIndex === index ? "bg-primary-50" : "hover:bg-gray-50",
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
                      {fees && <div className="text-sm font-medium text-primary">€{fees.totalEUR.toFixed(2)}</div>}
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
                    {link.isHeavy && (
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                        Mbi 1kg
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
                                <Input
                                  value={link.url}
                                  onChange={(e) => updateProductLink(index, "url", e.target.value)}
                                  required
                                  placeholder="https://www.example.com/product"
                                  className={cn(
                                    "h-10 pl-3 pr-8 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0",
                                    validationErrors[`${index}-url`] ? "border-red-500 focus-visible:ring-red-500" : "",
                                  )}
                                />
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

                          {/* Weight toggle */}
                          <div className="flex items-center justify-between space-x-2 bg-gray-50 p-3 rounded-md">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-medium text-gray-700">Produkt mbi 1kg?</Label>
                              <p className="text-xs text-gray-500">Aktivizo nëse produkti peshon më shumë se 1kg</p>
                            </div>
                            <Switch
                              checked={link.isHeavy}
                              onCheckedChange={(checked) => updateProductLink(index, "isHeavy", checked)}
                            />
                          </div>

                          {/* Price calculations */}
                          {fees && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 flex items-center">
                                    Çmimi bazë:{" "}
                                    <Badge className="ml-2 bg-primary-100 text-primary-700 border-0">
                                      {link.quantity}x
                                    </Badge>
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">€{fees.basePriceEUR.toFixed(2)}</span>
                                    <span className="text-xs text-gray-500">(£{fees.basePriceGBP.toFixed(2)})</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 flex items-center">
                                    Dogana (20%):{" "}
                                    <Badge className="ml-2 bg-primary-100 text-primary-700 border-0">
                                      {link.quantity}x
                                    </Badge>
                                  </span>
                                  <span className="font-medium">€{fees.customsFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 flex items-center">
                                    Transporti:{" "}
                                    <Badge className="ml-2 bg-primary-100 text-primary-700 border-0">
                                      {link.quantity}x
                                    </Badge>
                                  </span>
                                  <span className="font-medium">€{fees.shippingFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200 font-medium">
                                  <span>Totali:</span>
                                  <span className="text-primary">€{fees.totalEUR.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          )}

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

      <div className="space-y-4">
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-primary-800 mb-1">Informacion për Porosinë</h3>
              <p className="text-sm text-primary-700">
                Pasi të dërgoni porosinë, ekipi ynë do ta shqyrtojë dhe do t'ju kontaktojë për të konfirmuar detajet dhe
                çmimin. Ju mund të ndiqni statusin e porosisë suaj në seksionin "Porositë e Mia".
              </p>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  )
}

