import { getSupabase } from './supabase/server'

/**
 * Demo Budget Manager
 * Manages per-feature and per-session budgets for curated demo experience
 */

export type DemoFeature = 
  | 'chat' 
  | 'voice_tts' 
  | 'webcam_analysis' 
  | 'screenshot_analysis' 
  | 'document_analysis' 
  | 'video_to_app' 
  | 'lead_research'

export interface DemoBudget {
  sessionId: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  expiresAt: string
  totalTokensUsed: number
  totalRequestsMade: number
  featureUsage: Record<DemoFeature, {
    tokensUsed: number
    requestsMade: number
  }>
  isComplete: boolean
  completedFeatures: DemoFeature[]
}

export interface DemoAccessResult {
  allowed: boolean
  reason?: string
  remainingTokens: number
  remainingRequests: number
  featureRemainingTokens: number
  featureRemainingRequests: number
}

// Feature-specific budgets
export const FEATURE_BUDGETS: Record<DemoFeature, { tokens: number; requests: number }> = {
  chat: { tokens: 10000, requests: 10 },
  voice_tts: { tokens: 5000, requests: 5 },
  webcam_analysis: { tokens: 5000, requests: 3 },
  screenshot_analysis: { tokens: 5000, requests: 3 },
  document_analysis: { tokens: 10000, requests: 2 },
  video_to_app: { tokens: 15000, requests: 1 },
  lead_research: { tokens: 10000, requests: 2 }
}

// Overall session limits
export const DEMO_LIMITS = {
  SESSION_DURATION_HOURS: 24,
  TOTAL_TOKENS: 50000,
  TOTAL_REQUESTS: 50
}

export class DemoBudgetManager {
  private sessionCache = new Map<string, DemoBudget>()

  async getOrCreateSession(sessionId?: string, ipAddress?: string, userAgent?: string): Promise<DemoBudget> {
    const id = sessionId || this.generateSessionId()
    
    // Check cache first
    if (this.sessionCache.has(id)) {
      const session = this.sessionCache.get(id)!
      if (new Date() < new Date(session.expiresAt)) {
        return session
      } else {
        // Session expired, remove from cache
        this.sessionCache.delete(id)
      }
    }

    // Try to load from database
    try {
      const supabase = getSupabase()
      const { data: existingSession } = await supabase
        .from('demo_sessions')
        .select('*')
        .eq('session_id', id)
        .single()

      if (existingSession && new Date(existingSession.expires_at) > new Date()) {
        const session: DemoBudget = {
          sessionId: existingSession.session_id,
          ipAddress: existingSession.ip_address,
          userAgent: existingSession.user_agent,
          createdAt: existingSession.created_at,
          expiresAt: existingSession.expires_at,
          totalTokensUsed: existingSession.total_tokens_used || 0,
          totalRequestsMade: existingSession.total_requests_made || 0,
          featureUsage: existingSession.feature_usage || Object.keys(FEATURE_BUDGETS).reduce((acc, feature) => {
            acc[feature as DemoFeature] = { tokensUsed: 0, requestsMade: 0 }
            return acc
          }, {} as Record<DemoFeature, { tokensUsed: number; requestsMade: number }>),
          isComplete: existingSession.is_complete || false,
          completedFeatures: existingSession.completed_features || []
        }
        
        this.sessionCache.set(id, session)
        return session
      }
    } catch (error) {
      console.warn('Failed to load session from database:', error)
    }

    // Create new session
    const now = new Date()
    const expiresAt = new Date(now.getTime() + DEMO_LIMITS.SESSION_DURATION_HOURS * 60 * 60 * 1000)
    
    const newSession: DemoBudget = {
      sessionId: id,
      ipAddress,
      userAgent,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      totalTokensUsed: 0,
      totalRequestsMade: 0,
      featureUsage: Object.keys(FEATURE_BUDGETS).reduce((acc, feature) => {
        acc[feature as DemoFeature] = { tokensUsed: 0, requestsMade: 0 }
        return acc
      }, {} as Record<DemoFeature, { tokensUsed: number; requestsMade: number }>),
      isComplete: false,
      completedFeatures: []
    }

    // Save to database
    try {
      const supabase = getSupabase()
      await supabase.from('demo_sessions').insert({
        session_id: id,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: newSession.createdAt,
        expires_at: newSession.expiresAt,
        total_tokens_used: 0,
        total_requests_made: 0,
        feature_usage: newSession.featureUsage,
        is_complete: false,
        completed_features: []
      })
    } catch (error) {
      console.warn('Failed to save session to database:', error)
    }

    this.sessionCache.set(id, newSession)
    return newSession
  }

  async checkDemoAccess(sessionId: string, feature: DemoFeature, estimatedTokens: number): Promise<DemoAccessResult> {
    const session = await this.getOrCreateSession(sessionId)
    
    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      return {
        allowed: false,
        reason: 'Demo session expired. Please start a new session.',
        remainingTokens: 0,
        remainingRequests: 0,
        featureRemainingTokens: 0,
        featureRemainingRequests: 0
      }
    }

