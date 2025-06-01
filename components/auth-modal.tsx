"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useProductFormStore } from "@/lib/product-form-store"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Mail, Phone, Lock, MapPin, Package } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: "login" | "register"
}

export function AuthModal({ open, onOpenChange, defaultTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const { login, register } = useAuth()

  // Initialize with false, will be updated in useEffect
  const [hasPendingOrder, setHasPendingOrder] = useState(false)
  
  // Check for pending order after component mounts (client-side only)
  useEffect(() => {
    setHasPendingOrder(!!localStorage.getItem("pendingOrder"))
  }, [])

  // Reset form when modal opens/closes or tab changes
  useEffect(() => {
    if (!open) {
      setEmail("")
      setPassword("")
      setPhoneNumber("")
      setLocation("")
      setError("")
      setActiveTab(defaultTab)
    }
  }, [open, defaultTab])

  useEffect(() => {
    setError("")
  }, [activeTab])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const success = await login(email, password)
      if (success) {
        onOpenChange(false)

        // Check if there's a pending order
        if (hasPendingOrder) {
          handlePendingOrder("login")
        } else {
          toast({
            title: "Sukses",
            description: "Identifikimi u krye me sukses.",
          })
        }
      } else {
        setError("Email-i ose fjalëkalimi është i pasaktë.")
      }
    } catch (error) {
      setError("Ndodhi një gabim. Ju lutemi provoni përsëri.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const success = await register(email, phoneNumber, password, location)
      if (success) {
        onOpenChange(false)

        // Check if there's a pending order
        if (hasPendingOrder) {
          handlePendingOrder("register")
        } else {
          toast({
            title: "Sukses",
            description: "Regjistrimi u krye me sukses.",
          })
        }
      } else {
        setError("Regjistrimi dështoi. Ju lutemi provoni përsëri.")
      }
    } catch (error) {
      setError("Ndodhi një gabim. Ju lutemi provoni përsëri.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get the setProductLinks function from the Zustand store
  const { setProductLinks } = useProductFormStore()

  // Function to handle pending order after login/register (only called client-side)
  const handlePendingOrder = (action: "login" | "register") => {
    try {
      const pendingOrderJson = localStorage.getItem("pendingOrder")
      if (!pendingOrderJson) return

      // Parse the pending order data
      const pendingOrder = JSON.parse(pendingOrderJson)
      
      // Set the product links in the Zustand store
      if (pendingOrder && pendingOrder.productLinks) {
        setProductLinks(pendingOrder.productLinks)
      }
      
      // Clear the pending order as it's now in the Zustand store
      localStorage.removeItem("pendingOrder")
      
      // Show success message
      const actionText = action === "login" ? "Identifikimi" : "Regjistrimi"
      toast({
        title: "Sukses",
        description: `${actionText} u krye me sukses. Ju mund të vazhdoni me porosinë tuaj.`,
      })
      
      // Redirect to home page to show the order form
      router.push("/")
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Ndodhi një gabim gjatë përpunimit të porosisë. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gray-100 text-gray-900 p-4">
          <DialogTitle className="text-xl flex items-center">
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-secondary" />
              <span className="text-primary font-extrabold">PAKO</span>
              <span className="text-secondary font-extrabold">24</span>
            </div>
          </DialogTitle>
          <p className="text-gray-600 text-sm">
            {activeTab === "register"
              ? "Krijo një llogari të re për të përdorur PAKO24"
              : "Vendosni të dhënat tuaja për të hyrë në llogarinë tuaj"}
          </p>
        </DialogHeader>

        <div className="p-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" className="text-sm">
                Identifikohu
              </TabsTrigger>
              <TabsTrigger value="register" className="text-sm">
                Regjistrohu
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    type="email"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-primary" />
                    Fjalëkalimi
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Fjalëkalimi juaj"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base focus-visible:ring-primary"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 sm:py-6 bg-primary hover:bg-primary/90 text-white text-sm sm:text-base"
                >
                  {isSubmitting
                    ? "Duke identifikuar..."
                    : hasPendingOrder
                      ? "Identifikohu dhe vazhdo me porosinë"
                      : "Identifikohu"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Nuk keni llogari? Regjistrohuni
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    type="email"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone" className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    Numri i WhatsApp
                  </Label>
                  <Input
                    id="register-phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+355 69 123 4567"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-location" className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    Vendndodhja
                  </Label>
                  <Input
                    id="register-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Tirana, Albania"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-primary" />
                    Fjalëkalimi
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Fjalëkalimi juaj"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base focus-visible:ring-primary"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 sm:py-6 bg-primary hover:bg-primary/90 text-white text-sm sm:text-base"
                >
                  {isSubmitting
                    ? hasPendingOrder
                      ? "Duke regjistruar dhe dërguar porosinë..."
                      : "Duke regjistruar..."
                    : hasPendingOrder
                      ? "Regjistrohu dhe dërgo porosinë"
                      : "Regjistrohu"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Keni një llogari? Identifikohuni
                  </button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
