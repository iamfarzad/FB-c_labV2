import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const EventSchema = z.object({
  sessionId: z.string().optional(),
  eventType: z.enum(['session_start', 'tool_used', 'intent_detected', 'suggestion_clicked', 'conversation_end']),
  eventData: z.record(z.any()).optional(),
  timestamp: z.number().optional(),
  userId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedEvent = EventSchema.parse(body)
    
    // Add timestamp if not provided
    const event = {
      ...validatedEvent,
      timestamp: validatedEvent.timestamp || Date.now()
    }

    // Log event (in production, this would go to analytics service)
    console.info('📊 Intelligence Event:', {
      type: event.eventType,
      sessionId: event.sessionId,
      timestamp: new Date(event.timestamp).toISOString(),
      data: event.eventData
    })

    // TODO: Send to analytics service (Mixpanel, PostHog, etc.)
    // await analytics.track(event.eventType, {
    //   sessionId: event.sessionId,
    //   userId: event.userId,
    //   ...event.eventData
    // })

    return NextResponse.json({ ok: true, eventId: `evt_${Date.now()}` })
  } catch (error) {
    console.error('❌ Event tracking failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Invalid event data' },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    message: 'Intelligence Events API - POST events to this endpoint' 
  })
}


