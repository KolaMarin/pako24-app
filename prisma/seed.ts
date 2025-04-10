import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Import shop and category seed functions
// Using require since the module exports are CommonJS style
const seedCategories = require('./seed-categories')
const seedShops = require('./seed-shops')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clean the database
  await prisma.productLink.deleteMany()
  await prisma.order.deleteMany()
  await prisma.user.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.shop.deleteMany()
  await prisma.shopCategory.deleteMany()
  
  // Create admin user
  const adminUser = await prisma.admin.create({
    data: {
      email: 'admin@pako24.com',
      password: bcrypt.hashSync('secureAdminPass123!', 10),
      role: 'ADMIN',
    },
  })
  
  console.log('Created admin user:', adminUser.id)

  // Create default user
  const defaultUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      phoneNumber: '+355123456789',
      password: bcrypt.hashSync('password123', 10),
      location: 'Tirana, Albania',
    },
  })

  console.log('Created default user:', defaultUser.id)

  // Create mock orders
  const order1 = await prisma.order.create({
    data: {
      userId: defaultUser.id,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      totalPriceGBP: 0, // Will be calculated
      totalPriceEUR: 0, // Will be calculated
      totalCustomsFee: 0, // Will be calculated
      totalTransportFee: 0, // Will be calculated
      productLinks: {
        create: [
          {
            url: 'https://www.amazon.co.uk/Nike-Training-Shoes',
            quantity: 2,
            size: '42',
            color: 'Black/White',
            priceGBP: 89.99,
            priceEUR: 103.49,
            customsFee: 18,
            transportFee: 5,
          },
          {
            url: 'https://www.amazon.co.uk/Adidas-Running-Shorts',
            quantity: 3,
            size: 'M',
            color: 'Navy',
            priceGBP: 24.99,
            priceEUR: 28.74,
            customsFee: 5,
            transportFee: 2,
          },
          {
            url: 'https://www.amazon.co.uk/Sports-Water-Bottle',
            quantity: 1,
            size: '1L',
            color: 'Blue',
            priceGBP: 15.99,
            priceEUR: 18.39,
            customsFee: 3.2,
            transportFee: 1,
          },
          {
            url: 'https://www.amazon.co.uk/Compression-Socks',
            quantity: 4,
            size: 'L',
            color: 'Black',
            priceGBP: 12.99,
            priceEUR: 14.94,
            customsFee: 2.6,
            transportFee: 1,
          },
          {
            url: 'https://www.amazon.co.uk/Sports-Backpack',
            quantity: 1,
            size: 'One Size',
            color: 'Grey',
            priceGBP: 45.99,
            priceEUR: 52.89,
            customsFee: 9.2,
            transportFee: 3,
          },
        ],
      },
    },
  })

  const order2 = await prisma.order.create({
    data: {
      userId: defaultUser.id,
      status: 'PROCESSING',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      totalPriceGBP: 0,
      totalPriceEUR: 0,
      totalCustomsFee: 0,
      totalTransportFee: 0,
      productLinks: {
        create: [
          {
            url: 'https://www.amazon.co.uk/Gaming-Laptop',
            quantity: 1,
            size: '15.6"',
            color: 'Black',
            priceGBP: 899.99,
            priceEUR: 1034.99,
            customsFee: 180,
            transportFee: 20,
          },
          {
            url: 'https://www.amazon.co.uk/Wireless-Mouse',
            quantity: 2,
            size: 'Standard',
            color: 'Black/RGB',
            priceGBP: 45.99,
            priceEUR: 52.89,
            customsFee: 9.2,
            transportFee: 3,
          },
          {
            url: 'https://www.amazon.co.uk/Mechanical-Keyboard',
            quantity: 1,
            size: 'Full',
            color: 'White',
            priceGBP: 129.99,
            priceEUR: 149.49,
            customsFee: 26,
            transportFee: 8,
          },
          {
            url: 'https://www.amazon.co.uk/Gaming-Headset',
            quantity: 1,
            size: 'One Size',
            color: 'Black/Red',
            priceGBP: 79.99,
            priceEUR: 91.99,
            customsFee: 16,
            transportFee: 5,
          },
        ],
      },
    },
  })

  const order3 = await prisma.order.create({
    data: {
      userId: defaultUser.id,
      status: 'SHIPPED',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      totalPriceGBP: 0,
      totalPriceEUR: 0,
      totalCustomsFee: 0,
      totalTransportFee: 0,
      productLinks: {
        create: [
          {
            url: 'https://www.amazon.co.uk/Perfume-Designer',
            quantity: 2,
            size: '100ml',
            color: 'N/A',
            priceGBP: 85.99,
            priceEUR: 98.89,
            customsFee: 17.2,
            transportFee: 5,
          },
          {
            url: 'https://www.amazon.co.uk/Makeup-Palette',
            quantity: 1,
            size: 'Standard',
            color: 'Neutral',
            priceGBP: 45.99,
            priceEUR: 52.89,
            customsFee: 9.2,
            transportFee: 3,
          },
          {
            url: 'https://www.amazon.co.uk/Skincare-Set',
            quantity: 1,
            size: 'Full Set',
            color: 'N/A',
            priceGBP: 129.99,
            priceEUR: 149.49,
            customsFee: 26,
            transportFee: 8,
          },
          {
            url: 'https://www.amazon.co.uk/Hair-Styling-Tools',
            quantity: 1,
            size: 'Professional',
            color: 'Rose Gold',
            priceGBP: 199.99,
            priceEUR: 229.99,
            customsFee: 40,
            transportFee: 10,
          },
          {
            url: 'https://www.amazon.co.uk/Luxury-Brushes',
            quantity: 3,
            size: 'Set',
            color: 'Rose Gold',
            priceGBP: 29.99,
            priceEUR: 34.49,
            customsFee: 6,
            transportFee: 2,
          },
        ],
      },
    },
  })

  // Calculate totals for all orders
  const orders = [order1, order2, order3]
  
  for (const order of orders) {
    const productLinks = await prisma.productLink.findMany({
      where: { orderId: order.id },
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

    await prisma.order.update({
      where: { id: order.id },
      data: {
        totalPriceGBP: totalPriceGBP + totalCustomsFee + totalTransportFee,
        totalPriceEUR: totalPriceEUR + (totalCustomsFee + totalTransportFee) * 1.15, // Assuming 1 GBP = 1.15 EUR
        totalCustomsFee,
        totalTransportFee,
      },
    })
  }

  // Seed shop categories and shops
  console.log('Seeding shop categories...')
  await seedCategories()
  
  console.log('Seeding shops with categories...')
  await seedShops()
  
  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
