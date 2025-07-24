/**
 * Dynamic Model Selector for Cost Optimization
 * Chooses the most appropriate Gemini model based on task requirements and cost constraints
 */

export interface ModelSelectionCriteria {
  taskType: 'chat' | 'research' | 'analysis' | 'generation' | 'multimodal' | 'voice'
  complexity: 'simple' | 'moderate' | 'complex'
  requiresWebSearch?: boolean
  requiresMultimodal?: boolean
  requiresRealTime?: boolean
  userPlan?: 'free' | 'basic' | 'premium'
  estimatedTokens?: number
  budget?: number
}

export interface ModelConfig {
  name: string
  costPer1MTokens: number
  capabilities: {
    text: boolean
    webSearch: boolean
    multimodal: boolean
    realTime: boolean
    reasoning: 'basic' | 'good' | 'excellent'
  }
  maxTokens: number
  recommendedFor: string[]
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gemini-2.5-flash-lite': {
    name: 'gemini-2.5-flash-lite',
    costPer1MTokens: 0.40,
    capabilities: {
      text: true,
      webSearch: true,
      multimodal: true,
      realTime: false,
      reasoning: 'good'
    },
    maxTokens: 8192,
    recommendedFor: ['Basic chat', 'Simple analysis', 'Cost-sensitive tasks']
  },
  'gemini-2.5-flash': {
    name: 'gemini-2.5-flash',
    costPer1MTokens: 2.50,
    capabilities: {
      text: true,
      webSearch: true,
      multimodal: true,
      realTime: false,
      reasoning: 'excellent'
    },
    maxTokens: 8192,
    recommendedFor: ['Complex reasoning', 'Lead research', 'Advanced analysis']
  },
  'gemini-2.5-flash-preview-tts': {
    name: 'gemini-2.5-flash-preview-tts',
    costPer1MTokens: 2.50,
    capabilities: {
      text: false,
      webSearch: false,
      multimodal: false,
      realTime: false,
      reasoning: 'basic'
    },
    maxTokens: 8192,
    recommendedFor: ['Text-to-speech', 'Audio generation']
  },
  'gemini-2.5-flash-exp-native-audio-thinking-dialog': {
    name: 'gemini-2.5-flash-exp-native-audio-thinking-dialog',
    costPer1MTokens: 2.50,
    capabilities: {
      text: true,
      webSearch: true,
      multimodal: true,
      realTime: true,
      reasoning: 'excellent'
    },
    maxTokens: 8192,
    recommendedFor: ['Real-time voice', 'Live conversations']
  }
}

export class ModelSelector {
  private static instance: ModelSelector
  private tokenUsageCache: Map<string, number> = new Map()

  static getInstance(): ModelSelector {
    if (!ModelSelector.instance) {
      ModelSelector.instance = new ModelSelector()
    }
    return ModelSelector.instance
  }

  selectModel(criteria: ModelSelectionCriteria): string {
    // Special cases first
    if (criteria.requiresRealTime) {
      return 'gemini-2.5-flash-exp-native-audio-thinking-dialog'
    }

    if (criteria.taskType === 'voice' && !criteria.requiresRealTime) {
      return 'gemini-2.5-flash-preview-tts'
    }

    // Check budget constraints
    if (criteria.budget && criteria.estimatedTokens) {
      const estimatedCost = (criteria.estimatedTokens / 1000000) * MODEL_CONFIGS['gemini-2.5-flash'].costPer1MTokens
      if (estimatedCost > criteria.budget) {
        // Force lite model for budget constraints
        return 'gemini-2.5-flash-lite'
      }
    }

    // User plan considerations
    if (criteria.userPlan === 'free') {
      return 'gemini-2.5-flash-lite'
    }

    // Complexity-based selection
    if (criteria.complexity === 'simple') {
      return 'gemini-2.5-flash-lite'
    }

    if (criteria.complexity === 'complex' || criteria.requiresWebSearch) {
      return 'gemini-2.5-flash'
    }

    // Default to lite for cost efficiency
    return 'gemini-2.5-flash-lite'
  }

  estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4)
  }

  estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    const config = MODEL_CONFIGS[model]
    if (!config) return 0

    const totalTokens = inputTokens + outputTokens
    return (totalTokens / 1000000) * config.costPer1MTokens
  }

  getModelInfo(model: string): ModelConfig | null {
    return MODEL_CONFIGS[model] || null
  }

  logTokenUsage(model: string, inputTokens: number, outputTokens: number): void {
    const key = `${model}-${new Date().toISOString().split('T')[0]}`
    const currentUsage = this.tokenUsageCache.get(key) || 0
    this.tokenUsageCache.set(key, currentUsage + inputTokens + outputTokens)
  }

  getDailyUsage(model: string): number {
    const key = `${model}-${new Date().toISOString().split('T')[0]}`
    return this.tokenUsageCache.get(key) || 0
  }

  shouldUseLiteModel(criteria: ModelSelectionCriteria): boolean {
    // Use lite model for:
    // 1. Simple tasks
    // 2. Free users
    // 3. Budget constraints
    // 4. High token usage scenarios
    
    if (criteria.complexity === 'simple') return true
    if (criteria.userPlan === 'free') return true
    if (criteria.estimatedTokens && criteria.estimatedTokens > 4000) return true
    
    return false
  }
}

// Convenience functions
export const selectModel = (criteria: ModelSelectionCriteria): string => {
  return ModelSelector.getInstance().selectModel(criteria)
}

export const estimateTokens = (text: string): number => {
  return ModelSelector.getInstance().estimateTokens(text)
}

export const estimateCost = (model: string, inputTokens: number, outputTokens: number): number => {
  return ModelSelector.getInstance().estimateCost(model, inputTokens, outputTokens)
} 