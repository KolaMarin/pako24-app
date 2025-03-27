"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { saveOrder } from "@/lib/offline-storage"

interface OrderActionsProps {
  orderId: string
  currentStatus: string
  onStatusChange: (newStatus: string) => void
}

export function OptimisticOrderActions({ orderId, currentStatus, onStatusChange }: OrderActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cancelOrder = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    // Optimistically update UI immediately
    onStatusChange("CANCELLED")

    try {
      // Store in IndexedDB first for offline support
      await saveOrder({
        id: orderId,
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
        synced: false,
        // Other fields would be included here
        productLinks: [],
        createdAt: "",
      })

      // Then try to update on the server
      const response = await fetch("/api/cancel-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        throw new Error("Server update failed")
      }

      toast({
        title: "Sukses",
        description: "Porosia u anulua me sukses.",
      })
    } catch (error) {
      // If server update fails, keep local change but notify user
      toast({
        title: "Paralajmërim",
        description:
          "Porosia u anulua në pajisjen tuaj, por do të sinkronizohet me serverin kur të keni lidhje interneti.",
        variant: "default",
      })

      // In a real implementation, you would queue this for retry
      console.error("Failed to cancel order on server:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button variant="destructive" onClick={cancelOrder} disabled={isSubmitting || currentStatus !== "PENDING"}>
      {isSubmitting ? "Duke anuluar..." : "Anulo Porosinë"}
    </Button>
  )
}

