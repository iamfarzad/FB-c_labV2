export const INTEL_CONFIG = {
  minRoleConfidence: 0.7,
  suggestionsMax: 3,
  groundingEnabled: process.env.GEMINI_GROUNDING_ENABLED !== 'false',
  intentConfidenceThreshold: 0.7,
  contextTtlMs: 30_000,
}


