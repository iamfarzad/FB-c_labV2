import { NextRequest, NextResponse } from 'next/server'
import { detectIntent } from '@/lib/intelligence/intent-detector'
import { ContextStorage } from '@/lib/context/context-storage'

const contextStorage = new ContextStorage()

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userMessage } = await req.json()
    if (!sessionId || !userMessage) {
      return NextResponse.json({ error: 'Missing sessionId or userMessage' }, { status: 400 })
    }

    const intent = detectIntent(String(userMessage))

    // Persist intent into conversation_contexts.intent_data
    await contextStorage.update(sessionId, { intent_data: intent as any })

    return NextResponse.json(intent)
  } catch (error) {
    console.error('❌ Intent classification failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


