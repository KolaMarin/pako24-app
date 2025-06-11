"use client"

import React from "react"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { useOnboardingStore } from "@/lib/onboarding-store"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const { setHasSeenOnboarding, setCurrentStep } = useOnboardingStore()
  const router = useRouter()

  const handleComplete = () => {
    setHasSeenOnboarding(true)
    setCurrentStep(1) // Reset for next time
    router.push("/") // Navigate back to home
  }

  return <OnboardingFlow onComplete={handleComplete} />
}
