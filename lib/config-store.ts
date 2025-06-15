import { create } from 'zustand'

interface AppConfig {
  STANDARD_TRANSPORT_FEE: number
  PREVIOUS_TRANSPORT_FEE: number
  SHOW_PREVIOUS_TRANSPORT_PRICE: boolean
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
  getPreviousTransportFee: () => number
  shouldShowPreviousPrice: () => boolean
  getCustomsFeePercentage: () => number
  getExchangeRate: () => number
}

// Default values (will be replaced when loaded from backend)
const defaultConfigs: AppConfig = {
  STANDARD_TRANSPORT_FEE: 10,
  PREVIOUS_TRANSPORT_FEE: 15,
  SHOW_PREVIOUS_TRANSPORT_PRICE: true,
  PRICE_PER_EXCEEDED_KG: 2.5,
  EXCHANGE_RATE_GBP_EUR: 1.15,
  CUSTOMS_FEE_PERCENTAGE: 0.2, // 20% default
  COMPANY_NAME: 'Pako24',
  COMPANY_EMAIL: 'info.pako24@gmail.com',
  COMPANY_PHONE: '+355 69 123 4567',
  COMPANY_ADDRESS: 'Rruga e Durrësit, Tiranë, Albania',
}

// Session-based config store (no persistence)
export const useConfigStore = create<ConfigStore>((set, get) => ({
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
      if (['STANDARD_TRANSPORT_FEE', 'PREVIOUS_TRANSPORT_FEE', 'PRICE_PER_EXCEEDED_KG', 'EXCHANGE_RATE_GBP_EUR', 'CUSTOMS_FEE_PERCENTAGE'].includes(key)) {
        const numericValue = parseFloat(value)
        if (!isNaN(numericValue)) {
          formattedConfigs[key] = numericValue
          console.log(`Converted ${key} to number: ${numericValue}`)
        }
      } else if (key === 'SHOW_PREVIOUS_TRANSPORT_PRICE') {
        // Convert boolean values
        formattedConfigs[key] = value === 'true'
        console.log(`Converted ${key} to boolean: ${formattedConfigs[key]}`)
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

  getPreviousTransportFee: () => {
    return get().configs.PREVIOUS_TRANSPORT_FEE || 15
  },

  shouldShowPreviousPrice: () => {
    const configs = get().configs
    return configs.SHOW_PREVIOUS_TRANSPORT_PRICE && 
           configs.PREVIOUS_TRANSPORT_FEE > configs.STANDARD_TRANSPORT_FEE
  },

  getCustomsFeePercentage: () => {
    return get().configs.CUSTOMS_FEE_PERCENTAGE || 0.2
  },

  getExchangeRate: () => {
    return get().configs.EXCHANGE_RATE_GBP_EUR || 1.15
  }
}))

// Simple session-based config loading
export const loadAppConfigs = async () => {
  const store = useConfigStore.getState()
  
  // Only load once per session
  if (store.isLoaded) {
    console.log('Configurations already loaded for this session')
    return
  }
  
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
      // On client, use fetch
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
    
    console.log('App configurations loaded successfully for this session')
  } catch (error) {
    console.error('Error loading app configurations:', error)
  }
}
