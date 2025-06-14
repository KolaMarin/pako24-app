"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Search, Plus, Edit, Trash2, ExternalLink, Check, X, Store, ChevronUp, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Category {
  id: string
  name: string
  description?: string | null
  order: number
  _count?: {
    shops: number
  }
  createdAt: string
  updatedAt: string
}

interface Shop {
  id: string
  name: string
  logoUrl: string | null
  website: string | null
  active: boolean
  categoryId: string | null
  category: Category | null
  createdAt: string
  updatedAt: string
}

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredShops, setFilteredShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactiveShops, setShowInactiveShops] = useState(false)
  
  // Shop dialogs
  const [isAddShopDialogOpen, setIsAddShopDialogOpen] = useState(false)
  const [isEditShopDialogOpen, setIsEditShopDialogOpen] = useState(false)
  const [isDeleteShopDialogOpen, setIsDeleteShopDialogOpen] = useState(false)
  const [currentShop, setCurrentShop] = useState<Shop | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  
  // Category management
  const [isEditingCategory, setIsEditingCategory] = useState<string | null>(null)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editCategoryName, setEditCategoryName] = useState("")
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [hasOrderChanges, setHasOrderChanges] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  
  // Shop form data
  const [shopFormData, setShopFormData] = useState({
    name: "",
    logoUrl: "",
    website: "",
    active: true,
    categoryId: null as string | null,
  })
  
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  // Fetch both shops and categories
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch categories
      const categoriesResponse = await fetch("/api/admin/shop-categories")
      
      // Fetch shops
      const shopsResponse = await fetch("/api/admin/shops")
      
      if (categoriesResponse.ok && shopsResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        const shopsData = await shopsResponse.json()
        
        setCategories(categoriesData)
        setShops(shopsData)
        setFilteredShops(shopsData.filter((shop: Shop) => shop.active))
      } else {
        throw new Error("Failed to fetch data")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Marrja e të dhënave dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (showInactiveShops) {
      setFilteredShops(
        shops.filter((shop) =>
          shop.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredShops(
        shops.filter(
          (shop) =>
            shop.active && shop.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
  }, [searchTerm, shops, showInactiveShops])

  // Category management functions
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    
    try {
      const response = await fetch("/api/admin/shop-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })
      
      if (response.ok) {
        const newCategory = await response.json()
        setCategories([...categories, newCategory])
        setNewCategoryName("")
        setIsAddingCategory(false)
        toast({
          title: "Sukses",
          description: "Kategoria u shtua me sukses.",
        })
      } else {
        throw new Error("Failed to add category")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Shtimi i kategorisë dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = async (categoryId: string) => {
    if (!editCategoryName.trim()) return
    
    try {
      const response = await fetch(`/api/admin/shop-categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editCategoryName.trim() }),
      })
      
      if (response.ok) {
        const updatedCategory = await response.json()
        setCategories(categories.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        ))
        setIsEditingCategory(null)
        setEditCategoryName("")
        toast({
          title: "Sukses",
          description: "Kategoria u përditësua me sukses.",
        })
      } else {
        throw new Error("Failed to update category")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Përditësimi i kategorisë dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async () => {
    if (!currentCategory) return

    try {
      const response = await fetch(`/api/admin/shop-categories/${currentCategory.id}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        // Update shops that were in this category (they'll now have categoryId = null)
        const updatedShops = shops.map(shop => 
          shop.categoryId === currentCategory.id 
            ? { ...shop, categoryId: null, category: null } 
            : shop
        )
        
        setShops(updatedShops)
        setCategories(categories.filter(cat => cat.id !== currentCategory.id))
        setIsDeleteCategoryDialogOpen(false)
        toast({
          title: "Sukses",
          description: "Kategoria u fshi me sukses dhe dyqanet u zhvendosën te 'Të Tjera'.",
        })
      } else {
        throw new Error("Failed to delete category")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Fshirja e kategorisë dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  // Category ordering functions
  const moveCategoryUp = (categoryIndex: number) => {
    if (categoryIndex === 0) return
    
    const newCategories = [...categories]
    const [movedCategory] = newCategories.splice(categoryIndex, 1)
    newCategories.splice(categoryIndex - 1, 0, movedCategory)
    
    // Update order values
    const updatedCategories = newCategories.map((cat, idx) => ({
      ...cat,
      order: idx + 1
    }))
    
    setCategories(updatedCategories)
    setHasOrderChanges(true)
  }

  const moveCategoryDown = (categoryIndex: number) => {
    if (categoryIndex === categories.length - 1) return
    
    const newCategories = [...categories]
    const [movedCategory] = newCategories.splice(categoryIndex, 1)
    newCategories.splice(categoryIndex + 1, 0, movedCategory)
    
    // Update order values
    const updatedCategories = newCategories.map((cat, idx) => ({
      ...cat,
      order: idx + 1
    }))
    
    setCategories(updatedCategories)
    setHasOrderChanges(true)
  }

  const saveCategoryOrder = async () => {
    try {
      setSavingOrder(true)
      
      const categoriesToUpdate = categories.map((cat, index) => ({
        id: cat.id,
        order: index + 1
      }))

      const response = await fetch('/api/admin/shop-categories/update-order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categories: categoriesToUpdate })
      })

      if (!response.ok) throw new Error('Failed to update category order')

      setHasOrderChanges(false)
      
      toast({
        title: "Sukses",
        description: "Renditja e kategorive u përditësua me sukses"
      })
    } catch (error) {
      console.error('Error saving category order:', error)
      toast({
        title: "Gabim",
        description: "Përditësimi i renditjes dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive"
      })
    } finally {
      setSavingOrder(false)
    }
  }

  const resetCategoryOrder = async () => {
    await fetchData()
    setHasOrderChanges(false)
  }

  // Shop management functions
  const handleAddShop = async () => {
    try {
      const response = await fetch("/api/admin/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shopFormData),
      })
      
      if (response.ok) {
        const newShop = await response.json()
        setShops([...shops, newShop])
        setIsAddShopDialogOpen(false)
        resetShopForm()
        toast({
          title: "Sukses",
          description: "Dyqani u shtua me sukses.",
        })
      } else {
        throw new Error("Failed to add shop")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Shtimi i dyqanit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const handleEditShop = async () => {
    if (!currentShop) return

    try {
      const response = await fetch(`/api/admin/shops/${currentShop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shopFormData),
      })
      
      if (response.ok) {
        const updatedShop = await response.json()
        setShops(shops.map((shop) => (shop.id === updatedShop.id ? updatedShop : shop)))
        setIsEditShopDialogOpen(false)
        resetShopForm()
        toast({
          title: "Sukses",
          description: "Dyqani u përditësua me sukses.",
        })
      } else {
        throw new Error("Failed to update shop")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Përditësimi i dyqanit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteShop = async () => {
    if (!currentShop) return

    try {
      const response = await fetch(`/api/admin/shops/${currentShop.id}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        setShops(shops.filter((shop) => shop.id !== currentShop.id))
        setIsDeleteShopDialogOpen(false)
        toast({
          title: "Sukses",
          description: "Dyqani u fshi me sukses.",
        })
      } else {
        throw new Error("Failed to delete shop")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Fshirja e dyqanit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  const handleToggleShopStatus = async (shop: Shop) => {
    try {
      const response = await fetch(`/api/admin/shops/${shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !shop.active }),
      })
      
      if (response.ok) {
        const updatedShop = await response.json()
        setShops(shops.map((s) => (s.id === updatedShop.id ? updatedShop : s)))
        toast({
          title: "Sukses",
          description: `Dyqani u ${updatedShop.active ? "aktivizua" : "çaktivizua"} me sukses.`,
        })
      } else {
        throw new Error("Failed to update shop status")
      }
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Ndryshimi i statusit të dyqanit dështoi. Ju lutemi provoni përsëri.",
        variant: "destructive",
      })
    }
  }

  // Dialog open functions
  const openAddShopDialog = (categoryId: string | null = null) => {
    setSelectedCategoryId(categoryId)
    setShopFormData({
      ...shopFormData,
      categoryId: categoryId
    })
    setIsAddShopDialogOpen(true)
  }

  const openEditShopDialog = (shop: Shop) => {
    setCurrentShop(shop)
    setShopFormData({
      name: shop.name,
      logoUrl: shop.logoUrl || "",
      website: shop.website || "",
      active: shop.active,
      categoryId: shop.categoryId,
    })
    setIsEditShopDialogOpen(true)
  }

  const openDeleteShopDialog = (shop: Shop) => {
    setCurrentShop(shop)
    setIsDeleteShopDialogOpen(true)
  }

  const openEditCategoryMode = (category: Category) => {
    setIsEditingCategory(category.id)
    setEditCategoryName(category.name)
  }

  const openDeleteCategoryDialog = (category: Category) => {
    setCurrentCategory(category)
    setIsDeleteCategoryDialogOpen(true)
  }

  // Reset form functions
  const resetShopForm = () => {
    setShopFormData({
      name: "",
      logoUrl: "",
      website: "",
      active: true,
      categoryId: null,
    })
    setCurrentShop(null)
    setSelectedCategoryId(null)
  }

  // Group shops by category
  const shopsByCategory = () => {
    const grouped: Record<string, Shop[]> = {}
    
    // Initialize with all categories (even empty ones)
    categories.forEach(category => {
      grouped[category.id] = []
    })
    
    // Add "Others" category for uncategorized shops
    grouped["uncategorized"] = []
    
    // Group shops
    filteredShops.forEach(shop => {
      if (shop.categoryId && grouped[shop.categoryId]) {
        grouped[shop.categoryId].push(shop)
      } else {
        grouped["uncategorized"].push(shop)
      }
    })
    
    return grouped
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Duke ngarkuar...</p>
        </div>
      </AdminLayout>
    )
  }

  const groupedShops = shopsByCategory()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with search and add buttons */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <CardTitle>Menaxhimi i Dyqaneve</CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Kërko dyqane..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-inactive"
                    checked={showInactiveShops}
                    onCheckedChange={setShowInactiveShops}
                  />
                  <Label htmlFor="show-inactive">Shfaq joaktivët</Label>
                </div>
                <Button onClick={() => setIsAddingCategory(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Shto Kategori
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Category Dialog */}
        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Shto Kategori të Re</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category-name">Emri i Kategorisë</Label>
                <Input
                  id="category-name"
                  placeholder="Shkruani emrin e kategorisë"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="col-span-3"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddingCategory(false)
                setNewCategoryName("")
              }}>
                Anulo
              </Button>
              <Button onClick={() => {
                handleAddCategory()
                setIsAddingCategory(false)
              }}>
                Shto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Shops by category - with ordering controls */}
        {categories.map((category, index) => (
          <Card key={category.id} className="mb-6 overflow-visible">
            <div className="flex justify-between items-center px-6 pt-6 pb-4 group">
              <div className="flex items-center gap-2">
                {/* Category ordering controls */}
                <div className="flex flex-col gap-0.5 mr-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-6 p-0 text-gray-400 hover:text-gray-600"
                    onClick={() => moveCategoryUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-6 p-0 text-gray-400 hover:text-gray-600"
                    onClick={() => moveCategoryDown(index)}
                    disabled={index === categories.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 mr-2">
                  #{index + 1}
                </div>
                
                <h2 className="text-xl font-bold">{category.name}</h2>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {isEditingCategory === category.id ? (
                    <>
                      <Input
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="h-8 w-[200px]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditCategory(category.id)
                          if (e.key === 'Escape') {
                            setIsEditingCategory(null)
                            setEditCategoryName("")
                          }
                        }}
                      />
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditCategory(category.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => {
                        setIsEditingCategory(null)
                        setEditCategoryName("")
                      }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEditCategoryMode(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => openDeleteCategoryDialog(category)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => openAddShopDialog(category.id)}>
                <Plus className="h-4 w-4 mr-1" />
                Shto Dyqan
              </Button>
            </div>
            
            <CardContent>
              {groupedShops[category.id]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groupedShops[category.id].map((shop) => (
                    <CompactShopCard 
                      key={shop.id} 
                      shop={shop} 
                      onEdit={() => openEditShopDialog(shop)} 
                      onDelete={() => openDeleteShopDialog(shop)}
                      onToggleStatus={() => handleToggleShopStatus(shop)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">Nuk ka dyqane në këtë kategori</p>
                  <Button variant="outline" className="mt-2" onClick={() => openAddShopDialog(category.id)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Shto Dyqan në {category.name}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Uncategorized shops */}
        <Card className="mb-6 overflow-visible">
          <div className="flex justify-between items-center px-6 pt-6 pb-4">
            <h2 className="text-xl font-bold">Të Tjera</h2>
            <Button variant="outline" size="sm" onClick={() => openAddShopDialog(null)}>
              <Plus className="h-4 w-4 mr-1" />
              Shto Dyqan
            </Button>
          </div>
          
          <CardContent>
            {groupedShops["uncategorized"]?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedShops["uncategorized"].map((shop) => (
                  <CompactShopCard 
                    key={shop.id} 
                    shop={shop} 
                    onEdit={() => openEditShopDialog(shop)} 
                    onDelete={() => openDeleteShopDialog(shop)}
                    onToggleStatus={() => handleToggleShopStatus(shop)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Nuk ka dyqane pa kategori</p>
                <Button variant="outline" className="mt-2" onClick={() => openAddShopDialog(null)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Shto Dyqan Pa Kategori
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Shop Dialog */}
        <Dialog open={isAddShopDialogOpen} onOpenChange={setIsAddShopDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedCategoryId 
                  ? `Shto Dyqan në ${categories.find(c => c.id === selectedCategoryId)?.name || ""}` 
                  : "Shto Dyqan të Ri"}
              </DialogTitle>
              <DialogDescription>
                Plotësoni të dhënat për të shtuar një dyqan të ri në platformë.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Emri i Dyqanit</Label>
                <Input
                  id="name"
                  value={shopFormData.name}
                  onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                  placeholder="Emri i dyqanit"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logoUrl">URL e Logos</Label>
                <Input
                  id="logoUrl"
                  value={shopFormData.logoUrl}
                  onChange={(e) => setShopFormData({ ...shopFormData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                {shopFormData.logoUrl && (
                  <div className="mt-2 border rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-2">Paraqitja për klientët:</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 bg-gray-50 rounded-md h-16 w-16 flex items-center justify-center overflow-hidden">
                        <img
                          src={shopFormData.logoUrl}
                          alt="Logo preview"
                          className="h-14 w-14 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder-logo.svg"
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{shopFormData.name || "Emri i Dyqanit"}</span>
                        {shopFormData.website && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            <span>{shopFormData.website.replace(/^https?:\/\//, "")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Faqja Web</Label>
                <Input
                  id="website"
                  value={shopFormData.website}
                  onChange={(e) => setShopFormData({ ...shopFormData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategoria</Label>
                <Select 
                  value={shopFormData.categoryId || ""} 
                  onValueChange={(value) => setShopFormData({ 
                    ...shopFormData, 
                    categoryId: value === "none" ? null : value 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Zgjidhni kategorinë" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="none">Pa kategori</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategoryId && (
                  <p className="text-xs text-muted-foreground">
                    Kategoria e parazgjedhur nga konteksti
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={shopFormData.active}
                  onCheckedChange={(checked) => setShopFormData({ ...shopFormData, active: checked })}
                />
                <Label htmlFor="active">Aktiv</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddShopDialogOpen(false)}>
                Anulo
              </Button>
              <Button onClick={handleAddShop}>Shto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Shop Dialog */}
        <Dialog open={isEditShopDialogOpen} onOpenChange={setIsEditShopDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ndrysho Dyqanin</DialogTitle>
              <DialogDescription>
                Ndryshoni të dhënat e dyqanit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Emri i Dyqanit</Label>
                <Input
                  id="edit-name"
                  value={shopFormData.name}
                  onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-logoUrl">URL e Logos</Label>
                <Input
                  id="edit-logoUrl"
                  value={shopFormData.logoUrl}
                  onChange={(e) => setShopFormData({ ...shopFormData, logoUrl: e.target.value })}
                />
                {shopFormData.logoUrl && (
                  <div className="mt-2 border rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-2">Paraqitja për klientët:</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 bg-gray-50 rounded-md h-16 w-16 flex items-center justify-center overflow-hidden">
                        <img
                          src={shopFormData.logoUrl}
                          alt="Logo preview"
                          className="h-14 w-14 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder-logo.svg"
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{shopFormData.name || "Emri i Dyqanit"}</span>
                        {shopFormData.website && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            <span>{shopFormData.website.replace(/^https?:\/\//, "")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-website">Faqja Web</Label>
                <Input
                  id="edit-website"
                  value={shopFormData.website}
                  onChange={(e) => setShopFormData({ ...shopFormData, website: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Kategoria</Label>
                <Select 
                  value={shopFormData.categoryId || ""} 
                  onValueChange={(value) => setShopFormData({ 
                    ...shopFormData, 
                    categoryId: value === "none" ? null : value 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Zgjidhni kategorinë" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Pa kategori</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={shopFormData.active}
                  onCheckedChange={(checked) => setShopFormData({ ...shopFormData, active: checked })}
                />
                <Label htmlFor="edit-active">Aktiv</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditShopDialogOpen(false)}>
                Anulo
              </Button>
              <Button onClick={handleEditShop}>Ruaj Ndryshimet</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Shop Dialog */}
        <Dialog open={isDeleteShopDialogOpen} onOpenChange={setIsDeleteShopDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmo Fshirjen</DialogTitle>
              <DialogDescription>
                A jeni i sigurt që dëshironi të fshini dyqanin "{currentShop?.name}"? Ky veprim nuk mund të kthehet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteShopDialogOpen(false)}>
                Anulo
              </Button>
              <Button variant="destructive" onClick={handleDeleteShop}>
                Fshi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Category Dialog */}
        <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmo Fshirjen e Kategorisë</DialogTitle>
              <DialogDescription>
                A jeni i sigurt që dëshironi të fshini kategorinë "{currentCategory?.name}"? 
                Të gjitha dyqanet në këtë kategori do të zhvendosen te "Të Tjera". Ky veprim nuk mund të kthehet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteCategoryDialogOpen(false)}>
                Anulo
              </Button>
              <Button variant="destructive" onClick={handleDeleteCategory}>
                Fshi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Fixed notification for category order changes */}
        {hasOrderChanges && (
          <div className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
            <div className="text-sm font-medium mb-2">Renditja e kategorive ka ndryshuar</div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={resetCategoryOrder} disabled={savingOrder}>
                Anulo
              </Button>
              <Button size="sm" onClick={saveCategoryOrder} disabled={savingOrder}>
                {savingOrder ? "Duke ruajtur..." : "Ruaj Renditjen"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

// Compact Shop Card Component (similar to customer view)
function CompactShopCard({ 
  shop, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: { 
  shop: Shop; 
  onEdit: () => void; 
  onDelete: () => void; 
  onToggleStatus: () => void; 
}) {
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${!shop.active ? "opacity-60" : ""}`}>
      <CardContent className="p-0">
        <div className="p-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 bg-gray-50 rounded-md h-16 w-16 flex items-center justify-center overflow-hidden">
              {shop.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt={`${shop.name} logo`}
                  className="h-14 w-14 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-logo.svg"
                  }}
                />
              ) : (
                <Store className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{shop.name}</span>
                {!shop.active && <span className="text-xs text-muted-foreground ml-1">(Joaktiv)</span>}
              </div>
              {shop.website && (
                <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>{shop.website.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-1 mt-2">
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onToggleStatus}>
              {shop.active ? "Çaktivizo" : "Aktivizo"}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
