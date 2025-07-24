import { NextRequest, NextResponse } from 'next/server'
import { withFullSecurity } from '@/lib/api-security'

async function webhookHandler(req: NextRequest) {
  // If we get here, signature was valid
  return NextResponse.json({ ok: true, message: 'Webhook received successfully' })
}

export const POST = withFullSecurity(webhookHandler, {
  requireWebhookSignature: true,
  webhookSecret: process.env.WEBHOOK_SECRET || 'test-secret',
  payloadLimit: '100kb'
}) 