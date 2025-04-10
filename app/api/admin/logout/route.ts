import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
    
    // Clear the admin session cookie
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      expires: new Date(0), // Set expiration to the past to delete the cookie
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
