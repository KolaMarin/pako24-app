"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import Link from "next/link"
import { LogIn, LogOut, Package, Menu } from "lucide-react"
import { useState } from "react"
import { AuthModal } from "@/components/auth-modal"
import { BasketIcon } from "@/components/basket-icon"
import { OnboardingModal } from "@/components/onboarding-modal"

interface TopBarProps {
  onToggleSidebar?: () => void
  showBasketIcon?: boolean
  setShowBasketModal?: (show: boolean) => void
  isMobile?: boolean
}

export function TopBar({ onToggleSidebar, showBasketIcon, setShowBasketModal, isMobile = false }: TopBarProps) {
  const { user, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b flex items-center justify-between px-4"
        style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
      >
        <div className="flex items-center">
          {/* Clickable logo that opens onboarding */}
          <button 
            onClick={() => setShowOnboardingModal(true)}
            className="text-2xl font-bold flex items-center hover:opacity-80 transition-opacity"
          >
            <Package className="h-8 w-8 mr-3 text-secondary" />
            <span className="text-primary font-extrabold">PAKO</span>
            <span className="text-secondary font-extrabold">24</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {showBasketIcon && setShowBasketModal && (
            <div className="mr-3">
              <BasketIcon 
                onClick={() => setShowBasketModal(true)} 
                variant="outline"
                size="lg"
                showLabel={false}
              />
            </div>
          )}
          
          {!user && !isMobile && (
            <Button
              variant="outline"
              className="border-2 hover:bg-primary hover:text-white transition-all duration-300"
              onClick={() => setShowAuthModal(true)}
            >
              <LogIn size={18} className="mr-2" />
              Hyr
            </Button>
          )}
        </div>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} defaultTab="login" />
      <OnboardingModal open={showOnboardingModal} onOpenChange={setShowOnboardingModal} />
    </>
  )
}
