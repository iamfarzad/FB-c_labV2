/**
 * Demo Budget Manager
 * Manages per-feature and per-session budgets for curated demo experience
 */

export interface DemoBudget {
  sessionId: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  expiresAt: string
  totalTokensUsed: number
  featureUsage: Record<DemoFeature, number>
  isComplete: boolean
  completedFeatures: DemoFeature[]
}

export type DemoFeature = 
  | 'chat' 
  | 'voice_tts' 
  | 'webcam_analysis' 
  | 'screenshot_analysis' 
  | 'document_analysis' 
  | 'video_to_app' 
  | 'lead_research'

export interface FeatureBudget {
  maxTokens: number
  maxRequests: number
  model: string
  description: string
}

export const FEATURE_BUDGETS: Record<DemoFeature, FeatureBudget> = {
  chat: {
    maxTokens: 10000,
    maxRequests: 10,
    model: 'gemini-2.5-flash-lite',
    description: 'Interactive chat conversations'
  },
  voice_tts: {
    maxTokens: 5000,
    maxRequests: 5,
    model: 'gemini-2.5-flash-preview-tts',
    description: 'Text-to-speech generation'
  },
  webcam_analysis: {
    maxTokens: 5000,
    maxRequests: 3,
    model: 'gemini-2.5-flash-lite',
    description: 'Webcam image analysis'
  },
  screenshot_analysis: {
    maxTokens: 5000,
    maxRequests: 3,
    model: 'gemini-2.5-flash-lite',
    description: 'Screenshot analysis'
  },
  document_analysis: {
    maxTokens: 10000,
    maxRequests: 2,
    model: 'gemini-2.5-flash-lite',
    description: 'Document processing and analysis'
  },
  video_to_app: {
    maxTokens: 15000,
    maxRequests: 1,
    model: 'gemini-2.5-flash',
    description: 'Video to learning app generation'
  },
  lead_research: {
    maxTokens: 10000,
    maxRequests: 2,
    model: 'gemini-2.5-flash',
    description: 'Lead research with web search'
  }
}

export const DEMO_LIMITS = {
  SESSION_DURATION_HOURS: 24,
  TOTAL_SESSION_TOKENS: 50000,
  PER_REQUEST_MAX_TOKENS: 5000,
  SESSION_ID_LENGTH: 16
}

export class DemoBudgetManager {
  private static instance: DemoBudgetManager
  private sessionCache: Map<string, DemoBudget> = new Map()

  static getInstance(): DemoBudgetManager {
    if (!DemoBudgetManager.instance) {
      DemoBudgetManager.instance = new DemoBudgetManager()
    }
    return DemoBudgetManager.instance
  }

