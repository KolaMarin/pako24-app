"use client"

import React, { useState } from "react"
import { HelpCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useOnboardingStore, trackOnboardingEvent } from "@/lib/onboarding-store"
import { useRouter } from "next/navigation"
import { OnboardingModal } from "./onboarding-modal"

interface OnboardingTriggerProps {
  className?: string
  variant?: "button" | "icon"
  size?: "sm" | "md" | "lg"
}

export function OnboardingTrigger({ 
  className = "", 
  variant = "icon",
  size = "md" 
}: OnboardingTriggerProps) {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    trackOnboardingEvent('help_button_clicked', {
      variant,
      size
    })
    
    // For mobile/smaller screens, navigate to full page
    if (window.innerWidth < 768) {
      router.push('/onboarding')
    } else {
      // For desktop, show modal
      setShowModal(true)
    }
  }

  const buttonSizes = {
    sm: "h-7 w-7",
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  }

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  if (variant === "button") {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          className={`gap-2 ${className}`}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Si Funksionon?</span>
          <span className="sm:hidden">Help</span>
        </Button>
        
        <OnboardingModal 
          open={showModal} 
          onOpenChange={setShowModal}
        />
      </>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className={`
              ${buttonSizes[size]} 
              text-gray-600 hover:text-primary hover:bg-primary/10 
              transition-all duration-200 rounded-full
              ${className}
            `}
          >
            <HelpCircle className={iconSizes[size]} />
            <span className="sr-only">Si funksionon PAKO24</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Si funksionon PAKO24?</p>
        </TooltipContent>
      </Tooltip>
      
      <OnboardingModal 
        open={showModal} 
        onOpenChange={setShowModal}
      />
    </TooltipProvider>
  )
}
