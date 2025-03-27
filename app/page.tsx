"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"
import { ProductForm } from "@/components/product-form"
import { ShopList } from "@/components/shop-list"
import { Home, ShoppingBag, Store, Settings, Eye, EyeOff } from "lucide-react"
import { MobileNavbar } from "@/components/mobile-navbar"
import { MobileHeader } from "@/components/mobile-header"
import { LoginModal } from "@/components/login-modal"
import { RegistrationModal } from "@/components/registration-modal"
import { motion, AnimatePresence } from "framer-motion"
import Layout from "@/components/layout"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("order")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const router = useRouter()

  const handleSubmitOrder = async (data: { productLinks: any[] }) => {
    if (!user) {
      // Store the current order data in localStorage to retrieve it after registration
      localStorage.setItem("pendingOrder", JSON.stringify(data))
      // Show registration modal
      setShowRegistrationModal(true)
      return
    }

    try {
      const response = await fetch("/api/submit-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        // Clear the draft product links from localStorage after successful submission
        localStorage.removeItem("draftProductLinks")

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

  // For desktop screens, use the Layout component
  if (typeof window !== "undefined" && window.innerWidth >= 768) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 w-full">
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
                Dyqanet
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "order" && (
              <motion.div
                key="order"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-4xl font-bold mb-8 text-primary">Dërgo Porosi</h1>
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
                <h1 className="text-4xl font-bold mb-8 text-primary">Dyqanet</h1>
                <Card className="bg-white shadow-lg border-0 overflow-hidden">
                  <CardContent className="p-4">
                    <ShopList />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        <RegistrationModal open={showRegistrationModal} onOpenChange={setShowRegistrationModal} />
      </Layout>
    )
  }

  // For mobile screens, use the mobile layout
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MobileHeader user={user} onLoginClick={() => setShowLoginModal(true)} />

      <main className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === "order" && (
            <motion.div
              key="order"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <h1 className="text-2xl font-bold mb-4 text-primary">Dërgo Porosi</h1>
              <Card className="bg-white shadow-sm border-0 overflow-hidden">
                <CardContent className="p-0">
                  <ProductForm onSubmit={handleSubmitOrder} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "shops" && (
            <motion.div
              key="shops"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <h1 className="text-2xl font-bold mb-4 text-primary">Shfleto Dyqanet</h1>
              <Card className="bg-white shadow-sm border-0 overflow-hidden">
                <CardContent className="p-4">
                  <ShopList />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <h1 className="text-2xl font-bold mb-4 text-primary">Porositë e Mia</h1>
              {!user ? (
                <Card className="bg-white shadow-sm p-6 text-center">
                  <p className="text-gray-500 mb-4">Ju duhet të identifikoheni për të parë porositë tuaja</p>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-md"
                  >
                    Identifikohu
                  </button>
                </Card>
              ) : (
                router.push("/orders") && (
                  <Card className="bg-white shadow-sm p-6 text-center">
                    <p className="text-gray-700 mb-4">Duke ju ridrejtuar tek porositë tuaja...</p>
                  </Card>
                )
              )}
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <h1 className="text-2xl font-bold mb-4 text-primary">Cilësimet</h1>
              {user ? (
                <SettingsContent user={user} />
              ) : (
                <Card className="bg-white shadow-sm p-6 text-center">
                  <p className="text-gray-500 mb-4">Ju duhet të identifikoheni për të parë cilësimet tuaja</p>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-md"
                  >
                    Identifikohu
                  </button>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        items={[
          { id: "order", label: "Porosi", icon: ShoppingBag },
          { id: "shops", label: "Dyqanet", icon: Store },
          { id: "orders", label: "Porositë", icon: Home },
          { id: "settings", label: "Cilësimet", icon: Settings },
        ]}
      />

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      <RegistrationModal open={showRegistrationModal} onOpenChange={setShowRegistrationModal} />
    </div>
  )
}

// Replace the UserProfile component with SettingsContent
function SettingsContent({ user }: { user: any }) {
  const { updateUser, updatePassword } = useAuth()
  const [email, setEmail] = useState(user?.email || "")
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "")
  const [location, setLocation] = useState(user?.location || "")
  const [oldPassword, setOldPassword] = useState("********")
  const [newPassword, setNewPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateUser({ email, phoneNumber, location })
      if (oldPassword !== "********" && newPassword) {
        const success = await updatePassword(oldPassword, newPassword)
        if (!success) {
          throw new Error("Fjalëkalimi i vjetër është i pasaktë.")
        }
      }
      toast({
        title: "Sukses",
        description: "Të dhënat tuaja u përditësuan me sukses.",
      })
      setOldPassword("********")
      setNewPassword("")
    } catch (error) {
      toast({
        title: "Gabim",
        description:
          error instanceof Error ? error.message : "Përditësimi i të dhënave dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4 text-secondary">Të Dhënat e Përdoruesit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Numri i WhatsApp
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Vendndodhja
            </label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
              Fjalëkalimi i Vjetër
            </label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => {
                  // Only update if the user is actually typing a new password
                  if (e.target.value !== "********") {
                    setOldPassword(e.target.value)
                  }
                }}
                onFocus={() => {
                  if (oldPassword === "********") {
                    setOldPassword("")
                  }
                }}
                onBlur={() => {
                  if (oldPassword === "") {
                    setOldPassword("********")
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Fjalëkalimi i Ri
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-white">
            {isSubmitting ? (
              "Duke ruajtur..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Ruaj Ndryshimet
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

