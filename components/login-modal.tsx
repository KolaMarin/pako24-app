"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useProductFormStore } from "@/lib/product-form-store"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Mail, Phone, Lock, MapPin, Package } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register } = useAuth()

  // Initialize with false, will be updated in useEffect
  const [hasPendingOrder, setHasPendingOrder] = useState(false)
  
  // Check for pending order after component mounts (client-side only)
  useEffect(() => {
    setHasPendingOrder(!!localStorage.getItem("pendingOrder"))
  }, [])

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
          handlePendingOrder()
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
          handlePendingOrder()
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

  // Function to handle pending order after login (only called client-side)
  const handlePendingOrder = () => {
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
      toast({
        title: "Sukses",
        description: "Identifikimi u krye me sukses. Ju mund të vazhdoni me porosinë tuaj.",
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
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-md max-h-[95vh] overflow-y-auto bg-white p-0">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
          <DialogTitle className="text-2xl flex items-center justify-center">
            <div className="flex items-center">
              <Package className="h-6 w-6 mr-2 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">PAKO</span>
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-bold">24</span>
            </div>
          </DialogTitle>
          <p className="text-gray-600 text-center text-sm mt-2">
            {isRegistering
              ? "Krijo një llogari të re për të përdorur PAKO24"
              : "Vendosni të dhënat tuaja për të hyrë në llogarinë tuaj"}
          </p>
        </DialogHeader>

        <div className="p-6">
          {isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="register-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    type="email"
                    required
                    className="h-12 text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-lg transition-colors pr-10"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="register-phone" className="text-sm font-medium text-gray-700">
                  Numri i WhatsApp
                </Label>
                <div className="relative">
                  <Input
                    id="register-phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+355 69 123 4567"
                    required
                    className="h-12 text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-lg transition-colors pr-10"
                  />
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="register-location" className="text-sm font-medium text-gray-700">
                  Vendndodhja
                </Label>
                <div className="relative">
                  <Input
                    id="register-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Tirana, Albania"
                    required
                    className="h-12 text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-lg transition-colors pr-10"
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                  Fjalëkalimi
                </Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Fjalëkalimi juaj"
                    required
                    className="h-12 text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-lg transition-colors pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-base mt-6"
              >
                {isSubmitting
                  ? hasPendingOrder
                    ? "Duke regjistruar dhe dërguar porosinë..."
                    : "Duke regjistruar..."
                  : hasPendingOrder
                    ? "Regjistrohu dhe dërgo porosinë"
                    : "Regjistrohu"}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Keni një llogari? Identifikohuni
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    type="email"
                    required
                    className="h-12 text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-lg transition-colors pr-10"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                  Fjalëkalimi
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Fjalëkalimi juaj"
                    required
                    className="h-12 text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-lg transition-colors pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-base mt-6"
              >
                {isSubmitting
                  ? "Duke identifikuar..."
                  : hasPendingOrder
                    ? "Identifikohu dhe vazhdo me porosinë"
                    : "Identifikohu"}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Nuk keni llogari? Regjistrohuni
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
