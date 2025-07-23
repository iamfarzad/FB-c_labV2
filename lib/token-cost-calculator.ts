/**
 * Token cost calculator for multiple AI providers
 * Updated with current pricing as of January 2025
 */

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface CostCalculation {
  inputCost: number
  outputCost: number
  totalCost: number
  provider: string
  model: string
  timestamp: string
}

export interface ProviderPricing {
  inputPrice: number // per 1M tokens
  outputPrice: number // per 1M tokens
  currency: string
}

// Current pricing as of January 2025 (per 1M tokens)
export const PROVIDER_PRICING: Record<string, Record<string, ProviderPricing>> = {
  gemini: {
    "gemini-2.5-flash": {
      inputPrice: 0.075, // $0.075 per 1M input tokens
      outputPrice: 0.3, // $0.30 per 1M output tokens
      currency: "USD",
    },
    "gemini-2.5-flash-lite": {
      inputPrice: 0.10, // $0.10 per 1M input tokens (40% audio cost reduction from preview)
      outputPrice: 0.40, // $0.40 per 1M output tokens
      currency: "USD",
    },
    "gemini-2.5": {
      inputPrice: 1.25, // $1.25 per 1M input tokens
      outputPrice: 5.0, // $5.00 per 1M output tokens
      currency: "USD",
    },
  },
  openai: {
    "gpt-4o": {
      inputPrice: 2.5, // $2.50 per 1M input tokens
      outputPrice: 10.0, // $10.00 per 1M output tokens
      currency: "USD",
    },
    "gpt-4o-mini": {
      inputPrice: 0.15, // $0.15 per 1M input tokens
      outputPrice: 0.6, // $0.60 per 1M output tokens
      currency: "USD",
    },
    "gpt-4-turbo": {
      inputPrice: 10.0, // $10.00 per 1M input tokens
      outputPrice: 30.0, // $30.00 per 1M output tokens
      currency: "USD",
    },
    "gpt-3.5-turbo": {
      inputPrice: 0.5, // $0.50 per 1M input tokens
      outputPrice: 1.5, // $1.50 per 1M output tokens
      currency: "USD",
    },
  },
  anthropic: {
    "claude-3-5-sonnet": {
      inputPrice: 3.0, // $3.00 per 1M input tokens
      outputPrice: 15.0, // $15.00 per 1M output tokens
      currency: "USD",
    },
    "claude-3-haiku": {
      inputPrice: 0.25, // $0.25 per 1M input tokens
      outputPrice: 1.25, // $1.25 per 1M output tokens
      currency: "USD",
    },
    "claude-3-opus": {
      inputPrice: 15.0, // $15.00 per 1M input tokens
      outputPrice: 75.0, // $75.00 per 1M output tokens
      currency: "USD",
    },
  },
  groq: {
    "llama-3.1-70b": {
      inputPrice: 0.59, // $0.59 per 1M input tokens
      outputPrice: 0.79, // $0.79 per 1M output tokens
      currency: "USD",
    },
    "llama-3.1-8b": {
      inputPrice: 0.05, // $0.05 per 1M input tokens
      outputPrice: 0.08, // $0.08 per 1M output tokens
      currency: "USD",
    },
    "mixtral-8x7b": {
      inputPrice: 0.24, // $0.24 per 1M input tokens
      outputPrice: 0.24, // $0.24 per 1M output tokens
      currency: "USD",
    },
  },
  xai: {
    "grok-beta": {
      inputPrice: 5.0, // $5.00 per 1M input tokens
      outputPrice: 15.0, // $15.00 per 1M output tokens
      currency: "USD",
    },
  },
}

export class TokenCostCalculator {
  static calculateCost(provider: string, model: string, usage: TokenUsage): CostCalculation {
    const pricing = PROVIDER_PRICING[provider]?.[model]

    if (!pricing) {
      console.warn(`No pricing found for ${provider}/${model}`)
      return {
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
        provider,
        model,
        timestamp: new Date().toISOString(),
      }
    }

    const inputCost = (usage.inputTokens / 1_000_000) * pricing.inputPrice
    const outputCost = (usage.outputTokens / 1_000_000) * pricing.outputPrice
    const totalCost = inputCost + outputCost

    return {
      inputCost: Number(inputCost.toFixed(6)),
      outputCost: Number(outputCost.toFixed(6)),
      totalCost: Number(totalCost.toFixed(6)),
      provider,
      model,
      timestamp: new Date().toISOString(),
    }
  }

  static getProviderModels(provider: string): string[] {
    return Object.keys(PROVIDER_PRICING[provider] || {})
  }

  static getAllProviders(): string[] {
    return Object.keys(PROVIDER_PRICING)
  }

  static getModelPricing(provider: string, model: string): ProviderPricing | null {
    return PROVIDER_PRICING[provider]?.[model] || null
  }

  static estimateCost(
    provider: string,
    model: string,
    estimatedInputTokens: number,
    estimatedOutputTokens: number,
  ): number {
    const pricing = PROVIDER_PRICING[provider]?.[model]
    if (!pricing) return 0

    const inputCost = (estimatedInputTokens / 1_000_000) * pricing.inputPrice
    const outputCost = (estimatedOutputTokens / 1_000_000) * pricing.outputPrice

    return Number((inputCost + outputCost).toFixed(6))
  }

  static formatCost(cost: number): string {
    if (cost < 0.001) {
      return `$${(cost * 1000).toFixed(3)}k` // Show in thousandths
    }
    return `$${cost.toFixed(4)}`
  }

  static calculateDailyCosts(usageLogs: any[]): Record<string, number> {
    const dailyCosts: Record<string, number> = {}

    usageLogs.forEach((log) => {
      const date = new Date(log.created_at).toISOString().split("T")[0]
      dailyCosts[date] = (dailyCosts[date] || 0) + log.total_cost
    })

    return dailyCosts
  }

  static calculateProviderBreakdown(usageLogs: any[]): Record<string, { cost: number; usage: number }> {
    const breakdown: Record<string, { cost: number; usage: number }> = {}

    usageLogs.forEach((log) => {
      const provider = log.provider
      if (!breakdown[provider]) {
        breakdown[provider] = { cost: 0, usage: 0 }
      }
      breakdown[provider].cost += log.total_cost
      breakdown[provider].usage += log.total_tokens
    })

    return breakdown
  }
}
