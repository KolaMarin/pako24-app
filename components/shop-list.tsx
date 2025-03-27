"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Copy, Check, Heart, Store, Globe, ShoppingBag } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Categories and shops
const categories = [
  {
    name: "Fashion & Clothing",
    shops: [
      { name: "ASOS", url: "https://www.asos.com/" },
      { name: "Zara", url: "https://www.zara.com/uk/" },
      { name: "H&M", url: "https://www2.hm.com/en_gb/" },
      { name: "Mango", url: "https://shop.mango.com/gb" },
      { name: "Uniqlo", url: "https://www.uniqlo.com/uk/" },
      { name: "& Other Stories", url: "https://www.stories.com/" },
      { name: "COS", url: "https://www.cosstores.com/" },
      { name: "Arket", url: "https://www.arket.com/" },
    ],
  },
  {
    name: "Fast Fashion",
    shops: [
      { name: "Boohoo", url: "https://www.boohoo.com/" },
      { name: "PrettyLittleThing", url: "https://www.prettylittlething.com/" },
      { name: "SHEIN", url: "https://www.shein.co.uk/" },
      { name: "Missguided", url: "https://www.missguided.co.uk/" },
      { name: "Nasty Gal", url: "https://www.nastygal.com/" },
    ],
  },
  {
    name: "Department Stores",
    shops: [
      { name: "Marks & Spencer", url: "https://www.marksandspencer.com/" },
      { name: "Selfridges", url: "https://www.selfridges.com/" },
      { name: "Harrods", url: "https://www.harrods.com/" },
      { name: "John Lewis", url: "https://www.johnlewis.com/" },
    ],
  },
  {
    name: "Beauty & Cosmetics",
    shops: [
      { name: "Sephora", url: "https://www.sephora.com/" },
      { name: "Boots", url: "https://www.boots.com/" },
      { name: "Cult Beauty", url: "https://www.cultbeauty.co.uk/" },
      { name: "Look Fantastic", url: "https://www.lookfantastic.com/" },
    ],
  },
]

export function ShopList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
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

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Get all shops in a flat array
  const allShops = useMemo(() => {
    return categories.flatMap((category) =>
      category.shops.map((shop) => ({
        ...shop,
        category: category.name,
      })),
    )
  }, [])

  const filteredShops = useMemo(() => {
    let shops = allShops

    // Filter by search term
    if (searchTerm) {
      shops = shops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.url.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by tab
    if (activeTab === "favorites") {
      shops = shops.filter((shop) => favorites.has(shop.url))
    }

    return shops
  }, [searchTerm, activeTab, favorites, allShops])

  const handleShopClick = (url: string) => {
    window.open(url, "_blank")
  }

  const copyToClipboard = (url: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast({
      title: "URL u kopjua",
      description: "URL u kopjua në clipboard. Tani mund ta ngjisni në formën e porosisë.",
    })

    setTimeout(() => {
      setCopiedUrl(null)
    }, 2000)
  }

  const toggleFavorite = (url: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const newFavorites = new Set(favorites)
    if (newFavorites.has(url)) {
      newFavorites.delete(url)
    } else {
      newFavorites.add(url)
    }

    setFavorites(newFavorites)

    // Save to localStorage
    localStorage.setItem("favoriteShops", JSON.stringify(Array.from(newFavorites)))
  }

  // Modifica la funzione getShopIcon per assegnare colori diversi alle icone dei negozi
  const getShopIcon = (url: string) => {
    if (url.includes("asos")) return <ShoppingBag className="h-5 w-5 text-blue-600" />
    if (url.includes("zara")) return <ShoppingBag className="h-5 w-5 text-red-600" />
    if (url.includes("hm")) return <ShoppingBag className="h-5 w-5 text-green-600" />
    if (url.includes("mango")) return <ShoppingBag className="h-5 w-5 text-yellow-600" />
    if (url.includes("uniqlo")) return <ShoppingBag className="h-5 w-5 text-purple-600" />
    if (url.includes("stories")) return <ShoppingBag className="h-5 w-5 text-pink-600" />
    if (url.includes("cos")) return <ShoppingBag className="h-5 w-5 text-indigo-600" />
    if (url.includes("arket")) return <ShoppingBag className="h-5 w-5 text-teal-600" />
    if (url.includes("boohoo")) return <ShoppingBag className="h-5 w-5 text-orange-600" />
    if (url.includes("prettylittlething")) return <ShoppingBag className="h-5 w-5 text-pink-500" />
    if (url.includes("shein")) return <ShoppingBag className="h-5 w-5 text-black" />
    if (url.includes("missguided")) return <ShoppingBag className="h-5 w-5 text-purple-500" />
    if (url.includes("nastygal")) return <ShoppingBag className="h-5 w-5 text-red-500" />
    if (url.includes("marks")) return <Store className="h-5 w-5 text-green-700" />
    if (url.includes("selfridges")) return <Store className="h-5 w-5 text-yellow-700" />
    if (url.includes("harrods")) return <Store className="h-5 w-5 text-amber-700" />
    if (url.includes("johnlewis")) return <Store className="h-5 w-5 text-blue-700" />
    if (url.includes("sephora")) return <ShoppingBag className="h-5 w-5 text-purple-800" />
    if (url.includes("boots")) return <ShoppingBag className="h-5 w-5 text-blue-800" />
    if (url.includes("cultbeauty")) return <ShoppingBag className="h-5 w-5 text-pink-800" />
    if (url.includes("lookfantastic")) return <ShoppingBag className="h-5 w-5 text-teal-800" />

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
          className="pl-10 h-12 text-base"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">Të Gjitha</TabsTrigger>
          <TabsTrigger value="favorites">Të Preferuarat</TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className={isMobile ? "h-[calc(100vh-300px)]" : "h-[500px]"} className="pr-4">
        {filteredShops.length === 0 ? (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.shops.map((shop) => (
                      <ShopCard
                        key={shop.url}
                        shop={shop}
                        isFavorite={favorites.has(shop.url)}
                        isCopied={copiedUrl === shop.url}
                        onShopClick={handleShopClick}
                        onToggleFavorite={toggleFavorite}
                        onCopyUrl={copyToClipboard}
                        icon={getShopIcon(shop.url)}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredShops.map((shop) => (
                  <ShopCard
                    key={shop.url}
                    shop={shop}
                    isFavorite={favorites.has(shop.url)}
                    isCopied={copiedUrl === shop.url}
                    onShopClick={handleShopClick}
                    onToggleFavorite={toggleFavorite}
                    onCopyUrl={copyToClipboard}
                    icon={getShopIcon(shop.url)}
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
}: {
  shop: { name: string; url: string; category?: string }
  isFavorite: boolean
  isCopied: boolean
  onShopClick: (url: string) => void
  onToggleFavorite: (url: string, e: React.MouseEvent) => void
  onCopyUrl: (url: string, e: React.MouseEvent) => void
  icon: React.ReactNode
}) {
  return (
    <Card key={shop.url} className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => onShopClick(shop.url)}>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 bg-gray-50 rounded-full h-10 w-10 flex items-center justify-center">
              {icon}
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

