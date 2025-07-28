import { NextRequest, NextResponse } from 'next/server'
import { withFullSecurity } from '@/lib/api-security'

async function webhookHandler(req: NextRequest) {
  try {
    // If we get here, signature was valid
    return NextResponse.json({ ok: true, message: 'Webhook received successfully' })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withFullSecurity(webhookHandler, {
  requireWebhookSignature: true,
  webhookSecret: process.env.WEBHOOK_SECRET || 'test-secret',
  payloadLimit: '100kb'
})
