"use client"

import type React from "react"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
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
  order?: number
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
  const [activeCategory, setActiveCategory] = useState<string>("") 
  // Use the Zustand store instead of local state and fetch
  const { shops, isLoading: loading, error, fetchShops } = useShopsStore()
  
  // Refs for scroll spy functionality
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

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

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Get all shops with their categories
  const allShops = useMemo(() => {
    return shops.map(shop => ({
      ...shop
    }))
  }, [shops])
  
  // Group shops by category with proper ordering
  const categories: CategoryWithShops[] = useMemo(() => {
    const groupedShops: Record<string, { shops: Shop[], order: number }> = {}
    
    // First, initialize categories, even those with no shops
    allShops.forEach(shop => {
      if (shop.category) {
        // Use category name from the database
        const categoryName = shop.category.name
        const categoryOrder = (shop.category as any).order || 999
        if (!groupedShops[categoryName]) {
          groupedShops[categoryName] = { shops: [], order: categoryOrder }
        }
        groupedShops[categoryName].shops.push(shop)
      } else {
        // For shops with no category, put them in "Other"
        if (!groupedShops["Other"]) {
          groupedShops["Other"] = { shops: [], order: 999 }
        }
        groupedShops["Other"].shops.push(shop)
      }
    })
    
    // Convert to array and sort by category order
    return Object.entries(groupedShops)
      .map(([name, data]) => ({
        name,
        shops: data.shops.sort((a, b) => a.name.localeCompare(b.name)),
        order: data.order
      }))
      .sort((a, b) => a.order - b.order)
      .map(({ name, shops }) => ({ name, shops }))
  }, [allShops])

  // Set initial active category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && activeCategory === "") {
      setActiveCategory(categories[0].name)
    }
  }, [categories, activeCategory])

  // Scroll spy functionality
  const handleScroll = useCallback(() => {
    if (activeTab !== "all" || searchTerm) return

    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!scrollContainer) return

    const scrollTop = scrollContainer.scrollTop
    const containerHeight = scrollContainer.clientHeight
    
    let currentCategory = activeCategory

    categories.forEach(category => {
      const categoryElement = categoryRefs.current[category.name]
      if (categoryElement) {
        const rect = categoryElement.getBoundingClientRect()
        const containerRect = scrollContainer.getBoundingClientRect()
        const relativeTop = rect.top - containerRect.top

        // Category is visible if it's in the top half of the container
        if (relativeTop <= containerHeight / 2 && relativeTop >= -rect.height / 2) {
          currentCategory = category.name
        }
      }
    })

    if (currentCategory !== activeCategory) {
      setActiveCategory(currentCategory)
    }
  }, [activeTab, searchTerm, categories, activeCategory])

  // Set up scroll listener
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Handle category click - scroll to category
  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(categoryName)
    const categoryElement = categoryRefs.current[categoryName]
    if (categoryElement && scrollAreaRef.current) {
      categoryElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }

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

  // Simple fallback icon for when logo fails to load or doesn't exist
  const getShopIcon = (isMobile = false) => {
    return <Globe className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-gray-600`} />
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Search className="h-5 w-5 text-blue-500" />
        </div>
        <Input
          placeholder="Kërko dyqane nga e gjithë bota..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-12 pr-4 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50 border-2 border-gray-200 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 focus-visible:border-blue-400 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm ${
            isMobile ? 'h-11 text-sm placeholder:text-sm font-medium' : 'h-12 text-base placeholder:text-base font-medium'
          }`}
        />
        {searchTerm && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md text-xs font-medium">
              {filteredShops.length} rezultate
            </div>
          </div>
        )}
      </div>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">Të Gjitha</TabsTrigger>
          <TabsTrigger value="favorites">Të Preferuarat</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Horizontal Category Filter - Only show when activeTab is "all" and no search */}
      {activeTab === "all" && !searchTerm && categories.length > 0 && (
        <div className="w-full">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-3 px-1 min-w-max">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={activeCategory === category.name ? "default" : "outline"}
                  size="sm"
                  className={`
                    flex-shrink-0 rounded-full transition-all whitespace-nowrap
                    ${isMobile 
                      ? "px-3 py-1.5 text-xs h-7 min-w-fit" 
                      : "px-4 py-2 text-sm h-9"
                    }
                    ${activeCategory === category.name 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground border-input"
                    }
                  `}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ScrollArea 
        ref={scrollAreaRef}
        className={`${isMobile ? "h-[calc(100vh-350px)] pr-1" : "h-[500px] pr-4"}`}
      >
        {loading ? (
          <div className={`text-center text-gray-500 ${isMobile ? 'py-6 text-sm' : 'py-8 text-base'}`}>
            Duke ngarkuar dyqanet...
          </div>
        ) : error ? (
          <div className={`text-center text-red-500 ${isMobile ? 'py-6 text-sm' : 'py-8 text-base'}`}>
            {error}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className={`text-center text-gray-500 ${isMobile ? 'py-6 text-sm' : 'py-8 text-base'}`}>
            {activeTab === "favorites"
              ? "Nuk keni dyqane të preferuara. Shtoni disa duke klikuar ikonën e zemrës."
              : "Nuk u gjet asnjë dyqan që përputhet me kërkimin tuaj."}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Group shops by category */}
            {activeTab === "all" && !searchTerm ? (
              categories.map((category, index) => (
                <div 
                  key={category.name} 
                  className={`relative ${index > 0 ? 'mt-12' : 'mt-6'} mb-8`}
                  ref={el => {
                    categoryRefs.current[category.name] = el
                  }}
                  id={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {/* Professional separator with category title */}
                  <div className="relative mb-4">
                    {/* Main separator line */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
                    </div>
                    
                    {/* Category title container */}
                    <div className="relative flex justify-center">
                      <div className={`bg-gradient-to-r from-blue-200 via-blue-50 to-purple-200 px-4 py-2 border-2 border-blue-400/80 rounded-full shadow-lg hover:shadow-xl hover:from-blue-300 hover:via-blue-100 hover:to-purple-300 hover:border-blue-500 transition-all duration-300 backdrop-blur-sm ${
                        isMobile ? 'mx-3' : 'mx-6'
                      }`}>
                        <div className="flex items-center gap-2">
                          {/* Category icon */}
                          <div className={`flex items-center justify-center rounded-full bg-gradient-to-r from-blue-700 via-blue-800 to-purple-700 shadow-md hover:shadow-lg hover:from-blue-800 hover:via-blue-900 hover:to-purple-800 transition-all duration-300 ${
                            isMobile ? 'w-6 h-6' : 'w-7 h-7'
                          }`}>
                            <Store className={`text-white ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                          </div>
                          
                          {/* Category name */}
                          <h3 className={`font-bold text-gray-900 tracking-tight ${
                            isMobile ? 'text-sm' : 'text-lg'
                          }`}>
                            {category.name}
                          </h3>
                          
                          {/* Shop count badge */}
                          <div className={`bg-gradient-to-r from-blue-300 to-purple-300 text-blue-900 rounded-full font-bold border-2 border-blue-500/60 shadow-md ${
                            isMobile ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
                          }`}>
                            {category.shops.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shops grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {category.shops.map((shop) => (
                      <div key={shop.id} className="transform hover:scale-[1.02] transition-transform duration-200">
                        <ShopCard
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
                          icon={getShopIcon(isMobile)}
                          logoUrl={shop.logoUrl}
                          isMobile={isMobile}
                        />
                      </div>
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
                    icon={getShopIcon(isMobile)}
                    logoUrl={shop.logoUrl}
                    isMobile={isMobile}
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
  isMobile = false,
}: {
  shop: { name: string; url: string; category?: string }
  isFavorite: boolean
  isCopied: boolean
  onShopClick: (url: string) => void
  onToggleFavorite: (url: string, e: React.MouseEvent) => void
  onCopyUrl: (url: string, e: React.MouseEvent) => void
  icon: React.ReactNode
  logoUrl?: string | null
  isMobile?: boolean
}) {
  return (
    <Card key={shop.url} className="overflow-hidden border border-blue-200/70 bg-white/95 backdrop-blur-sm shadow-md shadow-blue-100/60 hover:shadow-lg hover:shadow-blue-200/70 hover:border-blue-300/90 transition-all duration-300">
      <CardContent className="p-0">
        <div className={`flex items-center cursor-pointer hover:bg-gray-50/50 transition-colors duration-200 ${isMobile ? 'p-3' : 'p-4'}`} onClick={() => onShopClick(shop.url)}>
          <div className={`flex items-center min-w-0 ${isMobile ? 'gap-2 flex-1 mr-2' : 'gap-3 flex-1 mr-3'}`}>
            <div className={`flex-shrink-0 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden p-0.5 ${isMobile ? 'h-10 w-10' : 'h-12 w-12'}`}>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${shop.name} logo`} 
                  className={`object-contain ${isMobile ? 'h-9 w-9' : 'h-11 w-11'}`}
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
            <div className="flex-1 min-w-0 overflow-hidden">
              <span className={`font-medium block truncate ${isMobile ? 'text-sm' : 'text-base'}`}>{shop.name}</span>
              <span className={`text-gray-500 truncate block ${isMobile ? 'text-xs' : 'text-xs'}`}>{shop.url.replace(/^https?:\/\//, "")}</span>
            </div>
          </div>
          <div className={`flex flex-shrink-0 ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 rounded-full ${isMobile ? 'h-7 w-7' : 'h-8 w-8'}`}
              onClick={(e) => onToggleFavorite(shop.url, e)}
            >
              <Heart className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 rounded-full ${isMobile ? 'h-7 w-7' : 'h-8 w-8'}`}
              onClick={(e) => onCopyUrl(shop.url, e)}
            >
              {isCopied ? <Check className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-green-600`} /> : <Copy className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-gray-500`} />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
