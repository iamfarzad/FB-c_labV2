/**
 * Intelligence Configuration
 * Centralized configuration for AI intelligence features
 */

export const URL_CONTEXT_CONFIG = {
  enabled: process.env.URL_CONTEXT_ENABLED === 'true',
  maxUrls: Number(process.env.URL_CONTEXT_MAX_URLS) || 10,
  allowedDomains: process.env.URL_CONTEXT_ALLOWED_DOMAINS?.split(',').map(d => d.trim()).filter(Boolean) || [],
  timeoutMs: Number(process.env.URL_CONTEXT_TIMEOUT_MS) || 8000,
  maxBytes: Number(process.env.URL_CONTEXT_MAX_BYTES) || 5_000_000,
} as const

export const PROVIDER_TIMEOUT_MS = Number(process.env.PROVIDER_TIMEOUT_MS) || 30000
export const EMBED_DIM = Number(process.env.EMBED_DIM) || 768
export const LIVE_ENABLED = process.env.LIVE_ENABLED === 'true'
export const GEMINI_GROUNDING_ENABLED = process.env.GEMINI_GROUNDING_ENABLED === 'true'

export const INTELLIGENCE_CONFIG = {
  urlContext: URL_CONTEXT_CONFIG,
  providerTimeout: PROVIDER_TIMEOUT_MS,
  embedDimension: EMBED_DIM,
  liveEnabled: LIVE_ENABLED,
  groundingEnabled: GEMINI_GROUNDING_ENABLED,
} as const


