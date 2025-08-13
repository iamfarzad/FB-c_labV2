import { type NextRequest, NextResponse } from "next/server"
import { adminAuthMiddleware } from "@/lib/auth"
import { adminRateLimit } from "@/lib/rate-limiting"
import { withAdminAuth } from "@/lib/api/withAdminAuth"

export const GET = withAdminAuth(async function(request: NextRequest) {
  // Check rate limiting
  const rateLimitResult = adminRateLimit(request);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) {
    return authResult;
  }
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d"

    // Mock AI performance data - in production, this would come from monitoring systems
    const now = new Date()
    const daysBack = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90

    // Generate response time data
    const responseTime = []
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      responseTime.push({
        timestamp: date.toISOString().split("T")[0],
        avgTime: Math.floor(Math.random() * 500) + 200,
        p95Time: Math.floor(Math.random() * 1000) + 800,
      })
    }

    // Generate token usage data
    const tokenUsage = []
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const tokens = Math.floor(Math.random() * 10000) + 5000
      tokenUsage.push({
        date: date.toISOString().split("T")[0],
        tokens,
        cost: (tokens * 0.002).toFixed(2), // Mock cost calculation
      })
    }

    const performanceData = {
      responseTime,
      successRate: 96.5,
      errorRate: 3.5,
      tokenUsage,
      modelPerformance: [
        { model: "gemini-2.5-flash", requests: 1250, successRate: 97, avgTime: 450 },
        { model: "gemini-1.5-pro", requests: 850, successRate: 95, avgTime: 680 },
        { model: "gemini-1.0-pro", requests: 420, successRate: 94, avgTime: 520 },
      ],
      toolUsage: [
        { tool: "Google Search", calls: 890, successRate: 98, avgTime: 1200 },
        { tool: "Web Scraping", calls: 650, successRate: 92, avgTime: 2100 },
        { tool: "Document Analysis", calls: 340, successRate: 96, avgTime: 800 },
        { tool: "Image Analysis", calls: 220, successRate: 94, avgTime: 1500 },
        { tool: "Code Generation", calls: 180, successRate: 89, avgTime: 3200 },
      ],
      qualityMetrics: {
        relevanceScore: 92,
        accuracyScore: 88,
        userSatisfaction: 91,
        completionRate: 94,
      },
    }

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error("AI performance metrics error:", error)
    return NextResponse.json({ error: "Failed to fetch AI performance metrics" }, { status: 500 })
  }
})
