"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Truck, ShoppingBag, Package, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface TimelineProps {
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  createdAt: string
  updatedAt: string
  estimatedDelivery?: string
}

export function OrderTimeline({ status, createdAt, updatedAt, estimatedDelivery }: TimelineProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    switch (status) {
      case "PENDING":
        setCurrentStep(0)
        break
      case "PROCESSING":
        setCurrentStep(1)
        break
      case "SHIPPED":
        setCurrentStep(2)
        break
      case "DELIVERED":
        setCurrentStep(3)
        break
      case "CANCELLED":
        setCurrentStep(-1)
        break
    }
  }, [status])

  if (status === "CANCELLED") {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-600 font-medium">Kjo porosi është anuluar</p>
            <p className="text-sm text-red-500 mt-1">
              Anuluar më:{" "}
              {new Date(updatedAt).toLocaleDateString("sq-AL", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    {
      title: "Porosia u Pranua",
      description: `${new Date(createdAt).toLocaleDateString("sq-AL", {
        day: "numeric",
        month: "long",
      })}`,
      icon: ShoppingBag,
      date: new Date(createdAt),
    },
    {
      title: "Në Proces",
      description: "Porosia juaj është duke u përpunuar",
      icon: Package,
      date: status === "PROCESSING" || status === "SHIPPED" || status === "DELIVERED" ? new Date(updatedAt) : null,
    },
    {
      title: "Dërguar",
      description: "Produktet janë dërguar",
      icon: Truck,
      date: status === "SHIPPED" || status === "DELIVERED" ? new Date(updatedAt) : null,
    },
    {
      title: "Dorëzuar",
      description: estimatedDelivery
        ? `Dorëzuar më: ${new Date(estimatedDelivery).toLocaleDateString("sq-AL", {
            day: "numeric",
            month: "long",
          })}`
        : "Porosia juaj është dorëzuar",
      icon: CheckCircle2,
      date: status === "DELIVERED" ? new Date(updatedAt) : null,
    },
  ]

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
          <motion.div
            className="h-0.5 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep * 100) / (steps.length - 1)}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index <= currentStep
            const isCompleted = index < currentStep

            return (
              <div key={index} className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors",
                    isActive ? "bg-primary text-white" : "bg-gray-200 text-gray-500",
                  )}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{
                    scale: isActive ? 1 : 0.8,
                    opacity: isActive ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <StepIcon className="h-5 w-5" />
                </motion.div>
                <p className={cn("mt-2 text-sm font-medium text-center", isActive ? "text-primary" : "text-gray-500")}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 text-center mt-1 max-w-[100px]">{step.description}</p>
                {step.date && (
                  <p className="text-xs text-primary font-medium mt-1">
                    {step.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

