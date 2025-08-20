/**
 * Model Selection Utility for Gemini Models
 * Helps choose the optimal model based on use case requirements
 */

import { config } from './config'

export type UseCase = 
  | 'chat'           // General chat interactions
  | 'translation'    // Translation tasks (latency-sensitive)
  | 'classification' // Classification tasks (latency-sensitive)
  | 'research'       // Deep research and analysis
  | 'image_analysis' // Image processing
  | 'audio_processing' // Audio/voice processing
  | 'high_volume'    // High-volume operations

export type ModelRequirements = {
  prioritizeLatency?: boolean    // Need fastest response time
  prioritizeCost?: boolean      // Need lowest cost
  requiresMultimodal?: boolean  // Needs image/audio support
  highVolume?: boolean         // High request volume
}

/**
 * Estimate token count for text (rough approximation)
 * 1 token ≈ 4 characters for English text
 */
export function estimateTokens(text: string): number {
  if (!text) return 0
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

/**
 * Select model for specific feature/use case
 * Alias for ModelSelector.selectModel for backward compatibility
 */
export function selectModelForFeature(useCase: UseCase, requirements: ModelRequirements = {}): string {
  return ModelSelector.selectModel(useCase, requirements)
}

export class ModelSelector {
  /**
   * Select optimal Gemini model based on use case
   */
  static selectModel(useCase: UseCase, requirements: ModelRequirements = {}): string {
    const { prioritizeLatency, prioritizeCost, highVolume } = requirements

    // For high-volume or cost-sensitive operations, prefer current cost-effective model
    if (prioritizeCost || highVolume) {
      return config.ai.gemini.models.default // gemini-2.5-flash (cheaper)
    }

    // For latency-sensitive operations, consider Flash-Lite
    if (prioritizeLatency) {
      switch (useCase) {
        case 'translation':
        case 'classification':
        case 'chat': // Only for real-time chat where latency is critical
          return config.ai.gemini.models.fastResponse // gemini-2.5-flash-lite
        default:
          return config.ai.gemini.models.default
      }
    }

    // Default model selection by use case
    switch (useCase) {
      case 'image_analysis':
        return config.ai.gemini.models.analysis // gemini-1.5-flash
      
      case 'research':
        return config.ai.gemini.models.research // gemini-2.5-flash
      
      case 'translation':
      case 'classification':
        // These benefit from Flash-Lite's speed, but only if latency is prioritized
        return prioritizeLatency 
          ? config.ai.gemini.models.fastResponse 
          : config.ai.gemini.models.default
      
      case 'audio_processing':
        // Flash-Lite has 40% lower audio costs
        return config.ai.gemini.models.fastResponse
      
      case 'chat':
      case 'high_volume':
      default:
        return config.ai.gemini.models.default // Most cost-effective
    }
  }

  /**
   * Get cost comparison between models for given token usage
   */
  static getCostComparison(inputTokens: number, outputTokens: number) {
    const models = [
      { name: 'gemini-2.5-flash', input: 0.075, output: 0.30 },
      { name: 'gemini-2.5-flash-lite', input: 0.10, output: 0.40 },
    ]

    return models.map(model => ({
      model: model.name,
      inputCost: (inputTokens / 1_000_000) * model.input,
      outputCost: (outputTokens / 1_000_000) * model.output,
      totalCost: ((inputTokens / 1_000_000) * model.input) + ((outputTokens / 1_000_000) * model.output)
    }))
  }

  /**
   * Recommend when to use Flash-Lite
   */
  static shouldUseFlashLite(useCase: UseCase, requirements: ModelRequirements = {}): {
    recommended: boolean
    reason: string
  } {
    const { prioritizeLatency, prioritizeCost, highVolume } = requirements

    // Don't recommend if cost is prioritized
    if (prioritizeCost || highVolume) {
      return {
        recommended: false,
        reason: "Current gemini-2.5-flash is 25% cheaper for both input and output tokens"
      }
    }

    // Recommend for latency-sensitive operations
    if (prioritizeLatency) {
      switch (useCase) {
        case 'translation':
        case 'classification':
          return {
            recommended: true,
            reason: "Flash-Lite is optimized for low-latency translation and classification tasks"
          }
        case 'audio_processing':
          return {
            recommended: true,
            reason: "Flash-Lite has 40% lower audio input costs and faster processing"
          }
        default:
          return {
            recommended: false,
            reason: "For this use case, the speed improvement may not justify the 33% cost increase"
          }
      }
    }

    return {
      recommended: false,
      reason: "Stick with current gemini-2.5-flash for better cost efficiency"
    }
  }
}
