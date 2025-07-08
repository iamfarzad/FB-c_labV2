export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface CostCalculation {
  inputCost: number
  outputCost: number
  totalCost: number
  currency: string
}

export interface ModelPricing {
  inputCostPer1M: number
  outputCostPer1M: number
}

export class TokenCostCalculator {
  // Updated pricing for January 2025 - Gemini 2.5 models only
  private static readonly PRICING: Record<string, Record<string, ModelPricing>> = {
    gemini: {
      "gemini-2.5": {
        inputCostPer1M: 1.25,
        outputCostPer1M: 5.0,
      },
      "gemini-2.5-flash": {
        inputCostPer1M: 0.075,
        outputCostPer1M: 0.3,
      },
    },
    openai: {
      "gpt-4o": {
        inputCostPer1M: 2.5,
        outputCostPer1M: 10.0,
      },
      "gpt-4o-mini": {
        inputCostPer1M: 0.15,
        outputCostPer1M: 0.6,
      },
      "gpt-4-turbo": {
        inputCostPer1M: 10.0,
        outputCostPer1M: 30.0,
      },
      "gpt-3.5-turbo": {
        inputCostPer1M: 0.5,
        outputCostPer1M: 1.5,
      },
    },
    anthropic: {
      "claude-3-5-sonnet": {
        inputCostPer1M: 3.0,
        outputCostPer1M: 15.0,
      },
      "claude-3-haiku": {
        inputCostPer1M: 0.25,
        outputCostPer1M: 1.25,
      },
      "claude-3-opus": {
        inputCostPer1M: 15.0,
        outputCostPer1M: 75.0,
      },
    },
    groq: {
      "llama-3.1-70b": {
        inputCostPer1M: 0.59,
        outputCostPer1M: 0.79,
      },
      "llama-3.1-8b": {
        inputCostPer1M: 0.05,
        outputCostPer1M: 0.08,
      },
      "mixtral-8x7b": {
        inputCostPer1M: 0.24,
        outputCostPer1M: 0.24,
      },
    },
    xai: {
      "grok-beta": {
        inputCostPer1M: 5.0,
        outputCostPer1M: 15.0,
      },
    },
  }

  static calculateCost(provider: string, model: string, usage: TokenUsage): CostCalculation {
    const pricing = this.PRICING[provider]?.[model]

    if (!pricing) {
      console.warn(`No pricing found for ${provider}/${model}`)
      return {
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
        currency: "USD",
      }
    }

    const inputCost = (usage.inputTokens / 1_000_000) * pricing.inputCostPer1M
    const outputCost = (usage.outputTokens / 1_000_000) * pricing.outputCostPer1M
    const totalCost = inputCost + outputCost

    return {
      inputCost: Number(inputCost.toFixed(6)),
      outputCost: Number(outputCost.toFixed(6)),
      totalCost: Number(totalCost.toFixed(6)),
      currency: "USD",
    }
  }

  static async logUsage(
    provider: string,
    model: string,
    usage: TokenUsage,
    sessionId?: string,
    userId?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const cost = this.calculateCost(provider, model, usage)

      // This would typically save to database
      console.log("Token usage logged:", {
        provider,
        model,
        usage,
        cost,
        sessionId,
        userId,
        metadata,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to log token usage:", error)
    }
  }

  static getSupportedProviders(): string[] {
    return Object.keys(this.PRICING)
  }

  static getSupportedModels(provider: string): string[] {
    return Object.keys(this.PRICING[provider] || {})
  }

  static getModelPricing(provider: string, model: string): ModelPricing | null {
    return this.PRICING[provider]?.[model] || null
  }
}
