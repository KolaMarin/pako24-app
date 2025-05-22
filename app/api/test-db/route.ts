import { NextResponse } from 'next/server';
import { prisma, testDatabaseConnection } from '../../../lib/prisma';

export async function GET() {
  try {
    // Test connection using the existing helper function
    const connectionTest = await testDatabaseConnection();
    
    // Get database URL (safely masked)
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedDbUrl = dbUrl.replace(/:[^:]*@/, ':***@');
    
    // Get details about the connection
    const connectionDetails = {
      databaseType: dbUrl.split(':')[0],
      host: dbUrl.includes('@') ? dbUrl.split('@')[1]?.split(':')[0] || 'unknown' : 'unknown',
      usedEnvVars: {
        directUrl: !!process.env.DATABASE_URL,
        components: {
          DB_USER: !!process.env.DB_USER,
          DB_PASSWORD: !!process.env.DB_PASSWORD?.substring(0, 1) + '***',
          DB_HOST: process.env.DB_HOST,
          DB_PORT: process.env.DB_PORT,
          DB_NAME: process.env.DB_NAME
        }
      }
    };

    return NextResponse.json({
      success: connectionTest.success,
      connectionDetails,
      maskedDbUrl,
      error: connectionTest.success ? null : connectionTest.error,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error in test-db:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    // Ensure prisma connection is closed
    await prisma.$disconnect();
  }
}
