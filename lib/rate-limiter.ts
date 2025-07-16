import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from './supabase/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Skip rate limiting for successful requests
  skipFailedRequests?: boolean // Skip rate limiting for failed requests
}

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  private generateKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req)
    }

    // Default key generation based on IP and endpoint
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'
    const endpoint = req.nextUrl.pathname
    return `${ip}:${endpoint}`
  }

  private async getRateLimitEntry(key: string): Promise<RateLimitEntry> {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      const newEntry: RateLimitEntry = {
        count: 0,
        resetTime: now + this.config.windowMs,
        blocked: false
      }
      this.store.set(key, newEntry)
      return newEntry
    }

    return entry
  }

  private async incrementCount(key: string): Promise<RateLimitEntry> {
    const entry = await this.getRateLimitEntry(key)
    entry.count++
    
    // Check if rate limit exceeded
    if (entry.count > this.config.maxRequests) {
      entry.blocked = true
    }

    this.store.set(key, entry)
    return entry
  }

  async checkRateLimit(req: NextRequest): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter: number
  }> {
    const key = this.generateKey(req)
    const entry = await this.incrementCount(key)

    const remaining = Math.max(0, this.config.maxRequests - entry.count)
    const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000)

    return {
      allowed: !entry.blocked,
      remaining,
      resetTime: entry.resetTime,
      retryAfter
    }
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Rate limit configurations for different endpoints
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Public endpoints - more restrictive
  '/api/lead-capture': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown'
      return `lead-capture:${ip}`
    }
  },
  '/api/chat': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown'
      return `chat:${ip}`
    }
  },
  '/api/gemini-live': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown'
      return `gemini-live:${ip}`
    }
  },
  '/api/lead-research': {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5, // 5 requests per 5 minutes
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown'
      return `lead-research:${ip}`
    }
  },
  // Admin endpoints - more restrictive
  '/api/admin/stats': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    keyGenerator: (req) => {
      const authHeader = req.headers.get('authorization')
      if (authHeader) {
        return `admin-stats:${authHeader.split(' ')[1] || 'unknown'}`
      }
      return `admin-stats:${req.headers.get('x-forwarded-for') || 'unknown'}`
    }
  },
  '/api/admin/token-usage': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    keyGenerator: (req) => {
      const authHeader = req.headers.get('authorization')
      if (authHeader) {
        return `admin-token-usage:${authHeader.split(' ')[1] || 'unknown'}`
      }
      return `admin-token-usage:${req.headers.get('x-forwarded-for') || 'unknown'}`
    }
  }
}

// Create rate limiter instances
const rateLimiters = new Map<string, RateLimiter>()

// Initialize rate limiters
Object.entries(rateLimitConfigs).forEach(([endpoint, config]) => {
  rateLimiters.set(endpoint, new RateLimiter(config))
})

// Rate limiting middleware
export async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname
  
  // Find matching rate limit config
  let rateLimiter: RateLimiter | undefined
  
  for (const [endpoint, limiter] of rateLimiters.entries()) {
    if (pathname.startsWith(endpoint)) {
      rateLimiter = limiter
      break
    }
  }

  // If no specific rate limit config, use default
  if (!rateLimiter) {
    const defaultConfig: RateLimitConfig = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100, // 100 requests per minute
      keyGenerator: (req) => {
        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        return `default:${ip}`
      }
    }
    rateLimiter = new RateLimiter(defaultConfig)
  }

  // Check rate limit
  const rateLimitResult = await rateLimiter.checkRateLimit(req)

  if (!rateLimitResult.allowed) {
    // Rate limit exceeded
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later',
        retryAfter: rateLimitResult.retryAfter
      },
      { status: 429 }
    )

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimiter['config'].maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())
    response.headers.set('Retry-After', rateLimitResult.retryAfter.toString())

    return response
  }

  // Rate limit not exceeded, continue
  return null
}

// Database-based rate limiting for persistent storage
export class DatabaseRateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  private async getRateLimitEntry(key: string): Promise<RateLimitEntry | null> {
    const supabase = getSupabase()
    const now = Date.now()

    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('key', key)
      .single()

    if (error || !data) {
      return null
    }

    // Check if entry is expired
    if (now > data.reset_time) {
      return null
    }

    return {
      count: data.count,
      resetTime: data.reset_time,
      blocked: data.blocked
    }
  }

  private async createRateLimitEntry(key: string): Promise<void> {
    const supabase = getSupabase()
    const now = Date.now()

    await supabase
      .from('rate_limits')
      .insert({
        key,
        count: 0,
        reset_time: now + this.config.windowMs,
        blocked: false,
        created_at: new Date().toISOString()
      })
  }

  private async updateRateLimitEntry(key: string, entry: RateLimitEntry): Promise<void> {
    const supabase = getSupabase()

    await supabase
      .from('rate_limits')
      .upsert({
        key,
        count: entry.count,
        reset_time: entry.resetTime,
        blocked: entry.blocked,
        updated_at: new Date().toISOString()
      })
  }

  async checkRateLimit(req: NextRequest): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter: number
  }> {
    const key = this.generateKey(req)
    let entry = await this.getRateLimitEntry(key)

    if (!entry) {
      await this.createRateLimitEntry(key)
      entry = {
        count: 0,
        resetTime: Date.now() + this.config.windowMs,
        blocked: false
      }
    }

    // Increment count
    entry.count++
    
    // Check if rate limit exceeded
    if (entry.count > this.config.maxRequests) {
      entry.blocked = true
    }

    // Update database
    await this.updateRateLimitEntry(key, entry)

    const remaining = Math.max(0, this.config.maxRequests - entry.count)
    const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000)

    return {
      allowed: !entry.blocked,
      remaining,
      resetTime: entry.resetTime,
      retryAfter
    }
  }

  private generateKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req)
    }

    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'
    const endpoint = req.nextUrl.pathname
    return `${ip}:${endpoint}`
  }
}

// Cleanup expired entries periodically
setInterval(() => {
  rateLimiters.forEach(limiter => limiter.cleanup())
}, 60 * 1000) // Clean up every minute

// Export rate limiting function for use in API routes
export function withRateLimit(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    // Check rate limit
    const rateLimitResponse = await rateLimitMiddleware(req)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Continue with handler
    return handler(req, ...args)
  }
}