import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppConfig {
  STANDARD_TRANSPORT_FEE: number
  PRICE_PER_EXCEEDED_KG: number
  EXCHANGE_RATE_GBP_EUR: number
  CUSTOMS_FEE_PERCENTAGE: number
  COMPANY_NAME: string
  COMPANY_EMAIL: string
  COMPANY_PHONE: string
  COMPANY_ADDRESS: string
  [key: string]: any
}

interface ConfigStore {
  configs: AppConfig
  isLoaded: boolean
  setConfigs: (configs: Record<string, string>) => void
  setLoaded: (loaded: boolean) => void
  getTransportFee: () => number
  getCustomsFeePercentage: () => number
  getExchangeRate: () => number
}

// Default values (will be replaced when loaded from backend)
const defaultConfigs: AppConfig = {
  STANDARD_TRANSPORT_FEE: 10,
  PRICE_PER_EXCEEDED_KG: 2.5,
  EXCHANGE_RATE_GBP_EUR: 1.15,
  CUSTOMS_FEE_PERCENTAGE: 0.2, // 20% default
  COMPANY_NAME: 'Pako24',
  COMPANY_EMAIL: 'info.pako24@gmail.com',
  COMPANY_PHONE: '+355 69 123 4567',
  COMPANY_ADDRESS: 'Rruga e Durrësit, Tiranë, Albania',
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      configs: defaultConfigs,
      isLoaded: false,
      
      setConfigs: (configsObj) => {
        // Start with a clean copy of default configs
        const formattedConfigs: AppConfig = { ...defaultConfigs }
        
        // Process configurations from API
        Object.entries(configsObj).forEach(([key, value]) => {
          // Skip empty values
          if (value === null || value === undefined || value === '') {
            console.log(`Skipping empty value for key: ${key}`)
            return
          }
          
          // Try to convert numeric values to numbers
          if (['STANDARD_TRANSPORT_FEE', 'PRICE_PER_EXCEEDED_KG', 'EXCHANGE_RATE_GBP_EUR', 'CUSTOMS_FEE_PERCENTAGE'].includes(key)) {
            const numericValue = parseFloat(value)
            if (!isNaN(numericValue)) {
              formattedConfigs[key] = numericValue
              console.log(`Converted ${key} to number: ${numericValue}`)
            }
          } else {
            // For non-numeric values, use as-is
            formattedConfigs[key] = value
            console.log(`Set ${key} to string: ${value}`)
          }
        })
        
        set({ configs: formattedConfigs })
      },
      
      setLoaded: (loaded) => set({ isLoaded: loaded }),
      
      getTransportFee: () => {
        return get().configs.STANDARD_TRANSPORT_FEE || 10
      },

      getCustomsFeePercentage: () => {
        return get().configs.CUSTOMS_FEE_PERCENTAGE || 0.2
      },

      getExchangeRate: () => {
        return get().configs.EXCHANGE_RATE_GBP_EUR || 1.15
      }
    }),
    {
      name: 'app-config-storage',
    }
  )
)

// Helper function to load configs from backend
export const loadAppConfigs = async () => {
  const store = useConfigStore.getState()
  
  if (store.isLoaded) return // Don't reload if already loaded
  
  try {
    let configsArray
    
    // Check if we're in a server environment
    if (typeof window === 'undefined') {
      // On server, directly use Prisma instead of making HTTP request
      const { prisma } = await import('./prisma')
      configsArray = await prisma.appConfig.findMany({
        orderBy: { key: 'asc' }
      })
    } else {
      // On client, use fetch as before
      const response = await fetch('/api/configs')
      
      if (!response.ok) {
        console.error('Failed to load configurations, using defaults')
        return
      }
      
      configsArray = await response.json()
    }
    
    // Convert array of configs to object format
    const configsObj: Record<string, string> = {}
    configsArray.forEach((config: { key: string; value: string }) => {
      configsObj[config.key] = config.value
    })
    
    store.setConfigs(configsObj)
    store.setLoaded(true)
    
    console.log('App configurations loaded successfully')
  } catch (error) {
    console.error('Error loading app configurations:', error)
  }
}
