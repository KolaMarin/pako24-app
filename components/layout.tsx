"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Home, ShoppingBag, Settings, LogOut, Menu, Store, ShoppingCart, User, PanelLeftClose, PanelLeftOpen, PlusCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { TopBar } from "./top-bar"
import { BasketIcon } from "@/components/basket-icon"
import { BasketInvoiceModal } from "@/components/basket-invoice-modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MobileNavbar } from "@/components/mobile-navbar"
import type React from "react"

// Import usePathname and useRouter at the top with other imports
import { usePathname, useRouter } from "next/navigation"

// Move NavLink outside of the Layout component to avoid recreating it on each render
const NavLink = ({
  href,
  icon: Icon,
  children,
  isActive,
  isSidebarCollapsed,
}: {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  isActive: boolean
  isSidebarCollapsed: boolean
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-3 rounded-md transition-all duration-200",
        isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-100 hover:text-primary",
        "active:bg-gray-200",
        isSidebarCollapsed ? "justify-center" : "justify-start gap-3",
      )}
    >
      <div className="flex items-center justify-center w-6 h-6">
        <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-500")} />
      </div>
      {!isSidebarCollapsed && <span className="text-base font-medium">{children}</span>}
    </Link>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false) // Default to expanded
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showBasketModal, setShowBasketModal] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    // Close dropdown on page navigation
    setShowUserDropdown(false)
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [pathname])

  const handleLogout = () => {
    logout()
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Move SidebarContent inside the Layout component but make it a regular function
  const renderSidebarContent = () => (
    <nav className="space-y-1 mt-4">
      <NavLink href="/" icon={Home} isActive={pathname === "/"} isSidebarCollapsed={isSidebarCollapsed}>
        Kryefaqja
      </NavLink>
      <NavLink
        href="/orders"
        icon={ShoppingBag}
        isActive={pathname === "/orders" || pathname?.startsWith("/orders/")}
        isSidebarCollapsed={isSidebarCollapsed}
      >
        Porositë e Mia
      </NavLink>
    </nav>
  )

  if (!isMounted) {
    return null
  }

  const handleSubmitOrder = async (data: { productLinks: any[] }) => {
    try {
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit order')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error submitting order:', error)
      throw error
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <TopBar 
        onToggleSidebar={toggleSidebar} 
        showBasketIcon={true} 
        setShowBasketModal={setShowBasketModal}
        isMobile={isMobile}
      />
      
      {/* Basket Modal */}
      <BasketInvoiceModal 
        open={showBasketModal} 
        onOpenChange={setShowBasketModal} 
        onSubmit={handleSubmitOrder} 
      />
      <div className="flex flex-1 overflow-hidden">
        {user && !isMobile && (
          <aside
            className={cn(
              "fixed top-16 h-[calc(100vh-4rem)] z-30 bg-white border-r flex flex-col",
              "transition-all duration-300 ease-in-out shadow-md",
              isSidebarCollapsed ? "w-16" : "w-64",
            )}
          >
            <div className={cn(
              "p-2",
              isSidebarCollapsed ? "flex justify-center" : "flex justify-end"
            )}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar} 
                className="h-10 w-10 hover:bg-gray-100"
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="h-6 w-6 text-primary" />
                  ) : (
                    <PanelLeftClose className="h-6 w-6 text-primary" />
                  )}
                </div>
              </Button>
            </div>
            <div className="flex-1 px-2 py-2">{renderSidebarContent()}</div>
            <div className="p-4 mt-auto">
              {/* User profile button with dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  className={cn(
                    "flex items-center hover:bg-gray-100 border",
                    isSidebarCollapsed 
                      ? "h-10 w-10 justify-center" 
                      : "w-full justify-center gap-2"
                  )}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <div className="flex items-center justify-center w-6 h-6">
                    <User className={cn(
                      "text-primary",
                      isSidebarCollapsed ? "h-6 w-6" : "h-5 w-5"
                    )} />
                  </div>
                  {!isSidebarCollapsed && <span className="font-medium">Profili</span>}
                </Button>
                
                {showUserDropdown && (
                  <div className={cn(
                    "absolute bg-white border rounded-md shadow-lg overflow-hidden z-50",
                    isSidebarCollapsed 
                      ? "bottom-full left-0 mb-2 w-48" 
                      : "bottom-full left-0 mb-2 w-full"
                  )}>
                    <Link 
                      href="/settings"
                      className="flex items-center gap-2 p-3 hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Cilësimet</span>
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 p-3 hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Dil</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
            "px-4 py-6",
            "mt-16",
            user && !isMobile ? (isSidebarCollapsed ? "ml-16" : "ml-64") : "ml-0",
          )}
        >
          {children}
        </main>
      </div>
      {isMobile && (
        <MobileNavbar
          activeTab={pathname === "/" ? "order" : 
                   pathname === "/shops" ? "shops" : 
                   pathname === "/orders" ? "orders" : 
                   pathname === "/settings" ? "settings" : "order"}
          onTabChange={(tab) => {
            // If navigating to orders or settings from shops, 
            // prevent default navigation in favor of in-page tab switch
            if ((tab === "orders" || tab === "settings")) {
              // Navigate to the home page with the proper tab selected
              // Removed redirect - let normal navigation happen
            }
          }}
          items={[
            { id: "order", label: "Shto", icon: PlusCircle, path: "/" },
            { id: "shops", label: "Dyqanet", icon: Store, path: "/shops" },
            { id: "orders", label: "Porosite", icon: ShoppingBag, path: "/orders" },
            { id: "settings", label: "Cilesimet", icon: Settings, path: "/settings" },
          ]}
        />
      )}
    </div>
  )
}
