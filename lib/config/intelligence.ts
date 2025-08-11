export const INTEL_CONFIG = {
  groundingEnabled: process.env.GEMINI_GROUNDING_ENABLED !== 'false',
  intentConfidenceThreshold: 0.7,
  contextTtlMs: 30_000,
}


