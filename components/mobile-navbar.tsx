"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"

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
    // Update active tab based on current path
    if (pathname === "/") setActiveTab("home")
    else if (pathname === "/shops") setActiveTab("shops")
    else if (pathname === "/orders") setActiveTab("orders")
    else if (pathname === "/settings") setActiveTab("settings")
  }, [pathname])

  const handleTabChange = (tab: string, path?: string, action?: () => void) => {
    setActiveTab(tab)
    onTabChange(tab)

    // If action is provided, execute it
    if (action) {
      action()
      return
    }

    // If path is provided and we're not already on that page, navigate to it
    if (path && pathname !== path && tab !== "shops") {
      router.push(path)
    }
    // We'll let the parent component handle the shops tab navigation
    // instead of automatically redirecting
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 h-16 md:hidden">
      <div className="grid grid-cols-4 h-full">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-gray-500 hover:text-gray-900",
              )}
              onClick={() => handleTabChange(item.id, item.path, item.action)}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2" />
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
