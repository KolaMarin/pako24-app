"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Home, ShoppingBag, Settings, LogOut, Menu, Store } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { TopBar } from "./top-bar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MobileNavbar } from "@/components/mobile-navbar"
import type React from "react"

// Import usePathname at the top with other imports
import { usePathname } from "next/navigation"

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
      <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-500")} />
      {!isSidebarCollapsed && <span className="text-base font-medium">{children}</span>}
    </Link>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false) // Default to expanded
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

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
      <NavLink
        href="/settings"
        icon={Settings}
        isActive={pathname === "/settings" || pathname?.startsWith("/settings/")}
        isSidebarCollapsed={isSidebarCollapsed}
      >
        Cilësimet
      </NavLink>
    </nav>
  )

  if (!isMounted) {
    return null
  }

  // Modifica la sezione dell'aside per rimuovere l'header con il logo e spostare il logout in basso
  return (
    // Change min-h-screen to h-screen and add overflow-hidden
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <TopBar onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        {user && !isMobile && (
          <aside
            className={cn(
              "fixed top-16 h-[calc(100vh-4rem)] z-30 bg-white border-r flex flex-col",
              "transition-all duration-300 ease-in-out shadow-md",
              isSidebarCollapsed ? "w-16" : "w-64",
            )}
          >
            <div className="p-2 flex justify-end">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 px-2 py-2">{renderSidebarContent()}</div>
            <div className="p-4 mt-auto">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                {!isSidebarCollapsed && <span>Dil</span>}
              </Button>
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
          activeTab="home"
          onTabChange={() => {}}
          items={[
            { id: "home", label: "Kryefaqja", icon: Home, path: "/" },
            { id: "shops", label: "Dyqanet", icon: Store, path: "/shops" },
            { id: "orders", label: "Porositë", icon: ShoppingBag, path: "/orders" },
            { id: "settings", label: "Cilësimet", icon: Settings, path: "/settings" },
          ]}
        />
      )}
    </div>
  )
}
