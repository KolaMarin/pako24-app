'use client'

import { useEffect } from 'react'
import { loadAppConfigs } from '@/lib/config-store'

export function ConfigInitializer() {
  useEffect(() => {
    // Load app configurations once per session
    loadAppConfigs()
  }, [])

  // This component doesn't render anything
  return null
}
