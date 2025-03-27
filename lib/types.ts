interface ProductLink {
  id: string
  url: string
  quantity: number
  size: string
  color: string
  priceGBP: number
  priceEUR: number
  customsFee: number
  transportFee: number
}

interface Order {
  id: string
  userId: string
  productLinks: ProductLink[]
  additionalInfo?: string
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  createdAt: Date
  updatedAt: Date
  totalPriceGBP: number
  totalPriceEUR: number
  totalCustomsFee: number
  totalTransportFee: number
}

export type { Order, ProductLink }
