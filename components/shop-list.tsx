"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { useShopsStore } from "@/lib/shops-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Copy, Check, Heart, Store, Globe, ShoppingBag } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Type for category data
interface Category {
  id: string
  name: string
  description?: string | null
}

// Type for shop data
interface Shop {
  id: string
  name: string
  description?: string | null
  logoUrl?: string | null
  website: string
  active: boolean
  categoryId?: string | null
  category?: Category | null
  createdAt: string
  updatedAt: string
}

// Type for categorized shops
interface CategoryWithShops {
  name: string
  shops: Shop[]
}

export function ShopList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isMobile, setIsMobile] = useState(false)
  // Use the Zustand store instead of local state and fetch
  const { shops, isLoading: loading, error, fetchShops } = useShopsStore()

  // Check if we're on mobile and load favorites
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favoriteShops")
    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)))
      } catch (e) {
        console.error("Failed to parse saved favorites", e)
      }
    }
    
    // Optional: Fetch shops if they're not already loaded
    if (shops.length === 0) {
      fetchShops()
    }
    
    // Add a manual refresh option on error or timeout
    if (error) {
      const retryTimer = setTimeout(() => {
        fetchShops()
      }, 5000) // Retry after 5 seconds if there was an error
      
      return () => clearTimeout(retryTimer)
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [fetchShops])

  // Get all shops with their categories
  const allShops = useMemo(() => {
    return shops.map(shop => ({
      ...shop
    }))
  }, [shops])
  
  // Group shops by category
  const categories: CategoryWithShops[] = useMemo(() => {
    const groupedShops: Record<string, Shop[]> = {}
    
    // First, initialize categories, even those with no shops
    allShops.forEach(shop => {
      if (shop.category) {
        // Use category name from the database
        const categoryName = shop.category.name
        if (!groupedShops[categoryName]) {
          groupedShops[categoryName] = []
        }
        groupedShops[categoryName].push(shop)
      } else {
        // For shops with no category, put them in "Other"
        if (!groupedShops["Other"]) {
          groupedShops["Other"] = []
        }
        groupedShops["Other"].push(shop)
      }
    })
    
    return Object.entries(groupedShops).map(([name, shops]) => ({
      name,
      shops: shops.sort((a, b) => a.name.localeCompare(b.name))
    }))
  }, [allShops])

  const filteredShops = useMemo(() => {
    let filteredShops = allShops

    // Filter by search term
    if (searchTerm) {
      filteredShops = filteredShops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.website.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by tab
    if (activeTab === "favorites") {
      filteredShops = filteredShops.filter((shop) => favorites.has(shop.website))
    }

    return filteredShops
  }, [searchTerm, activeTab, favorites, allShops])

  const handleShopClick = (website: string) => {
    window.open(website, "_blank")
  }

  const copyToClipboard = (website: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(website)
    setCopiedUrl(website)
    toast({
      title: "URL u kopjua",
      description: "URL u kopjua në clipboard. Tani mund ta ngjisni në formën e porosisë.",
    })

    setTimeout(() => {
      setCopiedUrl(null)
    }, 2000)
  }

  const toggleFavorite = (website: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const newFavorites = new Set(favorites)
    if (newFavorites.has(website)) {
      newFavorites.delete(website)
    } else {
      newFavorites.add(website)
    }

    setFavorites(newFavorites)

    // Save to localStorage
    localStorage.setItem("favoriteShops", JSON.stringify(Array.from(newFavorites)))
  }

  // Get icon based on website URL
  const getShopIcon = (website: string) => {
    if (website.includes("asos")) return <ShoppingBag className="h-5 w-5 text-blue-600" />
    if (website.includes("zara")) return <ShoppingBag className="h-5 w-5 text-red-600" />
    if (website.includes("hm")) return <ShoppingBag className="h-5 w-5 text-green-600" />
    if (website.includes("mango")) return <ShoppingBag className="h-5 w-5 text-yellow-600" />
    if (website.includes("uniqlo")) return <ShoppingBag className="h-5 w-5 text-purple-600" />
    if (website.includes("stories")) return <ShoppingBag className="h-5 w-5 text-pink-600" />
    if (website.includes("cos")) return <ShoppingBag className="h-5 w-5 text-indigo-600" />
    if (website.includes("arket")) return <ShoppingBag className="h-5 w-5 text-teal-600" />
    if (website.includes("boohoo")) return <ShoppingBag className="h-5 w-5 text-orange-600" />
    if (website.includes("prettylittlething")) return <ShoppingBag className="h-5 w-5 text-pink-500" />
    if (website.includes("shein")) return <ShoppingBag className="h-5 w-5 text-black" />
    if (website.includes("missguided")) return <ShoppingBag className="h-5 w-5 text-purple-500" />
    if (website.includes("nastygal")) return <ShoppingBag className="h-5 w-5 text-red-500" />
    if (website.includes("marks")) return <Store className="h-5 w-5 text-green-700" />
    if (website.includes("selfridges")) return <Store className="h-5 w-5 text-yellow-700" />
    if (website.includes("harrods")) return <Store className="h-5 w-5 text-amber-700" />
    if (website.includes("johnlewis")) return <Store className="h-5 w-5 text-blue-700" />
    if (website.includes("sephora")) return <ShoppingBag className="h-5 w-5 text-purple-800" />
    if (website.includes("boots")) return <ShoppingBag className="h-5 w-5 text-blue-800" />
    if (website.includes("cultbeauty")) return <ShoppingBag className="h-5 w-5 text-pink-800" />
    if (website.includes("lookfantastic")) return <ShoppingBag className="h-5 w-5 text-teal-800" />

    // Default icon
    return <Globe className="h-5 w-5 text-gray-600" />
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Kërko dyqane..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-base focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 transition-all border-gray-200"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">Të Gjitha</TabsTrigger>
          <TabsTrigger value="favorites">Të Preferuarat</TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className={`${isMobile ? "h-[calc(100vh-300px)] pr-1" : "h-[500px] pr-4"}`}>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Duke ngarkuar dyqanet...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {activeTab === "favorites"
              ? "Nuk keni dyqane të preferuara. Shtoni disa duke klikuar ikonën e zemrës."
              : "Nuk u gjet asnjë dyqan që përputhet me kërkimin tuaj."}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Group shops by category */}
            {activeTab === "all" && !searchTerm ? (
              categories.map((category) => (
                <div key={category.name} className="mb-6">
                  <h3 className="font-medium text-lg mb-3">{category.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {category.shops.map((shop) => (
                      <ShopCard
                        key={shop.id}
                        shop={{
                          name: shop.name,
                          url: shop.website,
                          category: shop.category?.name
                        }}
                        isFavorite={favorites.has(shop.website)}
                        isCopied={copiedUrl === shop.website}
                        onShopClick={handleShopClick}
                        onToggleFavorite={toggleFavorite}
                        onCopyUrl={copyToClipboard}
                        icon={getShopIcon(shop.website)}
                        logoUrl={shop.logoUrl}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {filteredShops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={{
                      name: shop.name,
                      url: shop.website,
                      category: shop.category?.name
                    }}
                    isFavorite={favorites.has(shop.website)}
                    isCopied={copiedUrl === shop.website}
                    onShopClick={handleShopClick}
                    onToggleFavorite={toggleFavorite}
                    onCopyUrl={copyToClipboard}
                    icon={getShopIcon(shop.website)}
                    logoUrl={shop.logoUrl}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// Extracted ShopCard component for better organization
function ShopCard({
  shop,
  isFavorite,
  isCopied,
  onShopClick,
  onToggleFavorite,
  onCopyUrl,
  icon,
  logoUrl,
}: {
  shop: { name: string; url: string; category?: string }
  isFavorite: boolean
  isCopied: boolean
  onShopClick: (url: string) => void
  onToggleFavorite: (url: string, e: React.MouseEvent) => void
  onCopyUrl: (url: string, e: React.MouseEvent) => void
  icon: React.ReactNode
  logoUrl?: string | null
}) {
  return (
    <Card key={shop.url} className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => onShopClick(shop.url)}>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 bg-gray-50 rounded-md h-12 w-12 flex items-center justify-center overflow-hidden p-0.5">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${shop.name} logo`} 
                  className="h-11 w-11 object-contain"
                  onError={(e) => {
                    // If logo fails to load, fall back to the icon
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'block';
                    }
                  }}
                />
              ) : null}
              <div className={logoUrl ? "hidden" : "block"}>
                {icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium block">{shop.name}</span>
              <span className="text-xs text-gray-500 truncate block">{shop.url.replace(/^https?:\/\//, "")}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={(e) => onToggleFavorite(shop.url, e)}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={(e) => onCopyUrl(shop.url, e)}
            >
              {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
