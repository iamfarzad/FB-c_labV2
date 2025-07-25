/**
 * Dynamic Model Selector for Cost Optimization
 * Chooses the most appropriate Gemini model based on task requirements and cost constraints
 */

export interface ModelConfig {
  name: string
  maxTokens: number
  costPer1MTokens: number
  capabilities: string[]
  useCases: string[]
}

export interface ModelSelectionResult {
  model: string
  estimatedCost: number
  reason: string
  fallbackModel?: string
}

export class ModelSelector {
  private static instance: ModelSelector

  private models: Record<string, ModelConfig> = {
    'gemini-2.5-flash': {
      name: 'Gemini 2.5 Flash',
      maxTokens: 1000000,
      costPer1MTokens: 0.075,
      capabilities: ['text', 'image', 'video', 'audio', 'multimodal'],
      useCases: ['complex-analysis', 'video-processing', 'multimodal-tasks', 'creative-content']
    },
    'gemini-2.5-flash-lite': {
      name: 'Gemini 2.5 Flash Lite',
      maxTokens: 1000000,
      costPer1MTokens: 0.025,
      capabilities: ['text', 'image'],
      useCases: ['simple-chat', 'basic-analysis', 'document-processing', 'image-analysis']
    },
    'gemini-1.5-flash': {
      name: 'Gemini 1.5 Flash',
      maxTokens: 1000000,
      costPer1MTokens: 0.075,
      capabilities: ['text', 'image'],
      useCases: ['legacy-support', 'fallback']
    },
    'gemini-1.5-pro': {
      name: 'Gemini 1.5 Pro',
      maxTokens: 2000000,
      costPer1MTokens: 0.375,
      capabilities: ['text', 'image', 'long-context'],
      useCases: ['long-documents', 'complex-reasoning', 'legacy-support']
    }
  }

  static getInstance(): ModelSelector {
    if (!ModelSelector.instance) {
      ModelSelector.instance = new ModelSelector()
    }
    return ModelSelector.instance
  }

  selectModel(
    taskType: string,
    estimatedTokens: number,
    hasImages: boolean = false,
    hasVideo: boolean = false,
    hasAudio: boolean = false,
    isComplex: boolean = false,
    budget: number = 0.10 // Default budget of $0.10
  ): ModelSelectionResult {
    // Determine required capabilities
    const requiredCapabilities: string[] = ['text']
    if (hasImages) requiredCapabilities.push('image')
    if (hasVideo) requiredCapabilities.push('video')
    if (hasAudio) requiredCapabilities.push('audio')

    // Filter models by capabilities
    const suitableModels = Object.entries(this.models).filter(([_, config]) => {
      return requiredCapabilities.every(cap => config.capabilities.includes(cap))
    })

    if (suitableModels.length === 0) {
      // Fallback to flash-lite for basic text tasks
      const fallbackModel = 'gemini-2.5-flash-lite'
      return {
        model: fallbackModel,
        estimatedCost: this.calculateCost(fallbackModel, estimatedTokens),
        reason: 'No suitable model found, using fallback',
        fallbackModel
      }
    }

    // Sort by cost (cheapest first)
    suitableModels.sort((a, b) => a[1].costPer1MTokens - b[1].costPer1MTokens)

    // Check token limits
    const validModels = suitableModels.filter(([_, config]) => {
      return estimatedTokens <= config.maxTokens
    })

    if (validModels.length === 0) {
      // If no model can handle the token count, use the highest capacity model
      const highestCapacity = suitableModels.reduce((max, current) => 
        current[1].maxTokens > max[1].maxTokens ? current : max
      )
      return {
        model: highestCapacity[0],
        estimatedCost: this.calculateCost(highestCapacity[0], estimatedTokens),
        reason: 'Token count exceeds all model limits, using highest capacity model',
        fallbackModel: 'gemini-2.5-flash-lite'
      }
    }

    // Select the cheapest model that meets requirements
    let selectedModel = validModels[0][0]
    let estimatedCost = this.calculateCost(selectedModel, estimatedTokens)

    // If cost exceeds budget, try to find a cheaper alternative
    if (estimatedCost > budget && validModels.length > 1) {
      for (const [modelName, config] of validModels) {
        const cost = this.calculateCost(modelName, estimatedTokens)
        if (cost <= budget) {
          selectedModel = modelName
          estimatedCost = cost
          break
        }
      }
    }

    // For complex tasks, prefer flash over flash-lite if budget allows
    if (isComplex && selectedModel === 'gemini-2.5-flash-lite' && budget >= 0.10) {
      const flashCost = this.calculateCost('gemini-2.5-flash', estimatedTokens)
      if (flashCost <= budget) {
        selectedModel = 'gemini-2.5-flash'
        estimatedCost = flashCost
      }
    }

    return {
      model: selectedModel,
      estimatedCost,
      reason: this.getSelectionReason(selectedModel, taskType, isComplex)
    }
  }

