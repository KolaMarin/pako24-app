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
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 shadow-md">
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-bold flex items-center">
          <Package className="h-8 w-8 mr-3 text-blue-600" />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent font-extrabold">PAKO</span>
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-extrabold">24</span>
          {orderCount > 0 && (
            <span className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1 shadow-sm">
              {orderCount}
            </span>
          )}
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {/* Always show the basket icon with consistent styling */}
        <div className="mr-1">
          <BasketIcon 
            onClick={() => setShowBasketModal && setShowBasketModal(true)} 
            variant="outline"
            size="default"
            showLabel={false}
          />
        </div>
      </div>
    </header>
  )
}
