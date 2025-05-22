import { PrismaClient } from '@prisma/client'

// Function to ensure DATABASE_URL is available in all environments
function getDatabaseUrl() {
  try {
    // Prioritize using DATABASE_URL directly if it's available and valid
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@')) {
      console.log("Using direct DATABASE_URL environment variable");
      return process.env.DATABASE_URL;
    }
    
    // Fall back to constructing from individual components if needed
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT;
    const dbName = process.env.DB_NAME;
    
    if (dbUser && dbPassword && dbHost && dbPort && dbName) {
      // Need to properly encode characters like ? in the password
      const encodedPassword = encodeURIComponent(dbPassword);
      const constructedUrl = `postgresql://${dbUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbName}`;
      console.log("Using constructed database URL from environment variables");
      return constructedUrl;
    }
    
    // If we get here, we don't have a valid database URL - log for debugging
    console.error("Missing database connection details. Check environment variables.");
    console.error("Available environment variables:", 
      Object.keys(process.env).filter(key => key.startsWith('DB_') || key === 'DATABASE_URL'));
    
    // Return the raw value or empty string (this will cause Prisma to error correctly)
    return process.env.DATABASE_URL || "";
  } catch (error) {
    console.error("Error constructing database URL:", error);
    return "";
  }
}

// PrismaClient wrapper with better connection handling
function createPrismaClient() {
  try {
    // Always ensure DATABASE_URL is set with the latest values
    const connectionString = getDatabaseUrl();
    
    // Validate the connection string
    if (!connectionString || !connectionString.includes('@')) {
      console.error("Invalid database connection string generated");
      throw new Error("Invalid database connection string");
    }
    
    // For debugging - log the connection string (with password hidden)
    const maskedConnectionString = connectionString.replace(/:[^:]*@/, ':***@');
    console.log(`Using connection string: ${maskedConnectionString}`);
    
    // Set the environment variable for Prisma to use
    process.env.DATABASE_URL = connectionString;
    
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error("Failed to create Prisma client:", error);
    // Still return a PrismaClient - it will fail on operations but won't crash the app
    return new PrismaClient();
  }
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
