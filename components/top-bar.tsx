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
        className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-4 shadow-lg"
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-white to-purple-50/30 pointer-events-none" />
        <div className="flex items-center relative z-10">
          {/* Enhanced clickable logo with modern design */}
          <button 
            onClick={() => setShowOnboardingModal(true)}
            className="group flex items-center hover:scale-105 transition-all duration-300 p-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mr-3 group-hover:shadow-xl transition-shadow">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all">PAKO</span>
              <span className="text-xl font-black bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:to-orange-700 transition-all">24</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {showBasketIcon && setShowBasketModal && (
            <BasketIcon 
              onClick={() => setShowBasketModal(true)} 
              variant="outline"
              size="lg"
              showLabel={false}
            />
          )}
          
          {!user && !isMobile && (
            <Button
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white font-semibold px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
