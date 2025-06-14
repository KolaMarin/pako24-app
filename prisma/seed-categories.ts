import { PrismaClient } from '@prisma/client'

const categoryPrisma = new PrismaClient()

// Updated categories data with explicit ordering
const initialCategories = [
  { name: "Fashion & Luxury Clothes", description: "High-end fashion brands and luxury clothing retailers", order: 1 },
  { name: "Beauty & Makeup", description: "Cosmetics, skincare, and beauty products retailers", order: 2 },
  { name: "Sports & Fitness", description: "Athletic wear, fitness equipment, and sports retailers", order: 3 },
  { name: "Health & Vitamins", description: "Supplements, vitamins, and health products", order: 4 },
  { name: "Jewelry & Watches", description: "Fine jewelry, watches, and luxury accessories", order: 5 },
  { name: "Specialty & Vintage", description: "Consignment, vintage luxury, and specialty retailers", order: 6 },
  { name: "Toys & Baby", description: "Toys, baby products, and children's items", order: 7 },
  { name: "Pet Supplies", description: "Pet food, accessories, and animal care products", order: 8 },
  { name: "Electronics & Technology", description: "Consumer electronics, computers, and technology products", order: 9 },
  { name: "Home & Furniture", description: "Home furnishings, furniture, and interior décor", order: 10 },
  { name: "Automotive", description: "Auto parts, accessories, and automotive products", order: 11 },
  { name: "Books & Entertainment", description: "Books, games, and entertainment products", order: 12 },
  { name: "Garden & Outdoor", description: "Outdoor furniture, gardening, and patio products", order: 13 },
  { name: "Food & Beverages", description: "Gourmet foods, beverages, and culinary products", order: 14 }
]

async function main() {
  console.log('Starting to seed shop categories...')

  try {
    // For each category in the initial data
    for (const category of initialCategories) {
      try {
        // Check if the category already exists (by name)
        const existingCategory = await categoryPrisma.shopCategory.findFirst({
          where: { name: category.name }
        })

        if (!existingCategory) {
          // Create the category if it doesn't exist
          await categoryPrisma.shopCategory.create({
            data: category
          })
          console.log(`Created category: ${category.name}`)
        } else {
          // Update existing category with the order value
          await categoryPrisma.shopCategory.update({
            where: { id: existingCategory.id },
            data: { order: category.order }
          })
          console.log(`Updated category order for: ${category.name} (order: ${category.order})`)
        }
      } catch (e: any) {
        // If the table doesn't exist yet, just create the category
        if (e.code === 'P2021') {
          await categoryPrisma.shopCategory.create({
            data: category
          })
          console.log(`Created category: ${category.name}`)
        } else {
          throw e
        }
      }
    }
    console.log('Shop categories seeding completed.')
  } catch (error) {
    console.error('Error seeding categories:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await categoryPrisma.$disconnect()
  })

module.exports = main
