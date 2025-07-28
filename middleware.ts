import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Handle admin authentication first
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for admin token in cookies or headers
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // Verify token (async verification)
      const isValid = await verifyToken(token)
      if (!isValid) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Handle Gemini API mocking (original functionality)
  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.next()
  }

  // Check if mocking is enabled
  const enableMocking = process.env.ENABLE_GEMINI_MOCKING === 'true'
  if (!enableMocking) {
    return NextResponse.next()
  }

  // Intercept any Gemini API call
  const geminiRoutes = [
    '/api/chat',
    '/api/gemini-live',
    '/api/gemini-live-conversation', 
    '/api/analyze-image',
    '/api/analyze-document',
    '/api/analyze-screenshot',
    '/api/video-to-app',
    '/api/lead-research',
    '/api/educational-content',
    '/api/ai-stream',
    '/api/export-summary'
  ]

  const isGeminiRoute = geminiRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isGeminiRoute) {
    // Route to our mock handler
    const mockUrl = request.nextUrl.clone()
    // Remove the /api prefix and add /api/mock prefix
    const pathWithoutApi = request.nextUrl.pathname.replace('/api', '')
    mockUrl.pathname = '/api/mock' + pathWithoutApi
    console.log(`🟠 Mocking Gemini API: ${request.nextUrl.pathname} → ${mockUrl.pathname}`)
    return NextResponse.rewrite(mockUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/:path*'
  ]
}
