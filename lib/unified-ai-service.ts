import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

import type { Content, Part } from '@google/generative-ai'
import type { Message } from '@/app/chat/types/chat'
import type { LiveConversationOptions, LiveAudioChunk, WebSocketMessage } from '@/lib/gemini-live-service' // Reuse types

export class UnifiedAIService {
  private static instance: UnifiedAIService
  private genAI: GoogleGenerativeAI
  private ws: WebSocket | null = null

  private constructor() {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }

  static getInstance(): UnifiedAIService {
    if (!this.instance) this.instance = new UnifiedAIService()
    return this.instance
  }

  // Chat: Send message with optional image
  async sendChatMessage(messages: Message[], data: { leadContext?: any; sessionId?: string } = {}): Promise<ReadableStream> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const systemPrompt = `You are F.B/c AI...` // Add full prompt
    const geminiContents: Content[] = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user' as const,
      parts: [{ text: m.content }] as Part[].concat(m.imageUrl ? [{ inlineData: { data: m.imageUrl.split(',')[1], mimeType: 'image/jpeg' } } as Part] : [])
    }))
    const systemContent: Content = { role: 'system', parts: [{ text: systemPrompt }] as Part[] }
    const result = await model.generateContentStream([systemContent, ...geminiContents])
    return new ReadableStream({ async start(controller) { for await (const chunk of result.stream) { controller.enqueue(new TextEncoder().encode(chunk.text())) } controller.close() } })
  }

  // Voice TTS:
  async generateTTS(text: string, voiceStyle: string = 'neutral'): Promise<LiveAudioChunk> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Generate speech for: ${text}` }] }],
      generationConfig: { responseMimeType: 'audio/mp3' }
    })
    const audioBase64 = result.response.candidates[0].content.parts[0].inlineData.data
    return { audioData: `data:audio/mp3;base64,${audioBase64}`, mimeType: 'audio/mp3', timestamp: Date.now() }
  }

  // Voice: Start live session (WebSocket)
  async startLiveSession(options: LiveConversationOptions): Promise<void> {
    // Connect WS as in gemini-live-service
  }

  // Vision:
  async analyzeImage(base64Data: string, type: 'webcam' | 'screen'): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const mimeType = 'image/jpeg' // Assume jpeg
    const result = await model.generateContent([
      { text: `Analyze this ${type} image for business insights.` },
      { inlineData: { data: base64Data, mimeType } }
    ])
    return result.response.text()
  }

  // Log activity to Supabase
  async logActivity(activity: { type: string; title: string; description: string; status: string; sessionId?: string }) {
    const { error } = await supabase.from('activities').insert(activity)
    if (error) console.error('Log failed:', error)
  }
}

export const unifiedAIService = UnifiedAIService.getInstance() 