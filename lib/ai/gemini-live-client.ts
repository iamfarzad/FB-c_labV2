/**
 * Gemini Live Client for Real-time AI Interactions
 * Integrated with Supabase Realtime for proper real-time functionality
 */

import { supabase } from '@/lib/supabase/client'

export interface LiveAPIConfig {
  model: string
  responseModalities: string[]
  systemInstruction?: string
  voiceName?: string
}

export interface LiveAPIResponse {
  text?: string
  audio?: ArrayBuffer
  image?: ArrayBuffer
}

export class GeminiLiveClient {
  private apiKey: string
  private config: LiveAPIConfig
  private sessionId: string
  private channel: any = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  // Event handlers
  public onSetupComplete?: () => void
  public onTextResponse?: (text: string) => void
  public onAudioResponse?: (audio: ArrayBuffer) => void
  public onImageResponse?: (image: ArrayBuffer) => void
  public onConnectionChange?: (connected: boolean) => void
  public onError?: (error: Error) => void
  public onTurnComplete?: () => void

  public connected = false

  constructor(apiKey: string, config: LiveAPIConfig, sessionId?: string) {
    this.apiKey = apiKey
    this.config = config
    this.sessionId = sessionId || `live-session-${Date.now()}`
  }

  async connect(): Promise<void> {
    try {
      console.log('🔗 Connecting to Gemini Live API via Supabase Realtime')

      // Create Supabase real-time channel
      this.channel = supabase
        .channel(`gemini-live-${this.sessionId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `metadata->>'sessionId'=eq.${this.sessionId}`
        }, (payload: any) => {
          this.handleRealtimeMessage(payload)
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_responses',
          filter: `session_id=eq.${this.sessionId}`
        }, (payload: any) => {
          this.handleAIResponse(payload)
        })
        .subscribe((status: any) => {
          console.log('📡 Supabase Realtime status:', status)
          this.connected = status === 'SUBSCRIBED'
          this.onConnectionChange?.(this.connected)

          if (this.connected) {
            this.onSetupComplete?.()
          }
        })

    } catch (error) {
      console.error('❌ Failed to connect to Gemini Live API:', error)
      this.onError?.(error as Error)
      throw error
    }
  }

  private handleRealtimeMessage(payload: any): void {
    try {
      const { new: newRecord } = payload

      if (newRecord.type === 'voice_input') {
        this.processVoiceInput(newRecord.data)
      } else if (newRecord.type === 'video_frame') {
        this.processVideoFrame(newRecord.data)
      } else if (newRecord.type === 'screen_frame') {
        this.processScreenFrame(newRecord.data)
      }
    } catch (error) {
      console.error('❌ Failed to handle real-time message:', error)
    }
  }

  private handleAIResponse(payload: any): void {
    try {
      const { new: response } = payload

      if (response.text) {
        this.onTextResponse?.(response.text)
      }

      if (response.audio_data) {
        const audioBuffer = this.base64ToArrayBuffer(response.audio_data)
        this.onAudioResponse?.(audioBuffer)
      }

      if (response.image_data) {
        const imageBuffer = this.base64ToArrayBuffer(response.image_data)
        this.onImageResponse?.(imageBuffer)
      }

      this.onTurnComplete?.()

    } catch (error) {
      console.error('❌ Failed to handle AI response:', error)
    }
  }

  private async processVoiceInput(audioData: string): Promise<void> {
    try {
      const response = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData,
          sessionId: this.sessionId,
          config: this.config
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const result = await response.json()

      await supabase.from('ai_responses').insert({
        session_id: this.sessionId,
        text: result.text,
        audio_data: result.audioData,
        response_type: 'voice',
        created_at: new Date().toISOString()
      })

    } catch (error) {
      console.error('❌ Failed to process voice input:', error)
      this.onError?.(error as Error)
    }
  }

  private async processVideoFrame(imageData: string): Promise<void> {
    try {
      const response = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          sessionId: this.sessionId,
          config: this.config,
          type: 'video_frame'
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const result = await response.json()

      await supabase.from('ai_responses').insert({
        session_id: this.sessionId,
        text: result.text,
        response_type: 'video_analysis',
        created_at: new Date().toISOString()
      })

    } catch (error) {
      console.error('❌ Failed to process video frame:', error)
      this.onError?.(error as Error)
    }
  }

  private async processScreenFrame(imageData: string): Promise<void> {
    try {
      const response = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          sessionId: this.sessionId,
          config: this.config,
          type: 'screen_frame'
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const result = await response.json()

      await supabase.from('ai_responses').insert({
        session_id: this.sessionId,
        text: result.text,
        response_type: 'screen_analysis',
        created_at: new Date().toISOString()
      })

    } catch (error) {
      console.error('❌ Failed to process screen frame:', error)
      this.onError?.(error as Error)
    }
  }

  sendRealtimeInput(inputs: (Blob | ArrayBuffer)[]): void {
    if (!this.connected) {
      console.warn('⚠️ Not connected to real-time system')
      return
    }

    try {
      Promise.all(inputs.map(async (input) => {
        if (input instanceof Blob) {
          return this.blobToBase64(input)
        } else {
          return this.arrayBufferToBase64(input)
        }
      })).then(async (base64Inputs) => {
        await supabase.from('activities').insert({
          type: 'realtime_input',
          session_id: this.sessionId,
          data: base64Inputs as any,
          metadata: {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('❌ Failed to send real-time input:', error)
      this.onError?.(error as Error)
    }
  }

  sendTextMessage(text: string): void {
    if (!this.connected) {
      console.warn('⚠️ Not connected to real-time system')
      return
    }

    supabase.from('activities').insert({
      type: 'text_message',
      session_id: this.sessionId,
      data: text,
      metadata: {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      }
    }).catch((error) => {
      console.error('❌ Failed to send text message:', error)
      this.onError?.(error as Error)
    })
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  disconnect(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
    }
    this.connected = false
    this.onConnectionChange?.(false)
  }

  isConnected(): boolean {
    return this.connected
  }
}
