import { PrismaClient } from '@prisma/client'

const categoryPrisma = new PrismaClient()

// Initial categories data
const initialCategories = [
  { name: "Fashion & Clothing", description: "Clothing retailers offering a wide range of fashion items" },
  { name: "Fast Fashion", description: "Affordable and trendy clothing retailers" },
  { name: "Department Stores", description: "Large retail establishments offering a wide range of products" },
  { name: "Beauty & Cosmetics", description: "Retailers specialized in beauty products and cosmetics" },
  { name: "Other", description: "Miscellaneous shops that don't fit other categories" }
]

async function main() {
  console.log('Starting to seed shop categories...')

  // For each category in the initial data
  for (const category of initialCategories) {
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
      console.log(`Category already exists: ${category.name}`)
    }
  }

  console.log('Shop categories seeding completed.')
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
