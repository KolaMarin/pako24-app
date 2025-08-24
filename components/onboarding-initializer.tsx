"use client"

import React, { useState, useEffect } from "react"
import { OnboardingModal } from "@/components/onboarding-modal"
import { useOnboardingStore } from "@/lib/onboarding-store"

export function OnboardingInitializer() {
  const { hasSeenOnboarding } = useOnboardingStore()
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

  // Don't render anything until we've loaded the store state
  if (!isLoaded) {
    return null
  }

  // If onboarding should be shown, render it as a modal
  return (
    <OnboardingModal
      open={showOnboarding}
      onOpenChange={setShowOnboarding}
    />
  )
}
