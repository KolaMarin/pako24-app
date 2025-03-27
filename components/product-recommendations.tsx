"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { ArrowRight, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"

interface Product {
  id: string
  name: string
  price: string
  currency: string
  imageUrl: string
  shopName: string
  productUrl: string
}

export function ProductRecommendations() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [savedProducts, setSavedProducts] = useState<Set<string>>(new Set())
  const { user } = useAuth()

  useEffect(() => {
    // In a real implementation, this would fetch from your API
    // based on user preferences, popular items, etc.
    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        // Mock data - would be replaced with actual API call
        setTimeout(() => {
          setProducts([
            {
              id: "1",
              name: "Nike Air Max 270",
              price: "150",
              currency: "£",
              imageUrl: "/placeholder.svg?height=200&width=200",
              shopName: "Nike",
              productUrl: "https://www.nike.com/gb/t/air-max-270-shoes-VKXdPR/DD1506-118",
            },
            {
              id: "2",
              name: "Levi's 501 Original Fit Jeans",
              price: "95",
              currency: "£",
              imageUrl: "/placeholder.svg?height=200&width=200",
              shopName: "Levi's",
              productUrl: "https://www.levi.com/GB/en_GB/clothing/men/jeans/501-original-fit-jeans/p/005010101",
            },
            {
              id: "3",
              name: "Apple AirPods Pro",
              price: "249",
              currency: "£",
              imageUrl: "/placeholder.svg?height=200&width=200",
              shopName: "Apple",
              productUrl: "https://www.apple.com/uk/airpods-pro/",
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch recommendations:", error)
        setLoading(false)
      }
    }

    fetchRecommendations()

    // Load saved products from localStorage
    if (user) {
      const saved = localStorage.getItem(`savedProducts-${user.email}`)
      if (saved) {
        setSavedProducts(new Set(JSON.parse(saved)))
      }
    }
  }, [user])

  const toggleSaveProduct = (productId: string) => {
    if (!user) return

    const newSavedProducts = new Set(savedProducts)
    if (newSavedProducts.has(productId)) {
      newSavedProducts.delete(productId)
    } else {
      newSavedProducts.add(productId)
    }

    setSavedProducts(newSavedProducts)
    localStorage.setItem(`savedProducts-${user.email}`, JSON.stringify(Array.from(newSavedProducts)))
  }

  const addToOrder = (product: Product) => {
    // In a real implementation, this would add the product to the current order
    // or navigate to the order form with the product pre-filled
    window.location.href = `/?product=${encodeURIComponent(product.productUrl)}`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Produkte të Rekomanduara</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Produkte të Rekomanduara</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full bg-gray-100">
              <Image src={product.imageUrl || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                onClick={() => toggleSaveProduct(product.id)}
              >
                {savedProducts.has(product.id) ? (
                  <BookmarkCheck className="h-4 w-4 text-indigo-600" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="mb-2">
                <p className="text-xs text-gray-500">{product.shopName}</p>
                <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-semibold">
                  {product.currency}
                  {product.price}
                </p>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => addToOrder(product)}>
                  Porositë <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

