"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface OnboardingState {
  hasSeenOnboarding: boolean
  currentStep: number
  setHasSeenOnboarding: (seen: boolean) => void
  setCurrentStep: (step: number) => void
  resetOnboarding: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      currentStep: 1,
      setHasSeenOnboarding: (seen: boolean) => set({ hasSeenOnboarding: seen }),
      setCurrentStep: (step: number) => set({ currentStep: step }),
      resetOnboarding: () => set({ hasSeenOnboarding: false, currentStep: 1 }),
    }),
    {
      name: "onboarding-storage",
    }
  )
)

export const trackOnboardingEvent = (event: string, data?: any) => {
  // Analytics tracking placeholder
  console.log("Onboarding event:", event, data)
}
