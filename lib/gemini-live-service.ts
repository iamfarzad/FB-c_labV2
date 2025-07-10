import { supabase } from '@/lib/supabase/client'

export interface LiveConversationOptions {
  message?: string
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
  sessionId?: string
}

export interface LiveMessage {
  type: 'session_started' | 'text' | 'audio' | 'file' | 'turn_complete' | 'session_closed' | 'error'
  content?: string
  audioData?: string
  mimeType?: string
  fileUri?: string
  message?: string
}

export interface LiveAudioChunk {
  audioData: string
  mimeType: string
  timestamp: number
}

export class GeminiLiveService {
  private eventSource: EventSource | null = null
  private isConnected = false
  private sessionId: string | null = null
  private audioChunks: LiveAudioChunk[] = []
  private currentAudio: HTMLAudioElement | null = null
  
  // Event handlers
  private onMessageHandler?: (message: LiveMessage) => void
  private onAudioHandler?: (audioChunk: LiveAudioChunk) => void
  private onConnectedHandler?: () => void
  private onDisconnectedHandler?: () => void
  private onErrorHandler?: (error: string) => void

  constructor() {
    this.sessionId = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Set event handlers
  onMessage(handler: (message: LiveMessage) => void) {
    this.onMessageHandler = handler
  }

  onAudio(handler: (audioChunk: LiveAudioChunk) => void) {
    this.onAudioHandler = handler
  }

  onConnected(handler: () => void) {
    this.onConnectedHandler = handler
  }

  onDisconnected(handler: () => void) {
    this.onDisconnectedHandler = handler
  }

  onError(handler: (error: string) => void) {
    this.onErrorHandler = handler
  }

  // Start a live conversation
  async startConversation(options: LiveConversationOptions = {}): Promise<void> {
    try {
      // Close existing connection
      await this.disconnect()

      // Log activity start
      await this.logActivity({
        type: 'live_conversation_start',
        title: 'Starting Live Voice Conversation',
        description: 'Connecting to Gemini Live API',
        status: 'in_progress'
      })

      // Start new conversation
      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: options.message || 'Hello! Let\'s start a voice conversation.',
          leadContext: options.leadContext,
          sessionId: this.sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.statusText}`)
      }

      // Setup EventSource for streaming
      this.eventSource = new EventSource('/api/gemini-live-conversation')
      this.setupEventHandlers()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start Live conversation'
      console.error('Live conversation error:', errorMessage)
      this.onErrorHandler?.(errorMessage)
      
      await this.logActivity({
        type: 'error',
        title: 'Live Conversation Failed',
        description: errorMessage,
        status: 'failed'
      })
    }
  }

  // Setup EventSource handlers
  private setupEventHandlers() {
    if (!this.eventSource) return

    this.eventSource.onopen = () => {
      console.log('Live conversation connected')
      this.isConnected = true
      this.onConnectedHandler?.()
      
      this.logActivity({
        type: 'live_conversation_connected',
        title: 'Live Voice Connected',
        description: 'Real-time voice conversation established',
        status: 'completed'
      })
    }

    this.eventSource.onmessage = (event) => {
      try {
        const data: LiveMessage = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Failed to parse Live message:', error)
      }
    }

    this.eventSource.onerror = (error) => {
      console.error('Live conversation error:', error)
      this.isConnected = false
      this.onErrorHandler?.('Connection error occurred')
      
      this.logActivity({
        type: 'error',
        title: 'Live Connection Error',
        description: 'Connection to Live API lost',
        status: 'failed'
      })
    }
  }

  // Handle incoming messages
  private handleMessage(message: LiveMessage) {
    console.log('Live message received:', message.type)

    switch (message.type) {
      case 'session_started':
        this.logActivity({
          type: 'live_session_started',
          title: 'Live Session Started',
          description: 'Voice conversation session active',
          status: 'completed'
        })
        break

      case 'text':
        if (message.content) {
          this.logActivity({
            type: 'live_text_response',
            title: 'AI Response Generated',
            description: `Text: ${message.content.slice(0, 100)}...`,
            status: 'completed'
          })
        }
        break

      case 'audio':
        if (message.audioData) {
          const audioChunk: LiveAudioChunk = {
            audioData: message.audioData,
            mimeType: message.mimeType || 'audio/wav',
            timestamp: Date.now()
          }
          
          this.audioChunks.push(audioChunk)
          this.onAudioHandler?.(audioChunk)
          
          // Auto-play audio
          this.playAudio(message.audioData)
          
          this.logActivity({
            type: 'live_audio_generated',
            title: 'Voice Audio Generated',
            description: 'Real-time audio response received',
            status: 'completed'
          })
        }
        break

      case 'turn_complete':
        this.logActivity({
          type: 'live_turn_complete',
          title: 'Conversation Turn Complete',
          description: 'AI finished responding',
          status: 'completed'
        })
        break

      case 'session_closed':
        this.isConnected = false
        this.onDisconnectedHandler?.()
        this.logActivity({
          type: 'live_session_closed',
          title: 'Live Session Ended',
          description: 'Voice conversation session closed',
          status: 'completed'
        })
        break

      case 'error':
        this.onErrorHandler?.(message.message || 'Unknown error')
        this.logActivity({
          type: 'error',
          title: 'Live Conversation Error',
          description: message.message || 'Unknown error occurred',
          status: 'failed'
        })
        break
    }

    // Forward to message handler
    this.onMessageHandler?.(message)
  }

  // Play audio chunk
  private playAudio(audioData: string) {
    try {
      if (this.currentAudio) {
        this.currentAudio.pause()
      }

      this.currentAudio = new Audio(audioData)
      this.currentAudio.play().catch(error => {
        console.error('Failed to play audio:', error)
      })
    } catch (error) {
      console.error('Audio playback error:', error)
    }
  }

  // Send message to conversation
  async sendMessage(message: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to Live conversation')
    }

    try {
      await this.logActivity({
        type: 'live_user_message',
        title: 'User Message Sent',
        description: `Message: ${message.slice(0, 100)}...`,
        status: 'completed'
      })

      // Send message via API
      const response = await fetch('/api/gemini-live-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: this.sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      console.error('Send message error:', errorMessage)
      this.onErrorHandler?.(errorMessage)
    }
  }

  // Disconnect from conversation
  async disconnect(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }

    // Clean up session on server
    if (this.isConnected) {
      try {
        await fetch('/api/gemini-live-conversation', {
          method: 'DELETE'
        })
      } catch (error) {
        console.error('Failed to cleanup session:', error)
      }
    }

    this.isConnected = false
    this.audioChunks = []
    
    await this.logActivity({
      type: 'live_conversation_ended',
      title: 'Live Conversation Ended',
      description: 'Voice conversation disconnected',
      status: 'completed'
    })
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      sessionId: this.sessionId,
      audioChunksCount: this.audioChunks.length
    }
  }

  // Get audio history
  getAudioHistory(): LiveAudioChunk[] {
    return [...this.audioChunks]
  }

  // Clear audio history
  clearAudioHistory(): void {
    this.audioChunks = []
  }

  // Activity logging
  private async logActivity(activity: {
    type: string
    title: string
    description: string
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
  }) {
    try {
      const channel = supabase.channel(`live-activity-${this.sessionId}`)
      
      await channel.send({
        type: 'broadcast',
        event: 'activity-update',
        payload: {
          id: `${activity.type}_${Date.now()}`,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          status: activity.status,
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId
        }
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }
}

// Export singleton instance
export const geminiLiveService = new GeminiLiveService() 