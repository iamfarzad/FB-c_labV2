import { NextResponse } from 'next/server'
import { MOCK_CONFIG } from '@/lib/mock-config'

export async function GET() {
  try {
    return NextResponse.json({
      mockEnabled: MOCK_CONFIG.enabled,
      environment: process.env.NODE_ENV,
      enableGeminiMocking: process.env.ENABLE_GEMINI_MOCKING,
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        '/api/mock/chat',
        '/api/mock/lead-research',
        '/api/mock/status'
      ],
      redirectedEndpoints: [
        '/api/chat → /api/mock/chat',
        '/api/lead-research → /api/mock/lead-research',
        '/api/intelligence/lead-research → /api/mock/lead-research',
        'Other Gemini APIs → /api/mock/chat (fallback)'
      ],
      message: MOCK_CONFIG.enabled 
        ? '🟠 Mock API is ENABLED - All Gemini calls are being mocked'
        : '🟢 Mock API is DISABLED - Using real Gemini API'
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'server_error', message: e?.message || 'unknown' }, { status: 500 })
  }
}
