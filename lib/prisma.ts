import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Load DATABASE_URL from file if not in env
if (!process.env.DATABASE_URL) {
  try {
    const envContent = readFileSync(join(process.cwd(), '.env.production'), 'utf8')
    const match = envContent.match(/DATABASE_URL=(.*)/)
    if (match) {
      process.env.DATABASE_URL = match[1]
    }
  } catch (e) {
    // File doesn't exist, will error below
  }
}

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma