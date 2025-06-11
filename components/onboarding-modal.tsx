"use client"

import React from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { useOnboardingStore } from "@/lib/onboarding-store"

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
      <DialogContent className="max-w-md p-0 bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">Onboarding Flow</DialogTitle>
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg overflow-hidden">
          <OnboardingFlow onComplete={handleComplete} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