  generateSessionId(): string {
    return Math.random().toString(36).substring(2, 2 + DEMO_LIMITS.SESSION_ID_LENGTH)
  }

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
      featureUsage: Object.keys(FEATURE_BUDGETS).reduce((acc, feature) => {
        acc[feature as DemoFeature] = 0
        return acc
      }, {} as Record<DemoFeature, number>),
      isComplete: false,
      completedFeatures: []
    }

    this.sessionCache.set(id, newSession)
    return newSession
  }

  async checkFeatureAccess(sessionId: string, feature: DemoFeature, estimatedTokens: number): Promise<{
    allowed: boolean
    reason?: string
    remainingTokens: number
    remainingRequests: number
    suggestedModel?: string
  }> {
    const session = await this.getOrCreateSession(sessionId)
    
    if (session.isComplete) {
      return {
        allowed: false,
        reason: 'Demo session complete. Please schedule a call to continue.',
        remainingTokens: 0,
        remainingRequests: 0
      }
    }

    // Check per-request limit
    if (estimatedTokens > DEMO_LIMITS.PER_REQUEST_MAX_TOKENS) {
      return {
        allowed: false,
        reason: `Request too large: ${estimatedTokens} tokens exceeds limit of ${DEMO_LIMITS.PER_REQUEST_MAX_TOKENS}`,
        remainingTokens: FEATURE_BUDGETS[feature].maxTokens - session.featureUsage[feature],
        remainingRequests: FEATURE_BUDGETS[feature].maxRequests - Math.floor(session.featureUsage[feature] / 1000)
      }
    }

    // Check feature budget
    const featureBudget = FEATURE_BUDGETS[feature]
    const currentUsage = session.featureUsage[feature]
    
    if (currentUsage + estimatedTokens > featureBudget.maxTokens) {
      return {
        allowed: false,
        reason: `Feature budget exceeded: ${currentUsage + estimatedTokens} tokens exceeds ${featureBudget.maxTokens} limit`,
        remainingTokens: 0,
        remainingRequests: 0
      }
    }

    // Check total session budget
    if (session.totalTokensUsed + estimatedTokens > DEMO_LIMITS.TOTAL_SESSION_TOKENS) {
      return {
        allowed: false,
        reason: `Session budget exceeded: ${session.totalTokensUsed + estimatedTokens} tokens exceeds ${DEMO_LIMITS.TOTAL_SESSION_TOKENS} limit`,
        remainingTokens: 0,
        remainingRequests: 0
      }
    }

    return {
      allowed: true,
      remainingTokens: featureBudget.maxTokens - currentUsage,
      remainingRequests: featureBudget.maxRequests - Math.floor(currentUsage / 1000)
    }
  }

  async recordUsage(sessionId: string, feature: DemoFeature, actualTokens: number, success: boolean = true): Promise<void> {
    const session = await this.getOrCreateSession(sessionId)
    
    // Update usage
    session.featureUsage[feature] += actualTokens
    session.totalTokensUsed += actualTokens

    // Check if feature is complete
    const featureBudget = FEATURE_BUDGETS[feature]
    if (session.featureUsage[feature] >= featureBudget.maxTokens && !session.completedFeatures.includes(feature)) {
      session.completedFeatures.push(feature)
    }

    // Check if session is complete
    if (session.totalTokensUsed >= DEMO_LIMITS.TOTAL_SESSION_TOKENS || 
        session.completedFeatures.length >= Object.keys(FEATURE_BUDGETS).length) {
      session.isComplete = true
    }

    // Update cache
    this.sessionCache.set(sessionId, session)

    // Log to database
    await this.logUsage(session, feature, actualTokens, success)
  }

  async getSessionStatus(sessionId: string): Promise<{
    session: DemoBudget
    featureStatus: Record<DemoFeature, {
      used: number
      remaining: number
      maxTokens: number
      isComplete: boolean
    }>
    overallProgress: number
    isComplete: boolean
  }> {
    const session = await this.getOrCreateSession(sessionId)
    
    const featureStatus = Object.keys(FEATURE_BUDGETS).reduce((acc, feature) => {
      const featureKey = feature as DemoFeature
      const budget = FEATURE_BUDGETS[featureKey]
      const used = session.featureUsage[featureKey]
      
      acc[featureKey] = {
        used,
        remaining: Math.max(0, budget.maxTokens - used),
        maxTokens: budget.maxTokens,
        isComplete: used >= budget.maxTokens
      }
      return acc
    }, {} as Record<DemoFeature, any>)

    const totalFeatures = Object.keys(FEATURE_BUDGETS).length
    const completedFeatures = session.completedFeatures.length
    const overallProgress = Math.round((completedFeatures / totalFeatures) * 100)

    return {
      session,
      featureStatus,
      overallProgress,
      isComplete: session.isComplete
    }
  }

  async getDemoCompletionMessage(sessionId: string): Promise<string> {
    const status = await this.getSessionStatus(sessionId)
    
    if (status.isComplete) {
      return `🎉 Demo Complete! You've explored all our AI capabilities. Ready to see how this can transform your business? Schedule a consultation to discuss your specific needs and get a custom implementation plan.`
    }

    const remainingFeatures = Object.keys(FEATURE_BUDGETS).filter(feature => 
      !status.featureStatus[feature as DemoFeature].isComplete
    )

    return `Great progress! You've completed ${status.overallProgress}% of the demo. Try out: ${remainingFeatures.slice(0, 3).join(', ')}.`
  }

  private async logUsage(session: DemoBudget, feature: DemoFeature, tokens: number, success: boolean): Promise<void> {
    try {
      // This would log to your token_usage_logs table
      // For now, we'll just console.log
      console.log(`Demo Usage: Session ${session.sessionId}, Feature ${feature}, Tokens ${tokens}, Success ${success}`)
    } catch (error) {
      console.error('Failed to log demo usage:', error)
    }
  }

  // Utility method to get appropriate model for feature
  getModelForFeature(feature: DemoFeature): string {
    return FEATURE_BUDGETS[feature].model
  }

  // Check if session should be upgraded to full model
  shouldUseFullModel(sessionId: string, feature: DemoFeature): boolean {
    const session = this.sessionCache.get(sessionId)
    if (!session) return false

    // Use full model for video_to_app and lead_research regardless of budget
    if (feature === 'video_to_app' || feature === 'lead_research') {
      return true
    }

    // Use full model if user has completed most features
    if (session.completedFeatures.length >= Object.keys(FEATURE_BUDGETS).length - 2) {
      return true
    }

    return false
  }
}

// Convenience functions
export const getDemoSession = (sessionId?: string, ipAddress?: string, userAgent?: string) => {
  return DemoBudgetManager.getInstance().getOrCreateSession(sessionId, ipAddress, userAgent)
}

export const checkDemoAccess = (sessionId: string, feature: DemoFeature, estimatedTokens: number) => {
  return DemoBudgetManager.getInstance().checkFeatureAccess(sessionId, feature, estimatedTokens)
}

export const recordDemoUsage = (sessionId: string, feature: DemoFeature, actualTokens: number, success?: boolean) => {
  return DemoBudgetManager.getInstance().recordUsage(sessionId, feature, actualTokens, success)
}

export const getDemoStatus = (sessionId: string) => {
  return DemoBudgetManager.getInstance().getSessionStatus(sessionId)
} 