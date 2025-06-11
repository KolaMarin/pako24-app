import { formatPrice } from "@/lib/utils"

interface PriceProps {
  amount: number
  currency?: string
  showCurrency?: boolean
  className?: string
  integerClassName?: string
  decimalClassName?: string
}

export function Price({ 
  amount, 
  currency = '€', 
  showCurrency = true, 
  className = '',
  integerClassName = '',
  decimalClassName = 'text-[0.75em]'
}: PriceProps) {
  const { currency: currencySymbol, integer, decimal } = formatPrice(amount, currency, showCurrency)
  
  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {currencySymbol && <span className="mr-0.5">{currencySymbol}</span>}
      <span className={`${integerClassName}`}>{integer}</span>
      <span className={`ml-0.5 ${decimalClassName}`}>.{decimal}</span>
    </span>
  )
}
