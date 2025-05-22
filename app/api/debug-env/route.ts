
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const dbUrl = process.env.DATABASE_URL;
  const maskedUrl = dbUrl ? dbUrl.replace(/:[^:]*@/, ':***@') : 'MISSING';
  
  return NextResponse.json({
    hasDatabase: !!process.env.DATABASE_URL,
    maskedDatabaseUrl: maskedUrl,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    databaseUrlLength: dbUrl?.length || 0
  });
}