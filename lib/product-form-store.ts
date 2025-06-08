import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ProductLink {
  url: string
  quantity: number
  size: string
  color: string
  additionalInfo: string
  price: number
  title: string
  currency: 'GBP' | 'EUR'
}

interface ProductFormState {
  productLinks: ProductLink[]
  addProductLink: () => void
  updateProductLink: (index: number, field: keyof ProductLink, value: string | number | boolean) => void
  removeProductLink: (index: number) => void
  clearForm: () => void
  setProductLinks: (links: ProductLink[]) => void
}

// Default empty product
export const getEmptyProduct = (): ProductLink => ({
  url: "",
  quantity: 1,
  size: "",
  color: "",
  additionalInfo: "",
  price: 0,
  title: "",
  currency: "GBP", // Default to GBP to maintain current behavior
})

export const useProductFormStore = create<ProductFormState>()(
  persist(
    (set) => ({
      productLinks: [getEmptyProduct()],
      
      addProductLink: () => set((state) => ({
        productLinks: [...state.productLinks, getEmptyProduct()]
      })),
      
      updateProductLink: (index, field, value) => set((state) => {
        const updatedLinks = [...state.productLinks]
        
        // Ensure quantity is always an integer
        if (field === "quantity" && typeof value === "number") {
          value = Math.max(1, Math.floor(value))
        }
        
        updatedLinks[index] = { ...updatedLinks[index], [field]: value }
        return { productLinks: updatedLinks }
      }),
      
      removeProductLink: (index) => set((state) => {
        // Don't remove if it's the last product
        if (state.productLinks.length <= 1) {
          return state
        }
        return {
          productLinks: state.productLinks.filter((_, i) => i !== index)
        }
      }),
      
      clearForm: () => set({
        productLinks: [getEmptyProduct()]
      }),
      
      setProductLinks: (links) => set({
        productLinks: links
      })
    }),
    {
      name: 'product-form-storage', // name of the localStorage key
    }
  )
)
