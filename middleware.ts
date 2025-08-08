import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Create response
  let response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), display-capture=(self), geolocation=(), payment=()')
  
  // Content Security Policy
  const isDev = process.env.NODE_ENV === 'development'
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' https: https://generativelanguage.googleapis.com https://*.googleapis.com ` +
    (isDev ? 'wss://localhost:3001 ws://localhost:3001 ws://localhost:8787 ' : '') +
    "wss://fb-consulting-websocket.fly.dev wss:",
    "media-src 'self' blob: data: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  // Only apply mocking in development
  if (process.env.NODE_ENV !== 'development') {
    return response
  }

  const enableMocking = process.env.ENABLE_GEMINI_MOCKING === 'true'
  if (!enableMocking) {
    return response
  }

  // Define Gemini routes that should be mocked
  const geminiRoutes = [
    '/api/chat',
    '/api/gemini-live',
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

  return response
}

export const config = {
  matcher: [
    // Apply security headers to all routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Specific API routes for mocking
    '/api/chat/:path*',
    '/api/gemini-live/:path*',
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
