import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Default configuration values
  const defaultConfigs = [
    {
      key: 'COMPANY_NAME',
      value: 'Pako24',
      description: 'Company name used in emails and documents',
    },
    {
      key: 'COMPANY_EMAIL',
      value: 'info@pako24.com',
      description: 'Primary contact email for the company',
    },
    {
      key: 'COMPANY_PHONE',
      value: '+355 69 123 4567',
      description: 'Primary contact phone number for the company',
    },
    {
      key: 'COMPANY_ADDRESS',
      value: 'Rruga e Durrësit, Tiranë, Albania',
      description: 'Physical address of the company',
    },
    {
      key: 'EXCHANGE_RATE_GBP_EUR',
      value: '1.15',
      description: 'Exchange rate from GBP to EUR',
    },
    {
      key: 'STANDARD_TRANSPORT_FEE',
      value: '10',
      description: 'Standard transport fee in EUR',
    },
    {
      key: 'PRICE_PER_EXCEEDED_KG',
      value: '2.5',
      description: 'Price per exceeded kg in EUR',
    },
  ]

  console.log('Seeding default configuration values...')

  // Create default configurations if they don't exist
  for (const config of defaultConfigs) {
    const existingConfig = await prisma.appConfig.findUnique({
      where: {
        key: config.key,
      },
    })

    if (!existingConfig) {
      await prisma.appConfig.create({
        data: config,
      })
      console.log(`Created config: ${config.key}`)
    } else {
      console.log(`Config already exists: ${config.key}`)
    }
  }

  // Create a default super admin if none exists
  const existingSuperAdmin = await prisma.admin.findFirst({
    where: {
      role: 'SUPER_ADMIN',
    },
  })

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.admin.create({
      data: {
        email: 'admin@pako24.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    })
    console.log('Created default super admin: admin@pako24.com')
  } else {
    console.log('Super admin already exists')
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
