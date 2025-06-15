'use client'

import { useEffect } from 'react'
import { useShopsStore } from '@/lib/shops-store'

export function ShopsInitializer() {
  const { fetchShops } = useShopsStore()
  
  useEffect(() => {
    // Only fetch on page load/refresh, similar to ConfigInitializer
    fetchShops()
  }, [fetchShops])
  
  // This is a utility component that doesn't render anything
  return null
}
