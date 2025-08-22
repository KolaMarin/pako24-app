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
      <div className="max-w-4xl mx-auto px-0 md:px-0">
        {/* Enhanced desktop tab buttons with modern design */}
        <div className="mb-4 w-full hidden md:block">
          <div className="bg-white/70 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200/50">
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                className={cn(
                  "flex items-center justify-center py-4 px-6 rounded-xl transition-all duration-300 font-semibold relative overflow-hidden",
                  activeTab === "order"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-[1.02]"
                    : "bg-transparent text-gray-700 hover:bg-gray-100/50 hover:text-blue-600",
                )}
                onClick={() => setActiveTab("order")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
                <ShoppingBag className={cn("h-5 w-5 mr-3", activeTab === "order" ? "text-white" : "text-blue-600")} />
                <span className="relative z-10">Dërgo Porosi</span>
              </button>
              <button
                className={cn(
                  "flex items-center justify-center py-4 px-6 rounded-xl transition-all duration-300 font-semibold relative overflow-hidden",
                  activeTab === "shops"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-[1.02]"
                    : "bg-transparent text-gray-700 hover:bg-gray-100/50 hover:text-orange-600",
                )}
                onClick={() => setActiveTab("shops")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
                <Store className={cn("h-5 w-5 mr-3", activeTab === "shops" ? "text-white" : "text-orange-600")} />
                <span className="relative z-10">Eksploro Dyqane</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced content area with modern design */}
        <AnimatePresence mode="wait">
          {activeTab === "order" && (
            <motion.div
              key="order"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ProductForm onSubmit={handleSubmitOrder} />
            </motion.div>
          )}

          {activeTab === "shops" && (
            <motion.div
              key="shops"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-full blur-2xl animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-xl animate-pulse delay-500" />
                
                <Card className="enhanced-card rounded-2xl overflow-hidden relative backdrop-blur-sm border-white/50 shadow-2xl">
                  <CardContent className="p-6">
                    <ShopList />
                  </CardContent>
                </Card>
              </div>
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
