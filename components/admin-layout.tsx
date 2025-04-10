"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"
import { toast } from "@/components/ui/use-toast"
import { 
  Package, 
  Store, 
  BarChart, 
  Users, 
  Settings, 
  Sliders, 
  Menu, 
  X, 
  LogOut 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface SidebarItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  onClick?: () => void
}

function SidebarItem({ href, icon, label, active, onClick }: SidebarItemProps) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push("/admin/login")
        router.refresh() // Refresh to update auth state
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Gabim",
        description: "Dalja dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const sidebarItems = [
    {
      href: "/admin/orders",
      icon: <Package className="h-4 w-4" />,
      label: "Porosite",
    },
    {
      href: "/admin/shops",
      icon: <Store className="h-4 w-4" />,
      label: "Dyqanet",
    },
    {
      href: "/admin/analytics",
      icon: <BarChart className="h-4 w-4" />,
      label: "Analytics",
    },
    {
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
      label: "Menaxhimi i Përdoruesve",
    },
    {
      href: "/admin/config",
      icon: <Sliders className="h-4 w-4" />,
      label: "Konfigurimet",
    },
    {
      href: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
      label: "Cilësimet",
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-background border-b p-4 flex items-center justify-between">
        <Link href="/admin/dashboard" className="font-semibold">
          Admin Dashboard
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed lg:sticky top-0 z-20 h-screen w-64 border-r bg-background transition-transform lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "lg:flex flex-col"
        )}
      >
        <div className="p-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            Admin Dashboard
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2 px-4">
          <nav className="flex flex-col gap-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </nav>
        </div>
        <div className="border-t p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Dil
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 pt-16 lg:pt-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
