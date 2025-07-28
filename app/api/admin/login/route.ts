import { NextRequest, NextResponse } from "next/server"
import { createToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Only allow the owner to log in
    if (email !== 'farzad@farzadbayat.com') {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Check password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is required');
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }
    
    console.log('Debug - Admin password from env:', adminPassword)
    console.log('Debug - Provided password:', password)
    console.log('Debug - Passwords match:', password === adminPassword)
    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Create admin token
    const token = await createToken({
      userId: email,
      email: email,
      role: 'admin'
    })

    // Create HTTP-only cookie for security
    const response = NextResponse.json({
      success: true,
      user: {
        email,
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
