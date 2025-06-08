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
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Kërko dyqane..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-10 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 transition-all border-gray-200 ${
            isMobile ? 'h-10 text-sm placeholder:text-sm' : 'h-12 text-base placeholder:text-base'
          }`}
        />
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
                  className={`relative ${index > 0 ? 'mt-8' : ''} mb-6`}
                  ref={el => {
                    categoryRefs.current[category.name] = el
                  }}
                  id={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {/* Elegant separator line between categories */}
                  {index > 0 && (
                    <div className="absolute -top-4 left-0 right-0 flex items-center justify-center">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <div className="mx-4 w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                  )}
                  
                  {/* Enhanced category card container */}
                  <div className="bg-white rounded-xl border border-gray-200/60 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden">
                    {/* Category header with light blue background */}
                    <div className={`bg-blue-50/60 border-b border-gray-200/50 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`bg-primary rounded-full shadow-sm ${isMobile ? 'w-1 h-6' : 'w-1.5 h-8'}`}></div>
                          <h3 className={`font-bold text-gray-800 tracking-tight ${isMobile ? 'text-lg' : 'text-xl'}`}>{category.name}</h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Shops grid with improved spacing */}
                    <div className={isMobile ? 'p-3' : 'p-6'}>
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
    <Card key={shop.url} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200/60 bg-white/90 backdrop-blur-sm">
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
