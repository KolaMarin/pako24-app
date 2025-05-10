import { PrismaClient } from '@prisma/client'

// Function to ensure DATABASE_URL is available in all environments
function getDatabaseUrl() {
  // If DATABASE_URL is directly available, use it
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // If individual DB parts are available, construct the URL (for AWS Amplify)
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbName = process.env.DB_NAME;
  
  if (dbUser && dbPassword && dbHost && dbPort && dbName) {
    // Need to properly encode characters like ? in the password
    const encodedPassword = encodeURIComponent(dbPassword);
    return `postgresql://${dbUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbName}`;
  }
  
  // If we get here, we don't have a valid database URL - log for debugging
  console.error("Missing database connection details. Check environment variables.");
  
  // Return the raw value or empty string (this will cause Prisma to error correctly)
  return process.env.DATABASE_URL || "";
}

// PrismaClient wrapper with better connection handling
function createPrismaClient() {
  // Always ensure DATABASE_URL is set with the latest values
  const connectionString = getDatabaseUrl();
  
  // For debugging - log the connection string (with password hidden)
  console.log(`Using connection string: ${connectionString.replace(/:[^:]*@/, ':***@')}`);
  
  // Set the environment variable for Prisma to use
  process.env.DATABASE_URL = connectionString;
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Add a helper function for connection testing
export async function testDatabaseConnection() {
  try {
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    return { success: true };
  } catch (error) {
    console.error("Database connection test failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export default prisma;