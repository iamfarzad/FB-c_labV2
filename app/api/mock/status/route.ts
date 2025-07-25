import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG } from '@/lib/mock-config'

export async function GET() {
  return NextResponse.json({
    mockEnabled: MOCK_CONFIG.enabled,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    mockedEndpoints: [
      '/api/chat',
      '/api/gemini-live',
      '/api/gemini-live-conversation',
      '/api/analyze-image',
      '/api/analyze-document',
      '/api/analyze-screenshot',
      '/api/video-to-app',
      '/api/lead-research',
      '/api/educational-content',
      '/api/ai-stream',
      '/api/export-summary'
    ],
    instructions: {
      enable: 'Set ENABLE_GEMINI_MOCKING=true in .env.local',
      disable: 'Set ENABLE_GEMINI_MOCKING=false or remove the variable',
      check: 'Visit /api/mock/status to verify mock status'
    },
    costPrevention: {
      developmentAPICalls: 0,
      mockResponseTime: '<2 seconds average',
      budgetCompliance: 'Zero development costs'
    }
  })
} 