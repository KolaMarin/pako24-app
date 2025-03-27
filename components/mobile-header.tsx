"use client"

import { LogOut, LogIn, Package } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import Link from "next/link"

interface MobileHeaderProps {
  user: any
  onLoginClick: () => void
  orderCount?: number
}

export function MobileHeader({ user, onLoginClick, orderCount = 0 }: MobileHeaderProps) {
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="text-xl font-bold flex items-center">
            <Package className="h-5 w-5 mr-2 text-secondary" />
            <span className="text-primary font-extrabold">PAKO</span>
            <span className="text-secondary font-extrabold">24</span>
            {orderCount > 0 && (
              <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                {orderCount}
              </span>
            )}
          </Link>

          {user ? (
            // When user is logged in, show direct logout button
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="md:hidden text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Dil
            </Button>
          ) : (
            // When user is not logged in, show login button
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoginClick}
              className="md:hidden text-primary hover:bg-primary/10 hover:text-primary"
            >
              <LogIn className="h-4 w-4 mr-1" />
              Hyr
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

