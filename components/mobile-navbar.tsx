"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"

interface MobileNavbarItem {
  id: string
  label: string
  icon: React.ElementType
  path?: string
  action?: () => void
}

interface MobileNavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  items: MobileNavbarItem[]
}

export function MobileNavbar({ activeTab: initialActiveTab, onTabChange, items }: MobileNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(initialActiveTab)

  useEffect(() => {
    // Update active tab based on current path, with "order" (Shto) as default
    if (pathname === "/") setActiveTab("order")
    else if (pathname === "/shops") setActiveTab("shops")
    else if (pathname === "/orders") setActiveTab("orders")
    else if (pathname === "/settings") setActiveTab("settings")
    else setActiveTab("order") // Default to "order" for any other path
  }, [pathname])

  const handleTabChange = (tab: string, path?: string, action?: () => void) => {
    // First update the active tab for visual indication
    setActiveTab(tab)
    onTabChange(tab)

    // If action is provided, execute it
    if (action) {
      action()
      return
    }

    // If path is provided and we're not already on that page, navigate to it
    if (path && pathname !== path) {
      router.push(path)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 z-50 h-16 md:hidden shadow-lg">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent pointer-events-none" />
      
      <div className="grid grid-cols-4 h-full relative z-10">
        {items.map((item, index) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          // Define colors for each tab
          const colors = {
            order: "text-blue-600 bg-blue-50",
            shops: "text-orange-600 bg-orange-50", 
            orders: "text-purple-600 bg-purple-50",
            settings: "text-gray-600 bg-gray-50"
          }

          const activeColor = colors[item.id as keyof typeof colors] || "text-primary bg-primary/5"

          return (
            <button
              key={item.id}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative px-2 py-2",
                isActive 
                  ? `${activeColor} font-semibold` 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50",
              )}
              onClick={() => handleTabChange(item.id, item.path, item.action)}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-full" />
              )}
              
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-300",
                isActive && "transform scale-110 shadow-sm"
              )}>
                <Icon className="h-5 w-5" />
                
                {/* Subtle glow effect for active tab */}
                {isActive && (
                  <div className="absolute inset-0 bg-current opacity-10 rounded-xl blur-sm" />
                )}
              </div>
              
              <span className={cn(
                "text-xs transition-all duration-300",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </span>

              {/* Subtle animation dot */}
              {isActive && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Bottom safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-white/95" />
    </div>
  )
}
