/**
 * Token Usage Logger and Budget Enforcement
 * Tracks AI model usage, costs, and enforces spending limits
 */

import { getSupabase } from './supabase/server'

export interface TokenUsageLog {
  id?: string
  user_id?: string
  session_id?: string
  feature: string
  model: string
  input_tokens: number
  output_tokens: number
  total_tokens?: number // Optional since it's calculated by the database as a generated column
  estimated_cost: number
  success: boolean
  error_message?: string
  usage_metadata?: any
  created_at?: string
}

export interface UserPlanBudget {
  daily_tokens: number
  monthly_tokens: number
  daily_requests: number
  monthly_requests: number
  current_daily_usage: number
  current_monthly_usage: number
  current_daily_requests: number
  current_monthly_requests: number
}

export class TokenUsageLogger {
  private static instance: TokenUsageLogger

  static getInstance(): TokenUsageLogger {
    if (!TokenUsageLogger.instance) {
      TokenUsageLogger.instance = new TokenUsageLogger()
    }
    return TokenUsageLogger.instance
  }

  async logTokenUsage(log: TokenUsageLog): Promise<void> {
    try {
      const supabase = getSupabase()
      
      const { error } = await supabase
        .from('token_usage_logs')
        .insert({
          user_id: log.user_id,
          session_id: log.session_id,
          task_type: log.feature, // Map feature to task_type
          endpoint: `/api/${log.feature}`, // Generate endpoint from feature
          model: log.model,
          input_tokens: log.input_tokens,
          output_tokens: log.output_tokens,
          // total_tokens is now a generated column - don't set it explicitly
          estimated_cost: log.estimated_cost,
          success: log.success,
          error_message: log.error_message,
          created_at: log.created_at || new Date().toISOString()
        })

      if (error) {
        console.error('Failed to log token usage:', error)
      } else {
        console.log(`Token usage logged: ${log.feature} - ${log.total_tokens} tokens - $${log.estimated_cost.toFixed(4)}`)
      }
    } catch (error) {
      console.error('Token usage logging failed:', error)
    }
  }

