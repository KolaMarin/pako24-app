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
      
      // Extract host, port, database and SSL mode
      let host = 'unknown';
      let port = 'unknown';
      let database = 'unknown';
      let hasSSL = false;
      
      if (dbUrl.includes('@')) {
        const hostPart = dbUrl.split('@')[1];
        if (hostPart) {
          // Handle port and database path
          const hostPortParts = hostPart.split(':');
          host = hostPortParts[0] || 'unknown';
          
          if (hostPortParts.length > 1) {
            // Extract port and database
            const portDbParts = hostPortParts[1].split('/');
            port = portDbParts[0] || 'unknown';
            
            if (portDbParts.length > 1) {
              // Extract database name and params
              const dbParams = portDbParts[1].split('?');
              database = dbParams[0] || 'unknown';
              hasSSL = dbParams.length > 1 && dbParams[1].includes('sslmode=require');
            }
          }
        }
      }
      
      // Check the URL components individually
      const urlComponents = {
        protocol: dbType,
        hostPresent: host !== 'unknown',
        host: host,
        portPresent: port !== 'unknown',
        port: port,
        databasePresent: database !== 'unknown',
        database: database,
        hasSSL: hasSSL
      };
      
      parsedInfo = {
        dbType,
        hasCredentials,
        urlComponents,
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
  
  // Check individual components availability
  const dbComponents = {
    DB_USER: !!process.env.DB_USER,
    DB_PASSWORD: !!process.env.DB_PASSWORD,
    DB_HOST: !!process.env.DB_HOST,
    DB_PORT: !!process.env.DB_PORT,
    DB_NAME: !!process.env.DB_NAME
  };
  
  // Analyze environment
  const environmentInfo = {
    nodeEnv: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    isAWS: !!process.env.AWS_REGION || !!process.env.AWS_EXECUTION_ENV,
    region: process.env.AWS_REGION || 'unknown'
  };
  
  return NextResponse.json({
    hasDatabase: !!process.env.DATABASE_URL,
    dbUrlStart: process.env.DATABASE_URL ? 
      `${dbUrl.split(':')[0]}://${dbUrl.includes(':') ? '***:***@' : ''}${
        dbUrl.includes('@') ? dbUrl.split('@')[1]?.substring(0, 20) : '...'
      }...` : '',
    nodeEnv: process.env.NODE_ENV,
    dbUrlInfo: parsedInfo,
    dbComponents: dbComponents,
    environment: environmentInfo,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.startsWith('DB_') || 
      key === 'DATABASE_URL' || 
      key.startsWith('AWS_')
    )
  });
}
