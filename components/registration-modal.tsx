"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useProductFormStore } from "@/lib/product-form-store"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Mail, Phone, MapPin, Lock, Package } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface RegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegistrationModal({ open, onOpenChange }: RegistrationModalProps) {
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [location, setLocation] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const { register } = useAuth()

  // Initialize with false, will be updated in useEffect
  const [hasPendingOrder, setHasPendingOrder] = useState(false)
  
  // Check for pending order after component mounts (client-side only)
  useEffect(() => {
    setHasPendingOrder(!!localStorage.getItem("pendingOrder"))
  }, [])

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

  // Function to handle pending order after registration (only called client-side)
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
        description: "Regjistrimi u krye me sukses. Ju mund të vazhdoni me porosinë tuaj.",
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
      <DialogContent className="p-0 overflow-hidden max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold flex items-center justify-center">
            <Package className="h-6 w-6 mr-2 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent font-bold">PAKO</span>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">24</span>
          </h2>
          <p className="text-gray-600 text-center text-sm mt-2">Krijo një llogari të re për të përdorur PAKO24</p>
        </div>

        <form onSubmit={handleRegister} className="p-6 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="h-4 w-4 text-blue-600" />
              <span>Email</span>
            </div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              type="email"
              required
              className="h-12 text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-lg transition-colors"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Phone className="h-4 w-4 text-blue-600" />
              <span>Numri i WhatsApp</span>
            </div>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+355 69 123 4567"
              required
              className="h-12 text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-lg transition-colors"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Vendndodhja</span>
            </div>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Tirana, Albania"
              required
              className="h-12 text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-lg transition-colors"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>Fjalëkalimi</span>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Fjalëkalimi juaj"
              required
              className="h-12 text-base border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-lg transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-base mt-6"
          >
            {isSubmitting
              ? "Duke regjistruar..."
              : hasPendingOrder
                ? "Regjistrohu dhe vazhdo me porosinë"
                : "Regjistrohu"}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false)
                // Qui potresti aprire il modal di login se necessario
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Keni një llogari? Identifikohuni
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
