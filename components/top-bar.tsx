"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import Link from "next/link"
import { LogIn, LogOut, Package, Menu } from "lucide-react"
import { useState } from "react"
import { LoginModal } from "@/components/login-modal"
import { BasketIcon } from "@/components/basket-icon"

interface TopBarProps {
  onToggleSidebar?: () => void
  showBasketIcon?: boolean
  setShowBasketModal?: (show: boolean) => void
}

export function TopBar({ onToggleSidebar, showBasketIcon, setShowBasketModal }: TopBarProps) {
  const { user, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b flex items-center justify-between px-4"
        style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
      >
        <div className="flex items-center">
          {user && onToggleSidebar && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="text-2xl font-bold flex items-center">
            <Package className="h-8 w-8 mr-3 text-secondary" />
            <span className="text-primary font-extrabold">PAKO</span>
            <span className="text-secondary font-extrabold">24</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {showBasketIcon && setShowBasketModal && (
            <div className="mr-3">
              <BasketIcon 
                onClick={() => setShowBasketModal(true)} 
                variant="outline"
                size="lg"
                showLabel={true}
              />
            </div>
          )}
          
          {!user && (
            <Button
              variant="outline"
              className="border-2 hover:bg-primary hover:text-white transition-all duration-300"
              onClick={() => setShowLoginModal(true)}
            >
              <LogIn size={18} className="mr-2" />
              Hyr
            </Button>
          )}
        </div>
      </div>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  )
}
