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
      <DialogContent className="p-0 overflow-hidden max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-100 text-gray-900 p-4 relative">
          <h2 className="text-xl font-semibold flex items-center">
            <Package className="h-5 w-5 mr-2 text-secondary" />
            <span className="text-primary font-extrabold">PAKO</span>
            <span className="text-secondary font-extrabold">24</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">Krijo një llogari të re për të përdorur PAKO24</p>
        </div>

        <form onSubmit={handleRegister} className="p-4 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-5 w-5 text-indigo-600" />
              <span className="font-medium">Email</span>
            </div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              type="email"
              required
              className="h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-5 w-5 text-indigo-600" />
              <span className="font-medium">Numri i WhatsApp</span>
            </div>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+355 69 123 4567"
              required
              className="h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <span className="font-medium">Vendndodhja</span>
            </div>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Tirana, Albania"
              required
              className="h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-5 w-5 text-indigo-600" />
              <span className="font-medium">Fjalëkalimi</span>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Fjalëkalimi juaj"
              required
              className="h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 sm:py-6 bg-primary hover:bg-primary/90 text-white text-sm sm:text-base"
          >
            {isSubmitting
              ? "Duke regjistruar..."
              : hasPendingOrder
                ? "Regjistrohu dhe vazhdo me porosinë"
                : "Regjistrohu"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false)
                // Qui potresti aprire il modal di login se necessario
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Keni një llogari? Identifikohuni
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
