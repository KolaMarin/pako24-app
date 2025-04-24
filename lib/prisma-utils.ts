import { prisma } from "./prisma"

/**
 * Recalculates and updates the total prices for an order
 * @param orderId The ID of the order to recalculate
 * @returns The updated order with recalculated totals (focused on EUR)
 */
export async function recalculateOrderTotals(orderId: string) {
  // Get all products for the order
  const productLinks = await prisma.productLink.findMany({
    where: { orderId }
  });

  let totalProductsEUR = 0;     // Total price of products in EUR
  let totalCustomsFeeEUR = 0;   // Total customs fee
  let totalTransportFeeEUR = 0; // Total transport fee

  // Calculate totals from individual products
  for (const product of productLinks) {
    // Calculate product price based on quantity
    const productPriceEUR = product.priceEUR * product.quantity;
    
    // Add to total products price
    totalProductsEUR += productPriceEUR;
    
    // Add customs fee (adjusted for quantity)
    totalCustomsFeeEUR += product.customsFee * product.quantity;
    
    // Add transport fee from each product (may or may not need quantity adjustment depending on business rules)
    totalTransportFeeEUR += product.transportFee;
  }

  // Calculate final total (price + customs + transport)
  const finalTotalPriceEUR = totalProductsEUR + totalCustomsFeeEUR + totalTransportFeeEUR;

  // Update the order with new EUR totals
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      totalPriceGBP: 0, // Set GBP to 0 as it's not needed but required by schema
      totalPriceEUR: finalTotalPriceEUR, // Total EUR amount
      totalCustomsFee: totalCustomsFeeEUR, // Store total customs fee in EUR
      totalTransportFee: totalTransportFeeEUR // Store total transport fee in EUR
    },
    include: { 
      productLinks: true,
      user: true // Include user details (email, phone)
    }
  });

  return updatedOrder;
}
