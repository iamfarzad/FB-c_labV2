import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'
import { adminAuthMiddleware } from '@/lib/auth'
import { adminRateLimit } from '@/lib/rate-limiting'
import { buildAdminContext, formatAdminContextForAI } from '@/lib/admin-context-builder'
import { logServerActivity } from '@/lib/server-activity-logger'
import { sanitizeString } from '@/lib/validation'
import { withAdminMonitoring } from '@/lib/admin-monitoring'
import { createOptimizedConfig, optimizeConversation, type ConversationMessage } from '@/lib/gemini-config-enhanced'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  imageUrl?: string
}

const ADMIN_SYSTEM_PROMPT = `You are F.B/c AI Admin Assistant, a specialized business intelligence and management AI.

Your capabilities:
- Analyze lead data and provide actionable insights
- Draft professional emails for campaigns and follow-ups
- Suggest meeting scheduling strategies and optimizations
- Interpret analytics and performance metrics
- Provide business recommendations based on data
- Help with lead scoring and prioritization
- Monitor system health and performance
- Assist with cost optimization and budget management
- Generate reports and summaries
- Suggest improvements for business processes

You have access to REAL-TIME admin dashboard data including:
- Lead management and scoring
- Meeting schedules and availability
- Email campaign performance
- Cost tracking and budget analysis
- User engagement analytics
- AI performance metrics
- System activity and health monitoring

Response Style:
- Be concise, actionable, and data-driven
- Provide specific recommendations with rationale
- Use the context data to support your suggestions
- Suggest next steps and priorities
- Maintain professional, business-focused tone
- When analyzing data, highlight trends and anomalies
- For email drafting, provide complete, professional content
- For meetings, consider scheduling conflicts and availability

IMPORTANT: Always reference the current admin dashboard data when making recommendations or analyzing situations.`

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = `admin-chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    // Log request start
    await logServerActivity({
      type: 'admin_chat',
      title: 'Admin Chat Request Started',
      description: 'Admin chat session initiated',
      status: 'in_progress',
      metadata: { correlationId }
    })

    // Apply admin authentication middleware
    const authResult = await adminAuthMiddleware(req)
    if (authResult) {
      return authResult
    }

    // Apply rate limiting
    const rateLimitResult = await adminRateLimit(req)
    if (rateLimitResult) {
      return rateLimitResult
    }

    // Parse and validate request
    const body = await req.json()
    const { messages, data = {} } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Sanitize messages
    const sanitizedMessages = messages.map((message: Message) => ({
      ...message,
      content: sanitizeString(message.content)
    }))

    // Build comprehensive admin context
    const adminContext = await buildAdminContext()
    const contextString = formatAdminContextForAI(adminContext)

    // Create enhanced system prompt with admin context
    const enhancedSystemPrompt = `${ADMIN_SYSTEM_PROMPT}

CURRENT ADMIN DASHBOARD DATA:
${contextString}

Use this real-time data to provide informed, actionable advice.`

    // Initialize Gemini client
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const model = genAI.models.generateContentStream

    // Prepare optimized content for Gemini with admin context and caching
    const conversationMessages: ConversationMessage[] = sanitizedMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      content: msg.content
    }));

    const optimizedContent = await optimizeConversation(
      conversationMessages,
      enhancedSystemPrompt,
      `admin-${correlationId}`, // Admin-specific session ID
      6000 // Higher token limit for admin context
    );

    // Create optimized generation config for admin usage
    const optimizedConfig = createOptimizedConfig('research', {
      maxOutputTokens: 3072, // Higher limit for detailed admin analysis
      temperature: 0.4, // Balanced for business analysis
    });

    // Generate response
    let responseStream
    let actualInputTokens = optimizedContent.estimatedTokens
    let actualOutputTokens = 0
    
    // Log optimization results for admin monitoring
    console.log(`🔧 Admin chat optimization: ${optimizedContent.usedCache ? 'Used cache' : 'Created new'}, estimated tokens: ${optimizedContent.estimatedTokens}${optimizedContent.summary ? ', with summary' : ''}`);
    
    try {
      responseStream = await model({
        model: 'gemini-2.5-flash',
        config: optimizedConfig,
        contents: optimizedContent.contents
      })

      // Use optimized token estimation with cap
      actualOutputTokens = Math.min(optimizedConfig.maxOutputTokens, actualInputTokens * 0.7) // Admin responses tend to be longer
    } catch (error: any) {
      // Log failed activity
      await logServerActivity({
        type: 'error',
        title: 'Admin Chat AI Response Generation Failed',
        description: error.message || 'Unknown error during AI processing',
        status: 'failed',
        metadata: { correlationId, error: error.message }
      })

      throw error
    }

    // Log successful completion
    await logServerActivity({
      type: 'admin_chat',
      title: 'Admin Chat Response Generated',
      description: `Generated admin chat response (${actualInputTokens + actualOutputTokens} tokens)`,
      status: 'completed',
      metadata: {
        correlationId,
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        processingTime: Date.now() - startTime,
        contextDataPoints: Object.keys(adminContext).length
      }
    })

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text || ''
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`))
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
        } catch (error: any) {
          // Log stream error
          await logServerActivity({
            type: 'error',
            title: 'Admin Chat Stream Error',
            description: 'Error during response streaming',
            status: 'failed',
            metadata: { correlationId, error: error.message || 'Unknown error' }
          })

          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Correlation-ID': correlationId,
        'X-Response-Time': `${Date.now() - startTime}ms`,
        'X-Admin-Context-Version': '1.0'
      },
    })

  } catch (error: any) {
    // Log general error
    await logServerActivity({
      type: 'error',
      title: 'Admin Chat Request Failed',
      description: error.message || 'Unknown error processing admin chat request',
      status: 'failed',
      metadata: { correlationId, error: error.message || 'Unknown error' }
    })

    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    }, { status: 500 })
  }
}
