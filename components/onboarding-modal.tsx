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


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[95vh] p-0 bg-transparent border-none shadow-none overflow-y-auto scrollbar-hide">
        <DialogTitle className="sr-only">Onboarding Flow</DialogTitle>
        <div className="relative bg-white rounded-2xl overflow-hidden max-h-[95vh] overflow-y-auto shadow-2xl">
          <OnboardingFlow onComplete={handleComplete} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
