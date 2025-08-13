import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generatePdfWithPuppeteer, generatePdfPath } from '@/lib/pdf-generator-puppeteer'
import { getSupabase } from '@/lib/supabase/server'
import fs from 'fs'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, toEmail, leadName = 'Lead' } = await req.json()

    if (!sessionId || !toEmail) {
      return NextResponse.json({ error: 'sessionId and toEmail are required' }, { status: 400 })
    }

    // Prepare minimal data for summary – reuse export-summary query path (lightweight inline)
    const supabase = getSupabase()
    const leadInfo: any = { name: leadName, email: toEmail }
    let leadResearch: any = null

    try {
      const { data: research } = await supabase
        .from('lead_summaries')
        .select('conversation_summary, consultant_brief, lead_score, ai_capabilities_shown')
        .eq('email', toEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (research) leadResearch = research
    } catch {}

    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('metadata->sessionId', sessionId)
      .order('created_at', { ascending: true })

    const conversationHistory = (activities || []).map((a: any) => ({
      role: (a.type === 'ai_request' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: String(a.description || a.title || ''),
      timestamp: String(a.created_at)
    }))

    const summaryData = {
      leadInfo,
      conversationHistory,
      leadResearch: leadResearch || undefined,
      sessionId
    }

    const pdfPath = generatePdfPath(sessionId, leadInfo.name)
    await generatePdfWithPuppeteer(summaryData as any, pdfPath)
    const pdfBuffer = fs.readFileSync(pdfPath)
    fs.unlinkSync(pdfPath)

    if (!process.env.RESEND_API_KEY) {
      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="FB-c_Summary_${leadInfo.name.replace(/\s+/g, '_')}.pdf"`
        }
      })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const from = process.env.RESEND_FROM_EMAIL || 'F.B/c <noreply@fbclab.ai>'

    await resend.emails.send({
      from,
      to: [toEmail],
      subject: 'Your F.B/c AI Summary',
      html: `<p>Hi ${leadInfo.name || ''},</p><p>Your session summary is attached. If you’d like, book a workshop or a consulting call and we’ll turn this into a concrete plan.</p>`,
      attachments: [
        {
          filename: `FB-c_Summary_${leadInfo.name.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer.toString('base64'),
          contentType: 'application/pdf'
        }
      ]
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('send-pdf-summary error:', e)
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}


