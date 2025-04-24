import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppConfig {
  STANDARD_TRANSPORT_FEE: number
  PRICE_PER_EXCEEDED_KG: number
  EXCHANGE_RATE_GBP_EUR: number
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
}

// Default values (will be replaced when loaded from backend)
const defaultConfigs: AppConfig = {
  STANDARD_TRANSPORT_FEE: 10,
  PRICE_PER_EXCEEDED_KG: 2.5,
  EXCHANGE_RATE_GBP_EUR: 1.15,
  COMPANY_NAME: 'Pako24',
  COMPANY_EMAIL: 'info@pako24.com',
  COMPANY_PHONE: '+355 69 123 4567',
  COMPANY_ADDRESS: 'Rruga e Durrësit, Tiranë, Albania',
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      configs: defaultConfigs,
      isLoaded: false,
      
      setConfigs: (configsObj) => {
        const formattedConfigs: AppConfig = { ...defaultConfigs }
        
        // Process configurations from API
        Object.entries(configsObj).forEach(([key, value]) => {
          // Try to convert numeric values to numbers
          const numericValue = parseFloat(value)
          formattedConfigs[key] = isNaN(numericValue) ? value : numericValue
        })
        
        set({ configs: formattedConfigs })
      },
      
      setLoaded: (loaded) => set({ isLoaded: loaded }),
      
      getTransportFee: () => {
        return get().configs.STANDARD_TRANSPORT_FEE || 10
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
    const response = await fetch('/api/configs')
    
    if (!response.ok) {
      console.error('Failed to load configurations, using defaults')
      return
    }
    
    const configsArray = await response.json()
    
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