  selectModelForFeature(feature: string, estimatedTokens: number, isDemo: boolean = true): ModelSelectionResult {
    const featureConfigs: Record<string, { isComplex: boolean; hasImages: boolean; hasVideo: boolean; hasAudio: boolean }> = {
      'chat': { isComplex: false, hasImages: false, hasVideo: false, hasAudio: false },
      'voice_tts': { isComplex: false, hasImages: false, hasVideo: false, hasAudio: true },
      'webcam_analysis': { isComplex: false, hasImages: true, hasVideo: false, hasAudio: false },
      'screenshot_analysis': { isComplex: false, hasImages: true, hasVideo: false, hasAudio: false },
      'document_analysis': { isComplex: false, hasImages: false, hasVideo: false, hasAudio: false },
      'video_to_app': { isComplex: true, hasImages: false, hasVideo: false, hasAudio: false }, // Fixed: no video processing needed
      'lead_research': { isComplex: true, hasImages: false, hasVideo: false, hasAudio: false }
    }

    const config = featureConfigs[feature] || { isComplex: false, hasImages: false, hasVideo: false, hasAudio: false }
    
    // Use smaller budget for demo sessions
    const budget = isDemo ? 0.05 : 0.20

    return this.selectModel(
      feature,
      estimatedTokens,
      config.hasImages,
      config.hasVideo,
      config.hasAudio,
      config.isComplex,
      budget
    )
  }

  calculateCost(model: string, tokens: number): number {
    const config = this.models[model]
    if (!config) {
      // Fallback to flash-lite pricing
      return (tokens / 1000000) * 0.025
    }
    return (tokens / 1000000) * config.costPer1MTokens
  }

  estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4)
  }

  estimateTokensForMessages(messages: Array<{ role: string; content: string; imageUrl?: string }>): number {
    let totalTokens = 0
    
    for (const message of messages) {
      // Base tokens for role and content
      totalTokens += this.estimateTokens(message.role)
      totalTokens += this.estimateTokens(message.content)
      
      // Add tokens for images (rough estimate: 1000 tokens per image)
      if (message.imageUrl) {
        totalTokens += 1000
      }
    }
    
    return totalTokens
  }

  getModelInfo(model: string): ModelConfig | null {
    return this.models[model] || null
  }

  getAllModels(): Record<string, ModelConfig> {
    return { ...this.models }
  }

  private getSelectionReason(model: string, taskType: string, isComplex: boolean): string {
    const config = this.models[model]
    if (!config) return 'Fallback model selected'

    if (model === 'gemini-2.5-flash-lite') {
      return isComplex ? 'Complex task but budget-constrained, using lite model' : 'Simple task, using cost-effective lite model'
    }
    
    if (model === 'gemini-2.5-flash') {
      return isComplex ? 'Complex task requiring full model capabilities' : 'Task requires advanced features'
    }

    return `Selected ${config.name} for ${taskType}`
  }
}

// Convenience functions
export const selectModel = (
  taskType: string,
  estimatedTokens: number,
  hasImages?: boolean,
  hasVideo?: boolean,
  hasAudio?: boolean,
  isComplex?: boolean,
  budget?: number
) => {
  return ModelSelector.getInstance().selectModel(taskType, estimatedTokens, hasImages, hasVideo, hasAudio, isComplex, budget)
}

export const selectModelForFeature = (feature: string, estimatedTokens: number, isDemo?: boolean) => {
  return ModelSelector.getInstance().selectModelForFeature(feature, estimatedTokens, isDemo)
}

export const calculateCost = (model: string, tokens: number) => {
  return ModelSelector.getInstance().calculateCost(model, tokens)
}

export const estimateTokens = (text: string) => {
  return ModelSelector.getInstance().estimateTokens(text)
}

export const estimateTokensForMessages = (messages: Array<{ role: string; content: string; imageUrl?: string }>) => {
  return ModelSelector.getInstance().estimateTokensForMessages(messages)
}

export const getModelInfo = (model: string) => {
  return ModelSelector.getInstance().getModelInfo(model)
} 