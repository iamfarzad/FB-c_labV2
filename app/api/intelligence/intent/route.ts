import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { detectIntent } from '@/lib/intelligence/intent-detector'
import { ContextStorage } from '@/lib/context/context-storage'
import { withApiGuard } from '@/lib/api/withApiGuard'

const contextStorage = new ContextStorage()

const Body = z.object({ sessionId: z.string().min(1), userMessage: z.string().min(1) })

export const POST = withApiGuard({
  schema: Body,
  requireSession: false,
  rateLimit: { windowMs: 5000, max: 5 },
  handler: async ({ body }) => {
    try {
      const message = String(body.userMessage)
      const intent = detectIntent(message)
      await contextStorage.update(body.sessionId, { intent_data: intent as any, last_user_message: message })
      return NextResponse.json({ ok: true, ...intent })
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: 'server_error', message: e?.message || 'unknown' }, { status: 500 })
    }
  }
})


