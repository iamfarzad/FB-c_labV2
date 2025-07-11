import { supabase } from '@/lib/supabase/client'

export interface LiveConversationOptions {
  message?: string
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
}

// Updated message format for WebSocket communication
export interface WebSocketMessage {
  type: 'session_started' | 'text' | 'audio' | 'turn_complete' | 'session_closed' | 'error'
  payload?: any 
}

export interface LiveAudioChunk {
  audioData: string
  mimeType: string
  timestamp: number
}

export class GeminiLiveService {
  private ws: WebSocket | null = null
  private isConnected = false
  private connectionId: string | null = null
  private audioChunks: LiveAudioChunk[] = []
  
  private onMessageHandler?: (message: WebSocketMessage) => void
  private onAudioHandler?: (audioChunk: LiveAudioChunk) => void
  private onConnectedHandler?: (connectionId: string) => void
  private onDisconnectedHandler?: () => void
  private onErrorHandler?: (error: string) => void

  // Set event handlers
  onMessage(handler: (message: WebSocketMessage) => void) {
    this.onMessageHandler = handler
  }

  onAudio(handler: (audioChunk: LiveAudioChunk) => void) {
    this.onAudioHandler = handler
  }

  onConnected(handler: (connectionId: string) => void) {
    this.onConnectedHandler = handler
  }

  onDisconnected(handler: () => void) {
    this.onDisconnectedHandler = handler
  }

  onError(handler: (error: string) => void) {
    this.onErrorHandler = handler
  }

  // Connect to the WebSocket server
  async connect(options: LiveConversationOptions = {}): Promise<void> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured.')
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('Already connected.')
      return
    }

    await this.disconnect() // Ensure any old connection is closed

    // Use environment variable for WebSocket URL, fallback for local dev
    const wsUrl = process.env.NEXT_PUBLIC_LIVE_SERVER_URL || 'ws://localhost:3001'
    
    this.ws = new WebSocket(wsUrl)
    this.setupWebsocketHandlers()

    this.ws.onopen = () => {
      console.log('WebSocket connection established.')
      // Send start message to initiate Gemini Live session on the backend
      this.ws?.send(JSON.stringify({
        type: 'start',
        payload: {
          message: options.message || `Hello! I'd like to start a live voice conversation to discuss AI consulting opportunities.`,
          leadContext: options.leadContext,
        }
      }))
      
      this.logActivity({
        type: 'live_conversation_start',
        title: 'Connecting to Live Voice...',
        description: 'Establishing WebSocket connection',
        status: 'in_progress'
      })
    }
  }
  
  private setupWebsocketHandlers() {
    if (!this.ws) return

    this.ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
        this.onErrorHandler?.('Failed to parse server message.')
      }
    }

    this.ws.onerror = (event) => {
      console.error('WebSocket error:', event)
      this.isConnected = false
      this.onErrorHandler?.('Connection error occurred.')
      this.logActivity({
        type: 'error',
        title: 'Live Connection Error',
        description: 'Connection to WebSocket server lost',
        status: 'failed'
      })
    }
    
    this.ws.onclose = () => {
      console.log('WebSocket connection closed.')
      this.isConnected = false
      this.connectionId = null
      this.onDisconnectedHandler?.()
    }
  }

  // Handle incoming messages
  private handleMessage(message: WebSocketMessage) {
    console.log('WebSocket message received:', message.type)

    switch (message.type) {
      case 'session_started':
        this.isConnected = true
        this.connectionId = message.payload.connectionId
        this.onConnectedHandler?.(this.connectionId!)
        this.logActivity({
          type: 'live_session_started',
          title: 'Live Session Started',
          description: `Voice conversation session active: ${this.connectionId}`,
          status: 'completed'
        })
        break

      case 'audio':
        if (message.payload?.audioData) {
          const audioChunk: LiveAudioChunk = {
            audioData: `data:${message.payload.mimeType};base64,${message.payload.audioData}`,
            mimeType: message.payload.mimeType || 'audio/opus',
            timestamp: Date.now()
          }
          this.audioChunks.push(audioChunk)
          this.onAudioHandler?.(audioChunk)
        }
        break

      case 'session_closed':
        this.disconnect()
        break

      case 'error':
        this.onErrorHandler?.(message.payload?.message || 'Unknown server error')
        this.logActivity({
          type: 'error',
          title: 'Live Conversation Error',
          description: message.payload?.message || 'Unknown error occurred on the server',
          status: 'failed'
        })
        break
    }
    this.onMessageHandler?.(message)
  }

  // Send message to conversation
  async sendMessage(message: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.onErrorHandler?.('Not connected. Cannot send message.')
      console.error('Not connected to Live conversation')
      return
    }

    this.ws.send(JSON.stringify({
      type: 'user_message',
      payload: { message }
    }))

    this.logActivity({
      type: 'live_user_message',
      title: 'User Message Sent',
      description: `Message: ${message.slice(0, 100)}...`,
      status: 'completed'
    })
  }

  // Disconnect from conversation
  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.audioChunks = []
    
    this.logActivity({
      type: 'live_conversation_ended',
      title: 'Live Conversation Ended',
      description: 'Voice conversation disconnected',
      status: 'completed'
    })

    this.onDisconnectedHandler?.()
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      sessionId: this.connectionId,
      audioChunksCount: this.audioChunks.length
    }
  }

  getAudioHistory(): LiveAudioChunk[] {
    return [...this.audioChunks]
  }

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
    if (!this.connectionId) return // Don't log if not connected
    try {
      const channel = supabase.channel(`live-activity-${this.connectionId}`)
      
      await channel.send({
        type: 'broadcast',
        event: 'activity-update',
        payload: {
          id: `${activity.type}_${Date.now()}`,
          ...activity,
          timestamp: new Date().toISOString(),
          sessionId: this.connectionId
        }
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }
}

// Export singleton instance
export const geminiLiveService = new GeminiLiveService() 