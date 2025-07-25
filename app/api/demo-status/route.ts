import { NextRequest, NextResponse } from 'next/server'
import { getDemoSession } from '@/lib/demo-budget-manager'
import { DEMO_LIMITS, FEATURE_BUDGETS } from '@/lib/demo-budget-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const session = await getDemoSession(sessionId)
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Calculate remaining tokens and requests
    const remainingTokens = Math.max(0, DEMO_LIMITS.TOTAL_TOKENS - session.totalTokensUsed)
    const remainingRequests = Math.max(0, DEMO_LIMITS.TOTAL_REQUESTS - session.totalRequestsMade)

    // Calculate feature-specific remaining limits
    const featureUsage = {}
    Object.keys(session.featureUsage).forEach(feature => {
      const featureData = session.featureUsage[feature]
      const featureLimits = FEATURE_BUDGETS[feature as keyof typeof FEATURE_BUDGETS]
      
      if (featureLimits) {
        featureUsage[feature] = {
          tokensUsed: featureData.tokensUsed || 0,
          requestsMade: featureData.requestsMade || 0,
          remainingTokens: Math.max(0, featureLimits.tokens - (featureData.tokensUsed || 0)),
          remainingRequests: Math.max(0, featureLimits.requests - (featureData.requestsMade || 0))
        }
      }
    })

    return NextResponse.json({
      sessionId: session.sessionId,
      totalTokensUsed: session.totalTokensUsed,
      totalRequestsMade: session.totalRequestsMade,
      remainingTokens,
      remainingRequests,
      featureUsage,
      isComplete: session.isComplete,
      completedFeatures: session.completedFeatures,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt
    })

  } catch (error: any) {
    console.error('Demo status error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    }, { status: 500 })
  }
} 