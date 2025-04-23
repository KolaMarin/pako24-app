import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types from your existing code
interface Category {
  id: string
  name: string
  description?: string | null
}

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

interface ShopsState {
  shops: Shop[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null
  fetchShops: () => Promise<void>
  setShops: (shops: Shop[]) => void
}

export const useShopsStore = create<ShopsState>()(
  persist(
    (set, get) => ({
      shops: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      
      fetchShops: async () => {
        try {
          set({ isLoading: true, error: null })
          const response = await fetch('/api/shops')
          
          if (!response.ok) {
            throw new Error('Failed to fetch shops')
          }
          
          const shops = await response.json()
          set({ 
            shops, 
            isLoading: false,
            lastFetched: Date.now()
          })
        } catch (err) {
          console.error('Error fetching shops:', err)
          set({ 
            error: 'Could not load shops. Please try again later.',
            isLoading: false
          })
        }
      },
      
      setShops: (shops) => set({ shops })
    }),
    {
      name: 'shops-storage',
    }
  )
)
