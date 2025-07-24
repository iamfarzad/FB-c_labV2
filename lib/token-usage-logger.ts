/**
 * Token Usage Logger and Budget Enforcement
 * Tracks AI model usage, costs, and enforces spending limits
 */

import { getSupabase } from './supabase/server'
import { ModelSelector, estimateTokens, estimateCost } from './model-selector'

export interface TokenUsageLog {
  id?: string
  user_id?: string
  session_id?: string
  model: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  estimated_cost: number
  task_type: string
  endpoint: string
  success: boolean
  error_message?: string
  created_at?: string
}

export interface BudgetConfig {
  daily_limit: number
  monthly_limit: number
  per_request_limit: number
  user_plan: 'free' | 'basic' | 'premium'
}

export class TokenUsageLogger {
  private static instance: TokenUsageLogger
  private modelSelector: ModelSelector
  private dailyUsageCache: Map<string, number> = new Map()

  private constructor() {
    this.modelSelector = ModelSelector.getInstance()
  }

  static getInstance(): TokenUsageLogger {
    if (!TokenUsageLogger.instance) {
      TokenUsageLogger.instance = new TokenUsageLogger()
    }
    return TokenUsageLogger.instance
  }

  async logUsage(usage: Omit<TokenUsageLog, 'id' | 'created_at'>): Promise<void> {
    try {
      const supabase = getSupabase()
      
      // Calculate total tokens and cost
      const totalTokens = usage.input_tokens + usage.output_tokens
      const cost = estimateCost(usage.model, usage.input_tokens, usage.output_tokens)
      
      const logEntry: TokenUsageLog = {
        ...usage,
        total_tokens: totalTokens,
        estimated_cost: cost,
        created_at: new Date().toISOString()
      }

      // Insert into database
      const { error } = await supabase
        .from('token_usage_logs')
        .insert(logEntry)

      if (error) {
        console.error('Failed to log token usage:', error)
      } else {
        // Update cache
        const key = `${usage.user_id || 'anonymous'}-${new Date().toISOString().split('T')[0]}`
        const currentUsage = this.dailyUsageCache.get(key) || 0
        this.dailyUsageCache.set(key, currentUsage + totalTokens)
        
        console.log(`Token usage logged: ${totalTokens} tokens, $${cost.toFixed(4)} cost`)
      }
    } catch (error) {
      console.error('Token usage logging failed:', error)
    }
  }