    // Check overall session limits
    if (session.totalTokensUsed + estimatedTokens > DEMO_LIMITS.TOTAL_TOKENS) {
      return {
        allowed: false,
        reason: `Demo session token limit reached (${DEMO_LIMITS.TOTAL_TOKENS} tokens). Please start a new session.`,
        remainingTokens: Math.max(0, DEMO_LIMITS.TOTAL_TOKENS - session.totalTokensUsed),
        remainingRequests: Math.max(0, DEMO_LIMITS.TOTAL_REQUESTS - session.totalRequestsMade),
        featureRemainingTokens: 0,
        featureRemainingRequests: 0
      }
    }

    if (session.totalRequestsMade >= DEMO_LIMITS.TOTAL_REQUESTS) {
      return {
        allowed: false,
        reason: `Demo session request limit reached (${DEMO_LIMITS.TOTAL_REQUESTS} requests). Please start a new session.`,
        remainingTokens: Math.max(0, DEMO_LIMITS.TOTAL_TOKENS - session.totalTokensUsed),
        remainingRequests: 0,
        featureRemainingTokens: 0,
        featureRemainingRequests: 0
      }
    }

    // Check feature-specific limits
    const featureBudget = FEATURE_BUDGETS[feature]
    const featureUsage = session.featureUsage[feature]
    
    if (featureUsage.tokensUsed + estimatedTokens > featureBudget.tokens) {
      return {
        allowed: false,
        reason: `${feature} token limit reached (${featureBudget.tokens} tokens). Try a different feature.`,
        remainingTokens: Math.max(0, DEMO_LIMITS.TOTAL_TOKENS - session.totalTokensUsed),
        remainingRequests: Math.max(0, DEMO_LIMITS.TOTAL_REQUESTS - session.totalRequestsMade),
        featureRemainingTokens: 0,
        featureRemainingRequests: Math.max(0, featureBudget.requests - featureUsage.requestsMade)
      }
    }

    if (featureUsage.requestsMade >= featureBudget.requests) {
      return {
        allowed: false,
        reason: `${feature} request limit reached (${featureBudget.requests} requests). Try a different feature.`,
        remainingTokens: Math.max(0, DEMO_LIMITS.TOTAL_TOKENS - session.totalTokensUsed),
        remainingRequests: Math.max(0, DEMO_LIMITS.TOTAL_REQUESTS - session.totalRequestsMade),
        featureRemainingTokens: Math.max(0, featureBudget.tokens - featureUsage.tokensUsed),
        featureRemainingRequests: 0
      }
    }

    return {
      allowed: true,
      remainingTokens: Math.max(0, DEMO_LIMITS.TOTAL_TOKENS - session.totalTokensUsed),
      remainingRequests: Math.max(0, DEMO_LIMITS.TOTAL_REQUESTS - session.totalRequestsMade),
      featureRemainingTokens: Math.max(0, featureBudget.tokens - featureUsage.tokensUsed),
      featureRemainingRequests: Math.max(0, featureBudget.requests - featureUsage.requestsMade)
    }
  }

  async recordDemoUsage(sessionId: string, feature: DemoFeature, tokensUsed: number, requestsMade: number = 1): Promise<void> {
    const session = await this.getOrCreateSession(sessionId)
    
    // Update session
    session.totalTokensUsed += tokensUsed
    session.totalRequestsMade += requestsMade
    session.featureUsage[feature].tokensUsed += tokensUsed
    session.featureUsage[feature].requestsMade += requestsMade

    // Check if feature is completed
    const featureBudget = FEATURE_BUDGETS[feature]
    if (session.featureUsage[feature].tokensUsed >= featureBudget.tokens * 0.8 || 
        session.featureUsage[feature].requestsMade >= featureBudget.requests) {
      if (!session.completedFeatures.includes(feature)) {
        session.completedFeatures.push(feature)
      }
    }

    // Check if session is complete
    if (session.completedFeatures.length >= 3 || 
        session.totalTokensUsed >= DEMO_LIMITS.TOTAL_TOKENS * 0.8) {
      session.isComplete = true
    }

    // Update cache
    this.sessionCache.set(sessionId, session)

    // Persist to database
    try {
      const supabase = getSupabase()
      await supabase
        .from('demo_sessions')
        .update({
          total_tokens_used: session.totalTokensUsed,
          total_requests_made: session.totalRequestsMade,
          feature_usage: session.featureUsage,
          is_complete: session.isComplete,
          completed_features: session.completedFeatures,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
    } catch (error) {
      console.error('Failed to update session in database:', error)
    }
  }

  async getDemoStatus(sessionId: string): Promise<DemoBudget | null> {
    try {
      const session = await this.getOrCreateSession(sessionId)
      return session
    } catch (error) {
      console.error('Failed to get demo status:', error)
      return null
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 18)
  }
}

// Singleton instance
const demoBudgetManager = new DemoBudgetManager()

export async function checkDemoAccess(sessionId: string, feature: DemoFeature, estimatedTokens: number): Promise<DemoAccessResult> {
  return demoBudgetManager.checkDemoAccess(sessionId, feature, estimatedTokens)
}

export async function recordDemoUsage(sessionId: string, feature: DemoFeature, tokensUsed: number, requestsMade?: number): Promise<void> {
  return demoBudgetManager.recordDemoUsage(sessionId, feature, tokensUsed, requestsMade)
}

export async function getDemoSession(sessionId: string): Promise<DemoBudget | null> {
  return demoBudgetManager.getDemoStatus(sessionId)
} 