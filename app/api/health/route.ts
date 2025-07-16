import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/server'
import { HealthCheckSchema } from '@/lib/validation-schemas'

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const healthCheck: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    services: {}
  }

  try {
    // Check database connectivity
    const dbStartTime = Date.now()
    const supabase = getSupabase()
    const { data: dbTest, error: dbError } = await supabase
      .from('lead_summaries')
      .select('count')
      .limit(1)
    
    const dbResponseTime = Date.now() - dbStartTime
    healthCheck.services.database = {
      status: dbError ? 'unhealthy' : 'healthy',
      responseTime: dbResponseTime,
      error: dbError?.message
    }

    // Check AI providers
    const aiProviders = {
      gemini: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      xai: !!process.env.XAI_API_KEY
    }

    const configuredProviders = Object.values(aiProviders).filter(Boolean).length
    healthCheck.services.ai_providers = {
      status: configuredProviders > 0 ? 'healthy' : 'unhealthy',
      configured: configuredProviders,
      providers: aiProviders
    }

    // Check email service
    const emailService = {
      resend: !!process.env.RESEND_API_KEY,
      webhook_secret: !!process.env.RESEND_WEBHOOK_SECRET
    }

    healthCheck.services.email_service = {
      status: emailService.resend ? 'healthy' : 'unhealthy',
      configured: emailService.resend,
      webhook_configured: emailService.webhook_secret
    }

    // Check WebSocket server
    const wsUrl = process.env.WEBSOCKET_URL || 'ws://localhost:3001'
    let wsStatus = 'unknown'
    try {
      const wsResponse = await fetch(`${wsUrl.replace('ws://', 'http://').replace('wss://', 'https://')}/health`, {
        method: 'GET',
        timeout: 5000
      })
      wsStatus = wsResponse.ok ? 'healthy' : 'unhealthy'
    } catch (error) {
      wsStatus = 'unhealthy'
    }

    healthCheck.services.websocket_server = {
      status: wsStatus,
      url: wsUrl
    }

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
    healthCheck.services.environment = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
      missing_variables: missingEnvVars
    }

    // Check system resources
    const memoryUsage = process.memoryUsage()
    healthCheck.services.system_resources = {
      status: 'healthy',
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024) // MB
      }
    }

    // Determine overall status
    const unhealthyServices = Object.values(healthCheck.services).filter(
      (service: any) => service.status === 'unhealthy'
    )

    if (unhealthyServices.length === 0) {
      healthCheck.status = 'healthy'
    } else if (unhealthyServices.length <= 2) {
      healthCheck.status = 'degraded'
    } else {
      healthCheck.status = 'unhealthy'
    }

    // Add response time
    healthCheck.responseTime = Date.now() - startTime

    // Validate health check structure
    const validatedHealthCheck = HealthCheckSchema.parse(healthCheck)

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503

    return NextResponse.json(validatedHealthCheck, { status: statusCode })

  } catch (error: any) {
    console.error('Health check error:', error)
    
    healthCheck.status = 'unhealthy'
    healthCheck.error = error.message
    healthCheck.responseTime = Date.now() - startTime

    return NextResponse.json(healthCheck, { status: 503 })
  }
}