  async checkBudget(userId: string, estimatedTokens: number, model: string): Promise<{
    allowed: boolean
    reason?: string
    currentUsage: number
    limit: number
  }> {
    try {
      const supabase = getSupabase()
      
      // Get user's budget configuration
      const { data: userConfig } = await supabase
        .from('user_budgets')
        .select('*')
        .eq('user_id', userId)
        .single()

      const budget: BudgetConfig = userConfig || {
        daily_limit: 100000, // 100k tokens per day for free users
        monthly_limit: 1000000, // 1M tokens per month
        per_request_limit: 10000, // 10k tokens per request
        user_plan: 'free'
      }

      // Check per-request limit
      if (estimatedTokens > budget.per_request_limit) {
        return {
          allowed: false,
          reason: `Request too large: ${estimatedTokens} tokens exceeds limit of ${budget.per_request_limit}`,
          currentUsage: 0,
          limit: budget.per_request_limit
        }
      }

      // Check daily usage
      const today = new Date().toISOString().split('T')[0]
      const { data: dailyUsage } = await supabase
        .from('token_usage_logs')
        .select('total_tokens')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)

      const currentDailyUsage = dailyUsage?.reduce((sum, log) => sum + log.total_tokens, 0) || 0
      const estimatedCost = estimateCost(model, estimatedTokens, estimatedTokens * 0.5) // Assume 50% output ratio

      if (currentDailyUsage + estimatedTokens > budget.daily_limit) {
        return {
          allowed: false,
          reason: `Daily limit exceeded: ${currentDailyUsage + estimatedTokens} tokens exceeds ${budget.daily_limit}`,
          currentUsage: currentDailyUsage,
          limit: budget.daily_limit
        }
      }

      return {
        allowed: true,
        currentUsage: currentDailyUsage,
        limit: budget.daily_limit
      }
    } catch (error) {
      console.error('Budget check failed:', error)
      // Allow request if budget check fails
      return {
        allowed: true,
        currentUsage: 0,
        limit: 100000
      }
    }
  }

  async getUsageStats(userId?: string, days: number = 30): Promise<{
    totalTokens: number
    totalCost: number
    dailyBreakdown: Array<{ date: string; tokens: number; cost: number }>
    modelBreakdown: Array<{ model: string; tokens: number; cost: number }>
  }> {
    try {
      const supabase = getSupabase()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      let query = supabase
        .from('token_usage_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: logs } = await query

      if (!logs) {
        return {
          totalTokens: 0,
          totalCost: 0,
          dailyBreakdown: [],
          modelBreakdown: []
        }
      }

      // Calculate totals
      const totalTokens = logs.reduce((sum, log) => sum + log.total_tokens, 0)
      const totalCost = logs.reduce((sum, log) => sum + log.estimated_cost, 0)

      // Daily breakdown
      const dailyMap = new Map<string, { tokens: number; cost: number }>()
      logs.forEach(log => {
        const date = log.created_at?.split('T')[0] || 'unknown'
        const current = dailyMap.get(date) || { tokens: 0, cost: 0 }
        dailyMap.set(date, {
          tokens: current.tokens + log.total_tokens,
          cost: current.cost + log.estimated_cost
        })
      })

      const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, stats]) => ({
        date,
        ...stats
      })).sort((a, b) => a.date.localeCompare(b.date))

      // Model breakdown
      const modelMap = new Map<string, { tokens: number; cost: number }>()
      logs.forEach(log => {
        const current = modelMap.get(log.model) || { tokens: 0, cost: 0 }
        modelMap.set(log.model, {
          tokens: current.tokens + log.total_tokens,
          cost: current.cost + log.estimated_cost
        })
      })

      const modelBreakdown = Array.from(modelMap.entries()).map(([model, stats]) => ({
        model,
        ...stats
      })).sort((a, b) => b.tokens - a.tokens)

      return {
        totalTokens,
        totalCost,
        dailyBreakdown,
        modelBreakdown
      }
    } catch (error) {
      console.error('Failed to get usage stats:', error)
      return {
        totalTokens: 0,
        totalCost: 0,
        dailyBreakdown: [],
        modelBreakdown: []
      }
    }
  }

  async enforceBudget(userId: string, prompt: string, model: string): Promise<{
    allowed: boolean
    reason?: string
    suggestedModel?: string
  }> {
    const estimatedTokens = estimateTokens(prompt)
    
    const budgetCheck = await this.checkBudget(userId, estimatedTokens, model)
    
    if (!budgetCheck.allowed) {
      // Suggest lite model if budget exceeded
      const suggestedModel = model.includes('flash-lite') ? model : 'gemini-2.5-flash-lite'
      return {
        allowed: false,
        reason: budgetCheck.reason,
        suggestedModel
      }
    }

    return { allowed: true }
  }

  // Utility method to estimate cost before making API call
  estimateRequestCost(prompt: string, model: string, expectedResponseLength: number = 1000): number {
    const inputTokens = estimateTokens(prompt)
    const outputTokens = estimateTokens('x'.repeat(expectedResponseLength))
    return estimateCost(model, inputTokens, outputTokens)
  }
}

// Convenience functions
export const logTokenUsage = async (usage: Omit<TokenUsageLog, 'id' | 'created_at'>): Promise<void> => {
  return TokenUsageLogger.getInstance().logUsage(usage)
}

export const checkBudget = async (userId: string, estimatedTokens: number, model: string) => {
  return TokenUsageLogger.getInstance().checkBudget(userId, estimatedTokens, model)
}

export const getUsageStats = async (userId?: string, days: number = 30) => {
  return TokenUsageLogger.getInstance().getUsageStats(userId, days)
} 