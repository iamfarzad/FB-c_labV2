import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const ALLOWED_ORIGINS = ['https://fbcai.com', 'http://localhost:3000', 'http://localhost:3001'] // Development and production origins

export function withAPISecurity(handler: (req: NextRequest) => Promise<Response | NextResponse>) {
  return async (req: NextRequest) => {
    // 1) CORS
    const origin = req.headers.get('origin')
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      const response = await handler(req)
      if (response instanceof NextResponse) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Vary', 'Origin')
        return response
      } else {
        // Handle regular Response objects
        const newResponse = new Response(response.body, response)
        newResponse.headers.set('Access-Control-Allow-Origin', origin)
        newResponse.headers.set('Vary', 'Origin')
        return newResponse
      }
    } else if (origin) {
      // Disallow all other origins
      return new NextResponse('Forbidden', { status: 403 })
    }

    // No origin header, proceed normally
    return await handler(req)
  }
}

// 2) Payload size limit middleware
export function withPayloadLimit(handler: (req: NextRequest) => Promise<Response | NextResponse>, limit: string = '100kb') {
  return async (req: NextRequest) => {
    try {
      const contentLength = req.headers.get('content-length')
      if (contentLength) {
        const sizeInBytes = parseInt(contentLength, 10)
        const limitInBytes = parseSizeLimit(limit)
        
        if (sizeInBytes > limitInBytes) {
          return new NextResponse(
            JSON.stringify({ error: 'Payload Too Large' }), 
            { 
              status: 413,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      }
      
      return await handler(req)
    } catch (err: any) {
      if (err.statusCode === 413 || /request entity too large/i.test(err.message)) {
        return new NextResponse(
          JSON.stringify({ error: 'Payload Too Large' }), 
          { 
            status: 413,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      throw err
    }
  }
}

// 3) Webhook signature validator
export function verifyWebhookSignature(secret: string) {
  return async (req: NextRequest) => {
    const signature = req.headers.get('x-webhook-signature')
    
    if (!signature) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing signature' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Clone the request to read the body without consuming it
    const clonedReq = req.clone()
    const body = await clonedReq.text()
    
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    // Fix buffer length issue by ensuring both strings are the same length
    const normalizedSignature = signature.replace(/^sha256=/, '')
    const normalizedExpected = expected
    
    if (normalizedSignature.length !== normalizedExpected.length) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid signature format' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!crypto.timingSafeEqual(Buffer.from(normalizedSignature, 'hex'), Buffer.from(normalizedExpected, 'hex'))) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid signature' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return null // Continue to handler
  }
}

// Helper function to parse size limits
function parseSizeLimit(limit: string): number {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  }
  
  const match = limit.toLowerCase().match(/^(\d+)([kmg]?b)$/)
  if (!match) {
    throw new Error(`Invalid size limit format: ${limit}`)
  }
  
  const [, size, unit] = match
  return parseInt(size, 10) * (units[unit] || 1)
}

// Combined security middleware
export function withFullSecurity(
  handler: (req: NextRequest) => Promise<Response | NextResponse>, 
  options: { 
    payloadLimit?: string
    requireWebhookSignature?: boolean
    webhookSecret?: string
  } = {}
) {
  return async (req: NextRequest) => {
    // Apply webhook signature validation if required
    if (options.requireWebhookSignature && options.webhookSecret) {
      const signatureResult = await verifyWebhookSignature(options.webhookSecret)(req)
      if (signatureResult) {
        return signatureResult
      }
    }

    // Apply payload limit
    const limitedHandler = withPayloadLimit(handler, options.payloadLimit)
    
    // Apply CORS
    return withAPISecurity(limitedHandler)(req)
  }
} 