import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabase } from '@/lib/supabase/server'
import { LeadManager } from '@/lib/lead-manager'

const Body = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  companyUrl: z.string().url().optional()
})

export async function POST(req: NextRequest) {
  try {
    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }
    const { email, name, companyUrl } = parsed.data

    // Try to upsert into lead_summaries (lightweight lead storage used elsewhere)
    const supabase = getSupabase()

    // Check existing by email
    const { data: existing, error: selErr } = await supabase
      .from('lead_summaries')
      .select('*')
      .eq('email', email)
      .limit(1)
      .maybeSingle()
    if (!selErr && existing?.id) {
      return NextResponse.json({ ok: true, leadId: existing.id, existed: true })
    }

    const insertPayload: any = {
      email,
      name: name || email.split('@')[0],
      company_name: companyUrl || null,
      conversation_summary: 'Upserted via video-to-app email gate',
      consultant_brief: 'Auto-created lead',
      lead_score: 50,
      ai_capabilities_shown: ['video2app']
    }

    const { data: created, error: insErr } = await supabase
      .from('lead_summaries')
      .insert([insertPayload])
      .select()
      .single()
    if (insErr || !created?.id) {
      console.warn('Lead upsert failed, returning temp id', insErr)
      return NextResponse.json({ ok: true, leadId: `temp-${Date.now()}`, simulated: true })
    }

    // Optionally analyze domain to enrich (best-effort)
    try {
      const lm = new LeadManager()
      await lm.analyzeEmailDomain(email)
    } catch {}

    return NextResponse.json({ ok: true, leadId: created.id })
  } catch (e) {
    console.error('lead-upsert error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


