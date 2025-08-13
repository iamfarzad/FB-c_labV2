import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiGuard } from '@/lib/api/withApiGuard'
import { ContextStorage } from '@/lib/context/context-storage'

const Body = z.object({
  moduleId: z.string().min(1),
  stepId: z.string().min(1),
  xp: z.number().int().min(0).max(1000),
  moduleTitle: z.string().optional(),
  stepTitle: z.string().optional(),
  note: z.string().optional(),
})

const storage = new ContextStorage()

export const POST = withApiGuard({
  schema: Body,
  requireSession: true,
  rateLimit: { windowMs: 2000, max: 6 },
  handler: async ({ body, sessionId }) => {
    try {
      if (!sessionId) return NextResponse.json({ ok: false, error: 'missing_session' }, { status: 400 })
      const existing = await storage.get(sessionId)
      const prev = (existing?.tool_outputs?.education as any) || { completed: [], xp: 0, badges: [] }
      const completed = Array.isArray(prev.completed) ? prev.completed : []
      if (!completed.some((x: any) => x.moduleId === body.moduleId && x.stepId === body.stepId)) {
        completed.push({ moduleId: body.moduleId, stepId: body.stepId })
      }
      const xp = (typeof prev.xp === 'number' ? prev.xp : 0) + body.xp
      const education = { ...prev, completed, xp }
      const tool_outputs = { ...(existing?.tool_outputs || {}), education }
      const snippet = `Education: ${body.moduleTitle || body.moduleId} → ${body.stepTitle || body.stepId} (+${body.xp} XP)`
      const last_user_message = `${(existing?.last_user_message || '').toString()}\n\n${snippet}`.trim()
      await storage.update(sessionId, { tool_outputs, last_user_message })
      return NextResponse.json({ ok: true })
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: 'server_error', message: e?.message || 'unknown' }, { status: 500 })
    }
  }
})