  async getUserPlanBudget(userId: string): Promise<UserPlanBudget | null> {
    try {
      const supabase = getSupabase()
      
      // Get user's plan (default to demo plan if not found)
      const { data: userPlan } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', userId)
        .single()

      const plan = userPlan || {
        daily_tokens: 50000, // Demo limits
        monthly_tokens: 1000000,
        daily_requests: 50,
        monthly_requests: 1000
      }

      // Get current usage for today
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      const { data: dailyUsage } = await supabase
        .from('token_usage_logs')
        .select('total_tokens')
        .eq('user_id', userId)
        .gte('created_at', startOfDay.toISOString())

      const { data: monthlyUsage } = await supabase
        .from('token_usage_logs')
        .select('total_tokens')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())

      const currentDailyUsage = dailyUsage?.reduce((sum, log) => sum + log.total_tokens, 0) || 0
      const currentMonthlyUsage = monthlyUsage?.reduce((sum, log) => sum + log.total_tokens, 0) || 0

      // Count requests
      const { count: dailyRequests } = await supabase
        .from('token_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfDay.toISOString())

      const { count: monthlyRequests } = await supabase
        .from('token_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())

      return {
        daily_tokens: plan.daily_tokens,
        monthly_tokens: plan.monthly_tokens,
        daily_requests: plan.daily_requests,
        monthly_requests: plan.monthly_requests,
        current_daily_usage: currentDailyUsage,
        current_monthly_usage: currentMonthlyUsage,
        current_daily_requests: dailyRequests || 0,
        current_monthly_requests: monthlyRequests || 0
      }
    } catch (error) {
      console.error('Failed to get user plan budget:', error)
      return null
    }
  }

  async checkUserBudget(userId: string, estimatedTokens: number): Promise<{
    allowed: boolean
    reason?: string
    suggestedModel?: string
    budget: UserPlanBudget | null
  }> {
    const budget = await this.getUserPlanBudget(userId)
    if (!budget) {
      return { allowed: true, budget: null } // Allow if budget check fails
    }

    // Check daily limits
    if (budget.current_daily_usage + estimatedTokens > budget.daily_tokens) {
      return {
        allowed: false,
        reason: `Daily token limit exceeded. Used: ${budget.current_daily_usage}/${budget.daily_tokens}`,
        suggestedModel: 'gemini-2.5-flash-lite', // Suggest cheaper model
        budget
      }
    }

    if (budget.current_daily_requests >= budget.daily_requests) {
      return {
        allowed: false,
        reason: `Daily request limit exceeded. Used: ${budget.current_daily_requests}/${budget.daily_requests}`,
        budget
      }
    }

    // Check monthly limits
    if (budget.current_monthly_usage + estimatedTokens > budget.monthly_tokens) {
      return {
        allowed: false,
        reason: `Monthly token limit exceeded. Used: ${budget.current_monthly_usage}/${budget.monthly_tokens}`,
        suggestedModel: 'gemini-2.5-flash-lite',
        budget
      }
    }

    if (budget.current_monthly_requests >= budget.monthly_requests) {
      return {
        allowed: false,
        reason: `Monthly request limit exceeded. Used: ${budget.current_monthly_requests}/${budget.monthly_requests}`,
        budget
      }
    }

    return { allowed: true, budget }
  }

  async enforceBudgetAndLog(
    userId: string | undefined,
    sessionId: string | undefined,
    feature: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    success: boolean = true,
    errorMessage?: string,
    usageMetadata?: any
  ): Promise<{
    allowed: boolean
    reason?: string
    suggestedModel?: string
  }> {
    const totalTokens = inputTokens + outputTokens
    const estimatedCost = this.calculateCost(model, totalTokens)

    // Check user budget if user is authenticated
    if (userId) {
      const budgetCheck = await this.checkUserBudget(userId, totalTokens)
      if (!budgetCheck.allowed) {
            // Log the blocked request
    await this.logTokenUsage({
      user_id: userId,
      session_id: sessionId,
      feature,
      model,
      input_tokens: Math.round(inputTokens),
      output_tokens: Math.round(outputTokens),
      total_tokens: Math.round(totalTokens),
      estimated_cost: estimatedCost,
      success: false,
      error_message: `Budget exceeded: ${budgetCheck.reason}`,
      usage_metadata: usageMetadata
    })
        
        return budgetCheck
      }
    }

    // Log the successful request
    await this.logTokenUsage({
      user_id: userId,
      session_id: sessionId,
      feature,
      model,
      input_tokens: Math.round(inputTokens),
      output_tokens: Math.round(outputTokens),
      total_tokens: Math.round(totalTokens),
      estimated_cost: estimatedCost,
      success,
      error_message: errorMessage,
      usage_metadata: usageMetadata
    })

    return { allowed: true }
  }

  private calculateCost(model: string, totalTokens: number): number {
    // Cost per 1M tokens (approximate)
    const costs: Record<string, number> = {
      'gemini-2.5-flash': 0.075, // $0.075 per 1M tokens
      'gemini-2.5-flash-lite': 0.025, // $0.025 per 1M tokens
      'gemini-1.5-flash': 0.075,
      'gemini-1.5-pro': 0.375,
      'gemini-1.0-pro': 0.5
    }

    const costPerMillion = costs[model] || costs['gemini-2.5-flash-lite']
    return (totalTokens / 1000000) * costPerMillion
  }

  async getUsageStats(userId?: string, sessionId?: string, timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    totalTokens: number
    totalCost: number
    totalRequests: number
    featureBreakdown: Record<string, { tokens: number; cost: number; requests: number }>
  }> {
    try {
      const supabase = getSupabase()
      
      const now = new Date()
      let startDate: Date
      
      switch (timeframe) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
      }

      let query = supabase
        .from('token_usage_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())

      if (userId) {
        query = query.eq('user_id', userId)
      } else if (sessionId) {
        query = query.eq('session_id', sessionId)
      }

      const { data: logs } = await query

      if (!logs) {
        return {
          totalTokens: 0,
          totalCost: 0,
          totalRequests: 0,
          featureBreakdown: {}
        }
      }

      const featureBreakdown: Record<string, { tokens: number; cost: number; requests: number }> = {}
      let totalTokens = 0
      let totalCost = 0

      logs.forEach(log => {
        totalTokens += log.total_tokens
        totalCost += log.estimated_cost

        const feature = log.task_type || 'unknown' // Use task_type instead of feature

        if (!featureBreakdown[feature]) {
          featureBreakdown[feature] = { tokens: 0, cost: 0, requests: 0 }
        }

        featureBreakdown[feature].tokens += log.total_tokens
        featureBreakdown[feature].cost += log.estimated_cost
        featureBreakdown[feature].requests += 1
      })

      return {
        totalTokens,
        totalCost,
        totalRequests: logs.length,
        featureBreakdown
      }
    } catch (error) {
      console.error('Failed to get usage stats:', error)
      return {
        totalTokens: 0,
        totalCost: 0,
        totalRequests: 0,
        featureBreakdown: {}
      }
    }
  }
}

// Convenience functions
export const logTokenUsage = (log: TokenUsageLog) => {
  return TokenUsageLogger.getInstance().logTokenUsage(log)
}

export const checkBudget = (userId: string, estimatedTokens: number) => {
  return TokenUsageLogger.getInstance().checkUserBudget(userId, estimatedTokens)
}

export const enforceBudgetAndLog = (
  userId: string | undefined,
  sessionId: string | undefined,
  feature: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  success?: boolean,
  errorMessage?: string,
  usageMetadata?: any
) => {
  return TokenUsageLogger.getInstance().enforceBudgetAndLog(
    userId, sessionId, feature, model, inputTokens, outputTokens, success, errorMessage, usageMetadata
  )
}

export const getUsageStats = (userId?: string, sessionId?: string, timeframe?: 'day' | 'week' | 'month') => {
  return TokenUsageLogger.getInstance().getUsageStats(userId, sessionId, timeframe)
}
