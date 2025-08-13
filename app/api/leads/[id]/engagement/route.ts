import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { LeadManager } from '@/lib/lead-manager'

const Body = z.object({ interactionType: z.string().min(1) })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const lm = new LeadManager()
    await lm.updateEngagementScore(params.id, parsed.data.interactionType)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('leads engagement error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


