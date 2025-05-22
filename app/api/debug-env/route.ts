import { NextResponse } from 'next/server';

export async function GET() {
  // Safely analyze DATABASE_URL without exposing credentials
  const dbUrl = process.env.DATABASE_URL || '';
  
  // Check if the DATABASE_URL is properly formatted
  const isValidDbUrl = dbUrl.includes('@') && dbUrl.includes(':') && dbUrl.includes('/');
  
  // Parse the URL to get components (without exposing credentials)
  let parsedInfo = {};
  try {
    if (isValidDbUrl) {
      const dbType = dbUrl.split(':')[0] || 'unknown';
      const hasCredentials = dbUrl.includes(':') && dbUrl.split(':').length > 2;
      
      // Extract host
      let host = 'unknown';
      if (dbUrl.includes('@')) {
        const hostPart = dbUrl.split('@')[1];
        if (hostPart && hostPart.includes(':')) {
          host = hostPart.split(':')[0];
        }
      }
      
      parsedInfo = {
        dbType,
        hasCredentials,
        host,
        isWellFormed: true
      };
    } else {
      parsedInfo = {
        isWellFormed: false,
        reason: dbUrl ? 'Malformed URL' : 'Empty URL'
      };
    }
  } catch (error) {
    parsedInfo = {
      isWellFormed: false,
      error: 'Error parsing URL'
    };
  }
  
  return NextResponse.json({
    hasDatabase: !!process.env.DATABASE_URL,
    dbUrlStart: process.env.DATABASE_URL ? 
      `${dbUrl.split(':')[0]}://${dbUrl.includes(':') ? '***:***@' : ''}${
        dbUrl.includes('@') ? dbUrl.split('@')[1]?.substring(0, 20) : '...'
      }...` : '',
    nodeEnv: process.env.NODE_ENV,
    dbUrlInfo: parsedInfo,
    allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('DB_') || key === 'DATABASE_URL')
  });
}
