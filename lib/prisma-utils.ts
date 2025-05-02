import { prisma } from "./prisma"
import { loadAppConfigs, useConfigStore } from "./config-store"

/**
 * Recalculates and updates the total prices for an order
 * @param orderId The ID of the order to recalculate
 * @returns The updated order with recalculated totals (focused on EUR)
 */
export async function recalculateOrderTotals(orderId: string) {
  // Load app configurations to get the latest settings
  await loadAppConfigs();
  const configStore = useConfigStore.getState();
  const transportFeePerProduct = configStore.getTransportFee();
  const customsFeePercentage = configStore.getCustomsFeePercentage();
  
  // Get all products for the order
  const productLinks = await prisma.productLink.findMany({
    where: { orderId }
  });

  let totalProductsEUR = 0;     // Total price of products in EUR
  let totalCustomsFeeEUR = 0;   // Total customs fee
  
  let totalTransportFeeEUR = 0;   // Total transport fee

  // Calculate totals from individual products
  for (const product of productLinks) {
    // Calculate product price based on quantity
    const productPriceEUR = product.priceEUR;
    
    // Add to total products price
    totalProductsEUR += productPriceEUR;
    
    // Add customs fee directly (already includes quantity from OrderInvoiceModal)
    totalCustomsFeeEUR += product.customsFee;
    
    // Add transport fee directly from each product
    totalTransportFeeEUR += product.transportFee;
  }

  // Calculate final total (price + customs + transport)
  const finalTotalPriceEUR = totalProductsEUR + totalCustomsFeeEUR + totalTransportFeeEUR;

  // Update the order with new EUR totals
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      totalPriceGBP: 0, // Set GBP to 0 as it's not needed but required by schema
      totalPriceEUR: totalProductsEUR, // Base product price total
      totalCustomsFee: totalCustomsFeeEUR, // Store total customs fee in EUR
      totalTransportFee: totalTransportFeeEUR, // Store total transport fee in EUR
      totalFinalPriceEUR: finalTotalPriceEUR // Store the final total (sum of all components)
    },
    include: { 
      productLinks: true,
      user: true // Include user details (email, phone)
    }
  });

  return updatedOrder;
}
