"use client"

import React, { useState, useEffect } from "react"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { useOnboardingStore } from "@/lib/onboarding-store"

export function OnboardingInitializer() {
  const { hasSeenOnboarding, setHasSeenOnboarding, setCurrentStep } = useOnboardingStore()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Wait for the store to hydrate from localStorage
    const timer = setTimeout(() => {
      setIsLoaded(true)
      if (!hasSeenOnboarding) {
        setShowOnboarding(true)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [hasSeenOnboarding])

  const handleComplete = () => {
    setHasSeenOnboarding(true)
    setCurrentStep(1) // Reset for next time
    setShowOnboarding(false)
  }

  // Don't render anything until we've loaded the store state
  if (!isLoaded) {
    return null
  }

  // If onboarding should be shown, render it as a full-screen overlay
  if (showOnboarding) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-blue-50 to-white">
        <OnboardingFlow onComplete={handleComplete} />
      </div>
    )
  }

  return null
}
