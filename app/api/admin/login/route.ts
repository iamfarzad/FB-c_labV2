import { NextRequest, NextResponse } from "next/server"
import { createToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Check password from environment variable or fallback to default
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Create admin token for the owner
    const ownerEmail = 'farzad@farzadbayat.com'
    const token = await createToken({
      userId: ownerEmail,
      email: ownerEmail,
      role: 'admin'
    })

    // Create HTTP-only cookie for security
    const response = NextResponse.json({
      success: true,
      user: {
        email: ownerEmail,
        role: 'admin'
      }
    })

    // Set secure HTTP-only cookie
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}
