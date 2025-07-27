import { type NextRequest, NextResponse } from "next/server"
import { adminAuthMiddleware } from "@/lib/auth"
import { adminRateLimit } from "@/lib/rate-limiting"
import { adminMonitoring } from "@/lib/admin-monitoring"

export async function GET(request: NextRequest) {
  // Check rate limiting
  const rateLimitResult = adminRateLimit(request)
  if (rateLimitResult) {
    return rateLimitResult
  }

  // Check admin authentication
  const authResult = await adminAuthMiddleware(request)
  if (authResult) {
    return authResult
  }

  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') as '1h' | '24h' | '7d' | '30d' || '24h'
    const type = searchParams.get('type') || 'metrics'
    const limit = parseInt(searchParams.get('limit') || '50')
    const userEmail = searchParams.get('userEmail')
    const endpoint = searchParams.get('endpoint')

    let data: any

    switch (type) {
      case 'metrics':
        data = adminMonitoring.getMetrics(timeRange)
        break
      case 'logs':
        data = adminMonitoring.getRecentLogs(limit)
        break
      case 'user-logs':
        if (!userEmail) {
          return NextResponse.json(
            { error: "userEmail parameter is required for user-logs type" },
            { status: 400 }
          )
        }
        data = adminMonitoring.getLogsByUser(userEmail, limit)
        break
      case 'endpoint-logs':
        if (!endpoint) {
          return NextResponse.json(
            { error: "endpoint parameter is required for endpoint-logs type" },
            { status: 400 }
          )
        }
        data = adminMonitoring.getLogsByEndpoint(endpoint, limit)
        break
      case 'error-logs':
        data = adminMonitoring.getErrorLogs(limit)
        break
      default:
        return NextResponse.json(
          { error: "Invalid type parameter. Must be one of: metrics, logs, user-logs, endpoint-logs, error-logs" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin monitoring error:', error)
    return NextResponse.json(
      { error: "Failed to retrieve monitoring data" },
      { status: 500 }
    )
  }
} 