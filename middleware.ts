import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Only apply mocking in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.next()
  }

  const enableMocking = process.env.ENABLE_GEMINI_MOCKING === 'true'
  if (!enableMocking) {
    return NextResponse.next()
  }

  // Define Gemini routes that should be mocked
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
    // Check if mock endpoint exists, otherwise redirect to mock/chat as fallback
    const mockUrl = req.nextUrl.clone()
    
    // Map specific routes to existing mock endpoints
    if (req.nextUrl.pathname.startsWith('/api/chat')) {
      mockUrl.pathname = '/api/mock/chat'
    } else if (req.nextUrl.pathname.startsWith('/api/lead-research')) {
      mockUrl.pathname = '/api/mock/lead-research'
    } else {
      // For other routes, use a generic mock endpoint
      mockUrl.pathname = '/api/mock/chat' // Fallback to chat mock
    }
    
    console.log(`🟠 [MIDDLEWARE] Redirecting ${req.nextUrl.pathname} to ${mockUrl.pathname}`)
    
    return NextResponse.rewrite(mockUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/chat/:path*',
    '/api/gemini-live/:path*',
    '/api/gemini-live-conversation/:path*',
    '/api/analyze-image/:path*',
    '/api/analyze-document/:path*',
    '/api/analyze-screenshot/:path*',
    '/api/video-to-app/:path*',
    '/api/lead-research/:path*',
    '/api/educational-content/:path*',
    '/api/ai-stream/:path*',
    '/api/export-summary/:path*'
  ]
}
