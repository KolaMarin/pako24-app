import { NextResponse } from 'next/server';
import { prisma, testDatabaseConnection } from '../../../lib/prisma';

export async function GET() {
  try {
    // Test connection using the existing helper function
    const connectionTest = await testDatabaseConnection();
    
    // Get database URL (safely masked)
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedDbUrl = dbUrl.replace(/:[^:]*@/, ':***@');
    
    // Parse connection details safely
    let databaseType = 'unknown';
    let host = 'unknown';
    
    try {
      if (dbUrl) {
        // Extract database type (postgresql, mysql, etc.)
        const parts = dbUrl.split(':');
        databaseType = parts[0] || 'unknown';
        
        // Extract host safely - handle different URL formats
        if (dbUrl.includes('@')) {
          const hostPart = dbUrl.split('@')[1];
          if (hostPart) {
            host = hostPart.split(':')[0] || 'unknown';
          }
        }
      }
    } catch (error) {
      console.error("Error parsing database URL:", error);
    }
    
    // Get details about the connection
    const connectionDetails = {
      databaseType,
      host,
      usedEnvVars: {
        directUrl: !!process.env.DATABASE_URL,
        components: {
          DB_USER: !!process.env.DB_USER,
          DB_PASSWORD: process.env.DB_PASSWORD ? "true" : "false" 
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
