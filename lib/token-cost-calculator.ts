interface TokenUsage {
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  sessionId: string
  endpoint: string
  timestamp?: Date
}

// Updated pricing for current models (as of 2024)
const MODEL_PRICING = {
  // Gemini Models
  "gemini-1.5-flash": {
    input: 0.075 / 1000000, // $0.075 per 1M input tokens
    output: 0.3 / 1000000, // $0.30 per 1M output tokens
  },
  "gemini-2.5-flash": {
    input: 0.075 / 1000000, // $0.075 per 1M input tokens
    output: 0.3 / 1000000, // $0.30 per 1M output tokens
  },
  "gemini-2.5": {
    input: 1.25 / 1000000, // $1.25 per 1M input tokens
    output: 5.0 / 1000000, // $5.00 per 1M output tokens
  },

  // OpenAI Models
  "gpt-4o": {
    input: 2.5 / 1000000, // $2.50 per 1M input tokens
    output: 10.0 / 1000000, // $10.00 per 1M output tokens
  },
  "gpt-4o-mini": {
    input: 0.15 / 1000000, // $0.15 per 1M input tokens
    output: 0.6 / 1000000, // $0.60 per 1M output tokens
  },
  "gpt-3.5-turbo": {
    input: 0.5 / 1000000, // $0.50 per 1M input tokens
    output: 1.5 / 1000000, // $1.50 per 1M output tokens
  },

  // Anthropic Models
  "claude-3-5-sonnet": {
    input: 3.0 / 1000000, // $3.00 per 1M input tokens
    output: 15.0 / 1000000, // $15.00 per 1M output tokens
  },
  "claude-3-haiku": {
    input: 0.25 / 1000000, // $0.25 per 1M input tokens
    output: 1.25 / 1000000, // $1.25 per 1M output tokens
  },

  // Groq Models
  "llama-3.1-70b": {
    input: 0.59 / 1000000, // $0.59 per 1M input tokens
    output: 0.79 / 1000000, // $0.79 per 1M output tokens
  },
  "mixtral-8x7b": {
    input: 0.24 / 1000000, // $0.24 per 1M input tokens
    output: 0.24 / 1000000, // $0.24 per 1M output tokens
  },

  // xAI Models
  "grok-3": {
    input: 5.0 / 1000000, // $5.00 per 1M input tokens
    output: 15.0 / 1000000, // $15.00 per 1M output tokens
  },
} as const

export function calculateTokenCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING]

  if (!pricing) {
    console.warn(`No pricing found for model: ${model}`)
    return 0
  }

  const inputCost = inputTokens * pricing.input
  const outputCost = outputTokens * pricing.output
  const totalCost = inputCost + outputCost

  return Math.round(totalCost * 100000) / 100000 // Round to 5 decimal places
}

export async function logTokenUsage(usage: TokenUsage): Promise<void> {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("Token Usage:", {
        model: usage.model,
        tokens: `${usage.inputTokens}/${usage.outputTokens}`,
        cost: `$${usage.cost.toFixed(5)}`,
        endpoint: usage.endpoint,
      })
    }

    // In a real app, you would save this to your database
    // For now, we'll just store it in memory or localStorage
    if (typeof window !== "undefined") {
      const existingUsage = JSON.parse(localStorage.getItem("tokenUsage") || "[]")
      existingUsage.push({
        ...usage,
        timestamp: new Date().toISOString(),
      })

      // Keep only last 1000 entries
      if (existingUsage.length > 1000) {
        existingUsage.splice(0, existingUsage.length - 1000)
      }

      localStorage.setItem("tokenUsage", JSON.stringify(existingUsage))
    }
  } catch (error) {
    console.error("Failed to log token usage:", error)
  }
}

export function getTokenUsageStats(): {
  totalCost: number
  totalTokens: number
  usageByModel: Record<string, { tokens: number; cost: number; calls: number }>
  usageByEndpoint: Record<string, { tokens: number; cost: number; calls: number }>
} {
  if (typeof window === "undefined") {
    return {
      totalCost: 0,
      totalTokens: 0,
      usageByModel: {},
      usageByEndpoint: {},
    }
  }

  try {
    const usage: TokenUsage[] = JSON.parse(localStorage.getItem("tokenUsage") || "[]")

    const stats = {
      totalCost: 0,
      totalTokens: 0,
      usageByModel: {} as Record<string, { tokens: number; cost: number; calls: number }>,
      usageByEndpoint: {} as Record<string, { tokens: number; cost: number; calls: number }>,
    }

    usage.forEach((entry) => {
      stats.totalCost += entry.cost
      stats.totalTokens += entry.totalTokens

      // By model
      if (!stats.usageByModel[entry.model]) {
        stats.usageByModel[entry.model] = { tokens: 0, cost: 0, calls: 0 }
      }
      stats.usageByModel[entry.model].tokens += entry.totalTokens
      stats.usageByModel[entry.model].cost += entry.cost
      stats.usageByModel[entry.model].calls += 1

      // By endpoint
      if (!stats.usageByEndpoint[entry.endpoint]) {
        stats.usageByEndpoint[entry.endpoint] = { tokens: 0, cost: 0, calls: 0 }
      }
      stats.usageByEndpoint[entry.endpoint].tokens += entry.totalTokens
      stats.usageByEndpoint[entry.endpoint].cost += entry.cost
      stats.usageByEndpoint[entry.endpoint].calls += 1
    })

    return stats
  } catch (error) {
    console.error("Failed to get token usage stats:", error)
    return {
      totalCost: 0,
      totalTokens: 0,
      usageByModel: {},
      usageByEndpoint: {},
    }
  }
}

export function clearTokenUsage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("tokenUsage")
  }
}
