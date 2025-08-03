import { NextRequest, NextResponse } from 'next/server'
import { adminAuthMiddleware } from '@/lib/auth'
import { getCacheStats } from '@/lib/cache-cleanup-service'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await adminAuthMiddleware(request)
    if (authResult) {
      return authResult
    }

    // Get cache statistics
    const stats = getCacheStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    )
  }
}