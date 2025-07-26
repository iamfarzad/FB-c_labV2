import { NextRequest, NextResponse } from 'next/server'

// Only run in development
export function middleware(req: NextRequest) {
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
    req.nextUrl.pathname.startsWith(route)
  )

  if (isGeminiRoute) {
    // Route to our mock handler
    const mockUrl = req.nextUrl.clone()
    // Remove the /api prefix and add /api/mock prefix
    const pathWithoutApi = req.nextUrl.pathname.replace('/api', '')
    mockUrl.pathname = '/api/mock' + pathWithoutApi
    console.log(`🟠 Mocking Gemini API: ${req.nextUrl.pathname} → ${mockUrl.pathname}`)
    return NextResponse.rewrite(mockUrl)
  }

  return NextResponse.next()
}

// Apply to all API routes
export const config = {
  matcher: '/api/:path*',
} 