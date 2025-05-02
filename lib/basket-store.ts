import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type ProductLink, getEmptyProduct } from './product-form-store'

interface BasketState {
  items: ProductLink[]
  addItem: (product: ProductLink) => void
  removeItem: (index: number) => void
  updateItem: (index: number, field: keyof ProductLink, value: string | number | boolean) => void
  clearBasket: () => void
  itemCount: () => number
  uniqueProductCount: () => number
}

export const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => set((state) => ({
        items: [...state.items, {...product}]
      })),
      
      removeItem: (index) => set((state) => ({
        items: state.items.filter((_, i) => i !== index)
      })),
      
      updateItem: (index, field, value) => set((state) => {
        const updatedItems = [...state.items]
        
        // Ensure quantity is always an integer
        if (field === "quantity" && typeof value === "number") {
          value = Math.max(1, Math.floor(value))
        }
        
        updatedItems[index] = { ...updatedItems[index], [field]: value }
        return { items: updatedItems }
      }),
      
      clearBasket: () => set({ items: [] }),
      
      itemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
      
      uniqueProductCount: () => get().items.length
    }),
    {
      name: 'basket-storage',
    }
  )
)
