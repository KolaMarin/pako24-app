"use client"

import React from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { useOnboardingStore } from "@/lib/onboarding-store"
import { X } from "lucide-react"

interface OnboardingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const { setHasSeenOnboarding, setCurrentStep } = useOnboardingStore()

  const handleComplete = () => {
    setHasSeenOnboarding(true)
    setCurrentStep(1) // Reset for next time
    onOpenChange(false)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[95vh] p-0 bg-transparent border-none shadow-none overflow-y-auto scrollbar-hide [&>button]:hidden">
        <DialogTitle className="sr-only">Onboarding Flow</DialogTitle>
        <div className="relative bg-white rounded-2xl overflow-hidden max-h-[95vh] overflow-y-auto shadow-2xl">
          {/* Enhanced close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-gray-900/20 hover:bg-gray-900/40 backdrop-blur-sm transition-all duration-200 flex items-center justify-center group shadow-lg"
          >
            <X className="h-5 w-5 text-white group-hover:text-white/90" />
          </button>
          <OnboardingFlow onComplete={handleComplete} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
