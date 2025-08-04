import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })

    // Clear the admin token cookie
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire the cookie
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    )
  }
}