import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected successfully!',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    });
  } catch (error: any) {
    console.error('Database connection failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}