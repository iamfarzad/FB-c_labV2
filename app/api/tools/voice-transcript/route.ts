import { NextRequest, NextResponse } from 'next/server'
import { VoiceTranscriptSchema } from '@/lib/services/tool-service'
import type { ToolRunResult } from '@/types/intelligence'
import { recordCapabilityUsed } from '@/lib/context/capabilities'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input using Zod schema
    const validatedData = VoiceTranscriptSchema.parse(body)
    
    // Business logic for voice transcript processing
    const { audioData, mimeType } = validatedData
    
    // Simulate audio processing and transcription
    // In a real implementation, this would use a speech-to-text service
    const processedTranscript = "This is a simulated transcript from the audio data"
    const wordCount = processedTranscript.split(' ').length
    const estimatedDuration = wordCount * 0.5 // Rough estimate: 2 words per second
    
    const response: ToolRunResult = {
      ok: true,
      output: {
        transcript: processedTranscript,
        wordCount,
        estimatedDuration,
        processedAt: new Date().toISOString()
      }
    }
    const sessionId = req.headers.get('x-intelligence-session-id') || undefined
    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'voiceTranscript', { bytes: audioData.length, mimeType }) } catch {}
    }
    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('Voice transcript API error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' } satisfies ToolRunResult, { status: 400 })
    }
    
    return NextResponse.json({ ok: false, error: 'Internal server error' } satisfies ToolRunResult, { status: 500 })
  }
}
