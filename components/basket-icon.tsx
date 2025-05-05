"use client"

import { ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useBasketStore } from "@/lib/basket-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BasketIconProps {
  onClick: () => void
  showLabel?: boolean
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default" | "lg"
  asChild?: boolean  // New prop to handle nested button cases
}

export function BasketIcon({ 
  onClick, 
  showLabel = false, 
  variant = "ghost",
  size = "default",
  asChild = false
}: BasketIconProps) {
  const uniqueProductCount = useBasketStore(state => state.uniqueProductCount())
  
  // Common content for both button and div versions
  const content = (
    <>
      <ShoppingCart className={cn(
        "text-primary", 
        size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
      )} />
      {uniqueProductCount > 0 && (
        <Badge 
          className="absolute top-1/2 -translate-y-1/2 -left-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-white text-xs rounded-full"
        >
          {uniqueProductCount}
        </Badge>
      )}
      {showLabel && <span className="ml-2 hidden md:inline-block">Shporta</span>}
    </>
  )

  // If asChild is true, render a div instead of a button
  if (asChild) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "relative inline-flex items-center justify-center",
          variant === "ghost" ? "hover:bg-gray-100" : "",
          size === "sm" ? "h-8 px-2" : "h-10 px-4",
          "cursor-pointer"
        )}
      >
        {content}
      </div>
    )
  }
  
  // Otherwise, render as a Button
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn(
          "relative",
          variant === "ghost" ? "hover:bg-gray-100" : "",
          variant === "outline" ? "border-2 hover:bg-primary/10 hover:border-primary" : "",
          size === "sm" ? "h-8 px-2" : size === "lg" ? "h-12 px-4" : "h-10 px-3"
      )}
    >
      {content}
    </Button>
  )
}
