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
      title: "Në pritje",
      icon: ShoppingBag,
      date: new Date(createdAt),
    },
    {
      title: "Në Proces",
      icon: Package,
      date: status === "PROCESSING" || status === "SHIPPED" || status === "DELIVERED" ? new Date(updatedAt) : null,
    },
    {
      title: "Dërguar",
      icon: Truck,
      date: status === "SHIPPED" || status === "DELIVERED" ? new Date(updatedAt) : null,
    },
    {
      title: "Dorëzuar",
      icon: CheckCircle2,
      date: status === "DELIVERED" 
        ? (estimatedDelivery ? new Date(estimatedDelivery) : new Date(updatedAt)) 
        : null,
    },
  ]

  return (
    <div className="py-4 w-full">
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-6 left-2 right-2 h-1 bg-gray-200 md:left-5 md:right-5 md:top-5 md:h-0.5">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep * 100) / (steps.length - 1)}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between w-full">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index <= currentStep
            const isCompleted = index < currentStep

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <motion.div
                  className={cn(
                    "rounded-full flex items-center justify-center z-10 transition-colors",
                    "w-12 h-12 md:w-10 md:h-10", // Larger on mobile for better touch targets
                    isActive ? "bg-primary text-white" : "bg-gray-200 text-gray-500",
                  )}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{
                    scale: isActive ? 1 : 0.8,
                    opacity: isActive ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <StepIcon className="h-6 w-6 md:h-5 md:w-5" />
                </motion.div>
                <p className={cn(
                  "mt-2 font-medium text-center px-1",
                  "text-xs md:text-sm", // Smaller on mobile for better separation
                  isActive ? "text-primary" : "text-gray-500"
                )}>
                  {step.title}
                </p>
                {step.date && (
                  <div className="mt-0.5 text-center">
                    <p className="text-[10px] md:text-xs font-medium">
                      {step.date.getDate()} {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][step.date.getMonth()]}
                    </p>
                    <p className="text-[10px] md:text-xs text-primary font-medium">
                      {step.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
