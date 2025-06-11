import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a price with smaller decimal numbers for professional display
 * @param amount - The price amount to format
 * @param currency - The currency symbol (default: '€')
 * @param showCurrency - Whether to show the currency symbol (default: true)
 * @returns Object with integer and decimal parts for rendering
 */
export function formatPrice(amount: number, currency: string = '€', showCurrency: boolean = true) {
  const formattedAmount = amount.toFixed(2)
  const [integer, decimal] = formattedAmount.split('.')
  
  return {
    currency: showCurrency ? currency : '',
    integer,
    decimal,
    full: formattedAmount
  }
}

/**
 * Formats a price as a string with smaller decimals using inline CSS
 * @param amount - The price amount to format  
 * @param currency - The currency symbol (default: '€')
 * @param showCurrency - Whether to show the currency symbol (default: true)
 * @returns HTML string with inline CSS for smaller decimals
 */
export function formatPriceHTML(amount: number, currency: string = '€', showCurrency: boolean = true): string {
  const formattedAmount = amount.toFixed(2)
  const [integer, decimal] = formattedAmount.split('.')
  
  return `${showCurrency ? currency : ''}${integer}<span style="font-size: 0.75em; margin-left: 0.125rem;">.${decimal}</span>`
}
