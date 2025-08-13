import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { getSupabase } from '@/lib/supabase/server'

const Body = z.object({
  email: z.string().email(),
  artifactId: z.string().uuid()
})

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: NextRequest) {
  try {
    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }
    const { email, artifactId } = parsed.data

    // Validate artifact exists
    const supabase = getSupabase()
    const { data: artifact, error } = await supabase
      .from('artifacts')
      .select('*')
      .eq('id', artifactId)
      .single()
    if (error || !artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const link = `${baseUrl}/app/artifact/${artifactId}`

    if (!resend) {
      console.warn('[send-artifact-link] RESEND_API_KEY not configured; skipping actual email')
      return NextResponse.json({ ok: true, simulated: true, link })
    }

    const subject = 'Your generated app link from F.B/c'
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji;">
        <h2>Here is your app link</h2>
        <p>We generated your interactive app. You can open it here:</p>
        <p><a href="${link}" style="display:inline-block;background:#111827;color:#ffffff;padding:10px 14px;border-radius:6px;text-decoration:none;">Open App</a></p>
        <p style="margin-top:16px;">If the button doesn’t work, copy and paste this URL:</p>
        <p><a href="${link}">${link}</a></p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb;"/>
        <p style="font-size:12px;color:#6b7280;">F.B/c · AI Strategy & Workshops</p>
      </div>
    `

    const sendRes = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'F.B/c <noreply@fbconsulting.ai>',
      to: [email],
      subject,
      html,
      tags: [ { name: 'artifact_id', value: artifactId } ]
    })
    if ((sendRes as any)?.error) {
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, link })
  } catch (e) {
    console.error('send-artifact-link error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


