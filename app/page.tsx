"use client"

import React, { useState, useEffect } from "react"
import { SearchParamsProvider } from "@/components/client-search-params"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { ProductForm } from "@/components/product-form"
import { ShopList } from "@/components/shop-list"
import { ShoppingBag, Store } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { BasketInvoiceModal } from "@/components/basket-invoice-modal"
import { motion, AnimatePresence } from "framer-motion"
import Layout from "@/components/layout"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <SearchParamsProvider>
      <HomePageContent />
    </SearchParamsProvider>
  )
}

function HomePageContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("order")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login")
  const [showBasketModal, setShowBasketModal] = useState(false)
  const searchParams = useSearchParams()
  
  // Use the activeTab from URL parameter if available
  useEffect(() => {
    const tabParam = searchParams.get('activeTab')
    if (tabParam && ['order', 'shops', 'orders', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const handleSubmitOrder = async (data: { productLinks: any[] }) => {
    if (!user) {
      // No need to store in localStorage - the Zustand store already persists the data
      // Just show the registration modal
      setAuthModalTab("register")
      setShowAuthModal(true)
      return
    }

    try {
      // Import config store to get current rates and fees
      const { useConfigStore } = await import("@/lib/config-store");
      const configStore = useConfigStore.getState();
      const exchangeRate = configStore.getExchangeRate();
      const customsFeePercentage = configStore.getCustomsFeePercentage();
      const transportFeePerProduct = configStore.getTransportFee();
      
      // Transform the product links to match the expected API format
      const transformedData = {
        productLinks: data.productLinks.map(link => {
          // Calculate fees using config values
          const euroPrice = link.price * exchangeRate; // Use exchange rate from config
          const basePriceEUR = euroPrice * link.quantity;
          const customsFee = basePriceEUR * customsFeePercentage; // Use customs fee % from config
          const transportFee = transportFeePerProduct; // Flat fee per product, NOT multiplied by quantity
          
          return {
            url: link.url,
            quantity: link.quantity,
            size: link.size || "",
            color: link.color || "",
            priceGBP: link.price * link.quantity,
            priceEUR: basePriceEUR,
            customsFee: customsFee,
            transportFee: transportFee // Fixed flat fee per product type
          };
        })
      };

      const response = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformedData),
        credentials: "include" // Include cookies in the request
      })

      if (response.ok) {
        // The form will be cleared in the ProductForm component
        // No need to manually clear localStorage
        
        toast({
          title: "Sukses",
          description: "Porosia juaj u dërgua me sukses. Do t'ju kontaktojmë së shpejti.",
        })
      } else {
        throw new Error("Dërgimi i porosisë dështoi")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Dërgimi i porosisë dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="max-w-4xl mx-auto">
        {/* Desktop tab buttons - hidden on mobile */}
        <div className="mb-6 w-full hidden md:block">
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              className={cn(
                "flex items-center justify-center py-3 px-4 rounded-md transition-all",
                activeTab === "order"
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              )}
              onClick={() => setActiveTab("order")}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Dërgo Porosi
            </button>
            <button
              className={cn(
                "flex items-center justify-center py-3 px-4 rounded-md transition-all",
                activeTab === "shops"
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              )}
              onClick={() => setActiveTab("shops")}
            >
              <Store className="h-5 w-5 mr-2" />
              Eksploro Dyqane
            </button>
          </div>
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          {activeTab === "order" && (
            <motion.div
              key="order"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <CardContent className="p-0">
                  <ProductForm onSubmit={handleSubmitOrder} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "shops" && (
            <motion.div
              key="shops"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <CardContent className="p-4">
                  <ShopList />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} defaultTab={authModalTab} />
      <BasketInvoiceModal open={showBasketModal} onOpenChange={setShowBasketModal} onSubmit={handleSubmitOrder} />
    </Layout>
  )
}
