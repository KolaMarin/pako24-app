'use client'

import { useEffect } from 'react'
import { useShopsStore } from '@/lib/shops-store'

export function ShopsInitializer() {
  const { fetchShops } = useShopsStore()
  
  useEffect(() => {
    // Always fetch on page load/refresh to ensure data is fresh from the backend
    fetchShops()
    
    // Add event listener for page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When user returns to the tab, fetch fresh data
        fetchShops()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchShops])
  
  // This is a utility component that doesn't render anything
  return null
}
