import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
}

export function createRateLimit(config: RateLimitConfig) {
  return function rateLimitMiddleware(request: NextRequest): NextResponse | null {
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : request.ip || 'unknown';
    
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get current rate limit data
    const current = rateLimitStore.get(key);
    
    if (!current || current.resetTime < now) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return null; // Allow request
    }
    
    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
          }
        }
      );
    }
    
    // Increment count
    current.count++;
    rateLimitStore.set(key, current);
    
    return null; // Allow request
  };
}

// Admin-specific rate limiting (stricter limits)
export const adminRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  keyGenerator: (request) => {
    // Use user ID if available, otherwise IP
    const userId = request.headers.get('x-user-id');
    return userId || request.ip || 'unknown';
  }
});

// General API rate limiting
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // 1000 requests per 15 minutes
  keyGenerator: (request) => request.ip || 'unknown'
});

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute
