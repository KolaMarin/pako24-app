import { PrismaClient } from '@prisma/client'

// Function to ensure DATABASE_URL is available in all environments
function getDatabaseUrl() {
  // Debug log environment variables
  console.log("ENV DEBUG: DATABASE_URL available:", !!process.env.DATABASE_URL);
  console.log("ENV DEBUG: DB_USER available:", !!process.env.DB_USER);
  console.log("ENV DEBUG: DB_PASSWORD available:", !!process.env.DB_PASSWORD);
  console.log("ENV DEBUG: DB_HOST available:", !!process.env.DB_HOST);
  console.log("ENV DEBUG: DB_PORT available:", !!process.env.DB_PORT);
  console.log("ENV DEBUG: DB_NAME available:", !!process.env.DB_NAME);
  
  // If DATABASE_URL is directly available, use it
  if (process.env.DATABASE_URL) {
    console.log("ENV DEBUG: Using direct DATABASE_URL");
    return process.env.DATABASE_URL;
  }
  
  // If individual DB parts are available, construct the URL (for AWS Amplify)
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbName = process.env.DB_NAME;
  
  if (dbUser && dbPassword && dbHost && dbPort && dbName) {
    console.log("ENV DEBUG: Constructing DATABASE_URL from components");
    // Need to properly encode characters like ? in the password
    const encodedPassword = encodeURIComponent(dbPassword);
    const url = `postgresql://${dbUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbName}`;
    console.log("ENV DEBUG: Constructed URL (partial):", url.substring(0, 20) + "...");
    process.env.DATABASE_URL = url;
    return url;
  }
  
  // If we get here, we don't have a valid database URL - log for debugging
  console.error("ENV DEBUG: Missing database connection details. Check environment variables.");
  
  // Return the raw value or empty string (this will cause Prisma to error correctly)
  return process.env.DATABASE_URL || "";
}

// Set DATABASE_URL if it's not set but component parts are available
if (!process.env.DATABASE_URL && process.env.DB_USER) {
  console.log("ENV DEBUG: Setting DATABASE_URL from components");
  process.env.DATABASE_URL = getDatabaseUrl();
} else {
  console.log("ENV DEBUG: Not setting DATABASE_URL from components");
  console.log("ENV DEBUG: DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("ENV DEBUG: DB_USER exists:", !!process.env.DB_USER);
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
