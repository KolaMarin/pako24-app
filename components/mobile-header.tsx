"use client"

import { Package } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth"
import Link from "next/link"
import { BasketIcon } from "@/components/basket-icon"

interface MobileHeaderProps {
  user: any
  onLoginClick: () => void
  orderCount?: number
  setShowBasketModal?: (show: boolean) => void
}

export function MobileHeader({ user, onLoginClick, orderCount = 0, setShowBasketModal }: MobileHeaderProps) {
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b flex items-center justify-between px-4"
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-bold flex items-center">
          <Package className="h-8 w-8 mr-3 text-secondary" />
          <span className="text-primary font-extrabold">PAKO</span>
          <span className="text-secondary font-extrabold">24</span>
          {orderCount > 0 && (
            <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
              {orderCount}
            </span>
          )}
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {/* Always show the basket icon with consistent styling */}
        <div className="mr-3">
          <BasketIcon 
            onClick={() => setShowBasketModal && setShowBasketModal(true)} 
            variant="outline"
            size="lg"
            showLabel={false}
          />
        </div>
      </div>
    </header>
  )
}
