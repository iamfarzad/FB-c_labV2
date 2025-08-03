import { NextRequest, NextResponse } from 'next/server'
import { adminAuthMiddleware } from '@/lib/auth'
import { performCacheCleanup } from '@/lib/cache-cleanup-service'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await adminAuthMiddleware(request)
    if (authResult) {
      return authResult
    }

    // Perform cache cleanup
    performCacheCleanup()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache cleanup completed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cache cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to perform cache cleanup' },
      { status: 500 }
    )
  }
}