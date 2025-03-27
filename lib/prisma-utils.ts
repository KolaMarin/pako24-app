import { prisma } from "./prisma"

/**
 * Recalculates and updates the total prices for an order
 * @param orderId The ID of the order to recalculate
 * @returns The updated order with recalculated totals
 */
export async function recalculateOrderTotals(orderId: string) {
  // Get all products for the order
  const productLinks = await prisma.productLink.findMany({
    where: { orderId }
  })
  
  let totalPriceGBP = 0
  let totalPriceEUR = 0
  let totalCustomsFee = 0
  let totalTransportFee = 0

  for (const product of productLinks) {
    totalPriceGBP += product.priceGBP * product.quantity
    totalPriceEUR += product.priceEUR * product.quantity
    totalCustomsFee += product.customsFee * product.quantity
    totalTransportFee += product.transportFee
  }

  const finalTotalPriceGBP = totalPriceGBP + totalCustomsFee + totalTransportFee
  const finalTotalPriceEUR = totalPriceEUR + (totalCustomsFee + totalTransportFee) * 1.15 // Assuming 1 GBP = 1.15 EUR
  
  // Update the order with new totals
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      totalPriceGBP: finalTotalPriceGBP,
      totalPriceEUR: finalTotalPriceEUR,
      totalCustomsFee,
      totalTransportFee
    },
    include: { productLinks: true }
  })
  
  return updatedOrder
}
