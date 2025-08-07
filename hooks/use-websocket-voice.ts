import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

// WebSocket URL will be configured in the connectWebSocket function

interface VoiceSession {
  connectionId: string
  isActive: boolean
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
}

interface WebSocketVoiceHook {
  session: VoiceSession | null
  isConnected: boolean
  isProcessing: boolean
  error: string | null
  transcript: string
  audioQueue: ArrayBuffer[]
  startSession: (leadContext?: any) => Promise<void>
  stopSession: () => void
  sendMessage: (message: string) => Promise<void>
  playNextAudio: () => void
  // Callbacks for voice recorder integration
  onAudioChunk: (chunk: ArrayBuffer) => void
  onTurnComplete: () => void
}

export function useWebSocketVoice(): WebSocketVoiceHook {
  console.log('--- useWebSocketVoice HOOK MOUNTED ---');
  const { toast } = useToast()
  const [session, setSession] = useState<VoiceSession | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [audioQueue, setAudioQueue] = useState<ArrayBuffer[]>([])
  
  const wsRef = useRef<WebSocket | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioStreamRef = useRef<MediaStream | null>(null)
  const reconnectingRef = useRef(false)
  const messageQueueRef = useRef<string[]>([])

  // Audio playback context and playing state
  const audioContextRef = useRef<AudioContext | null>(null)
  const isPlayingRef = useRef(false)

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    // Resume context if suspended (needed for autoplay)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  // Declare playAudio and playNextAudio functions as refs to ensure stable references across renders
  // This prevents them from being re-created constantly and breaking useEffect/useCallback dependencies
  const playAudioRef = useRef((base64Audio: string, mimeType: string) => {})
  const playNextAudioRef = useRef(() => {})

  // Play next audio from queue (defined first)
  playNextAudioRef.current = useCallback(() => {
    if (!isPlayingRef.current && audioQueue.length > 0) {
      const nextAudio = audioQueue[0]
      setAudioQueue(prev => prev.slice(1))
      
      playAudioRef.current(nextAudio as unknown as string, 'audio/wav') 
    }
  }, [audioQueue]) // playAudioRef.current is stable, so not a dependency

  // Audio playback logic (depends on playNextAudio, so defined after it is stable)
  playAudioRef.current = useCallback(async (base64Audio: string, mimeType: string) => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      initAudioContext()
    }
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    try {
      isPlayingRef.current = true

      // Fix: Properly decode base64 audio data
      let audioData: ArrayBuffer
      if (typeof base64Audio === 'string') {
        try {
          // Convert base64 string to ArrayBuffer
          const binaryString = atob(base64Audio)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          audioData = bytes.buffer
        } catch (error) {
          console.error('❌ Invalid base64 audio data:', error)
          throw new Error('Failed to decode base64 audio data')
        }
      } else {
        // If it's already an ArrayBuffer, use it directly
        audioData = base64Audio as unknown as ArrayBuffer
      }
      const audioBuffer = await audioContextRef.current?.decodeAudioData(audioData) as AudioBuffer

      const source = audioContextRef.current?.createBufferSource()
      if (source && audioContextRef.current) {
        source.buffer = audioBuffer
        source.connect(audioContextRef.current.destination)
        source.onended = () => {
          isPlayingRef.current = false
          playNextAudioRef.current() // Use the stable ref
        }
        source.start(0)
      } else {
        throw new Error('AudioBufferSourceNode not created')
      }
    } catch (error) {
      console.error('❌ Error playing audio:', error)
      isPlayingRef.current = false
      playNextAudioRef.current() // Use the stable ref
    }
  }, [initAudioContext, playNextAudioRef]) // Add playNextAudioRef as dependency to ensure latest version

  // Connect to WebSocket server (only when explicitly called)
  const connectWebSocket = useCallback(() => {
    if (reconnectingRef.current) {
      console.log('[useWebSocketVoice] Reconnect already in progress, skipping...')
      return
    }
    reconnectingRef.current = true

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.log('[useWebSocketVoice] WebSocket already connecting or open.')
      reconnectingRef.current = false
      return
    }

    // Cleanup old WebSocket before creating a new one
    if (wsRef.current) {
      try {
        wsRef.current.onopen = null
        wsRef.current.onmessage = null
        wsRef.current.onerror = null
        wsRef.current.onclose = null
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close(1000, 'Recreating connection')
        }
      } catch (e) {
        console.warn('[useWebSocketVoice] Error cleaning up old WebSocket:', e)
      }
      wsRef.current = null
    }

    // Production uses port 8080 on Fly.io, local development uses 3001
    const wsUrl = process.env.NEXT_PUBLIC_LIVE_SERVER_URL || 'wss://localhost:3001'
    console.log(`🔌 [useWebSocketVoice] Attempting to connect to WebSocket: ${wsUrl}`)
    console.log('🌐 [useWebSocketVoice] Current page URL:', window.location.href)
    console.log('🔒 [useWebSocketVoice] Page protocol:', window.location.protocol)
    
    // Set initial state to connecting
    setIsConnected(false)
    setError(null)
    setSession(null) // Clear previous session info

    let ws: WebSocket
    try {
      ws = new WebSocket(wsUrl)
      wsRef.current = ws
      console.log('[useWebSocketVoice] WebSocket object created successfully.')
    } catch (error) {
      console.error('❌ [useWebSocketVoice] Failed to create WebSocket:', error)
      setError(`Failed to create WebSocket connection: ${error instanceof Error ? error.message : 'Unknown error'}`)
      reconnectingRef.current = false
      return
    }

    ws.onopen = () => {
      console.log('✅ [useWebSocketVoice] WebSocket connected. State:', ws.readyState)
      setIsConnected(true)
      setError(null)
      reconnectingRef.current = false

      // Flush queued messages
      while (messageQueueRef.current.length > 0 && ws.readyState === WebSocket.OPEN) {
        const msg = messageQueueRef.current.shift()
        if (msg) {
          ws.send(msg)
          console.log('📤 [useWebSocketVoice] Sent queued message')
        }
      }
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log(`📨 [useWebSocketVoice] Received message type: ${data.type}`)
        console.log('[useWebSocketVoice] Received message from server:', data)

        switch (data.type) {
          case 'connected':
            console.log('[useWebSocketVoice] Server acknowledged connection:', data.payload)
            break
            
          case 'session_started':
            setSession({
              connectionId: data.payload.connectionId,
              isActive: true,
            })
            console.log('[useWebSocketVoice] Gemini session started.', data.payload)
            break

          case 'gemini_response':
            // Handle text part of the response
            if (data.payload?.serverContent?.modelTurn?.parts?.[0]?.text) {
              const text = data.payload.serverContent.modelTurn.parts[0].text;
              setTranscript(prev => prev + text);
            }
            // Handle audio part of the response
            if (data.payload?.serverContent?.modelTurn?.inlineData?.data) {
              const audioBase64 = data.payload.serverContent.modelTurn.inlineData.data;
              const audioBlob = new Blob([Buffer.from(audioBase64, 'base64')], { type: 'audio/mpeg' });
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              audio.play();
            }
            if (data.payload?.serverContent?.turnComplete) {
                if (onTurnComplete) {
                    onTurnComplete();
                }
            }
            break

          case 'text':
            setTranscript(data.payload.content)
            console.log('[useWebSocketVoice] Received text from Gemini:', data.payload.content)
            break

          case 'audio':
            if (data.payload.audioData) {
              setAudioQueue(prev => [...prev, data.payload.audioData])
              playNextAudioRef.current() 
              console.log('[useWebSocketVoice] Received audio from Gemini, queued for playback.', data.payload.audioData.length, 'bytes')
            }
            break

          case 'turn_complete':
            setIsProcessing(false)
            console.log('[useWebSocketVoice] Turn completed by Gemini.')
            break

          case 'error':
            const errorMessage = data.payload?.message || 'Unknown WebSocket error'
            console.error('❌ [useWebSocketVoice] WebSocket error from server:', errorMessage)
            setError(errorMessage)
            toast({
              title: "Voice Error",
              description: errorMessage,
              variant: "destructive"
            })
            break

          case 'session_closed':
            console.log('[useWebSocketVoice] Session closed:', data.payload.reason)
            setSession(null)
            console.log('[useWebSocketVoice] Gemini session closed. Reason:', data.payload.reason)
            break
          default:
            console.warn(`[useWebSocketVoice] Unhandled message type from server: ${data.type}`)
            break;
        }
      } catch (error) {
        console.error('[useWebSocketVoice] Error parsing WebSocket message:', error)
      }
    }

    ws.onerror = (error: Event) => {
      console.error('❌ [useWebSocketVoice] WebSocket raw error event:', {
        type: error.type,
        target: error.target,
        timeStamp: error.timeStamp,
        wsUrl,
        readyState: ws.readyState,
        readyStateText: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.readyState]
      })
      const errorMessage = `WebSocket connection error: ${error.type || 'Unknown error'}`;
      setError(errorMessage)
      setIsConnected(false)
      reconnectingRef.current = false
      console.error(`[useWebSocketVoice] Error: ${errorMessage}. Current state: ${ws.readyState} (${['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.readyState]})`)
      toast({
        title: "Connection Error",
        description: `${errorMessage}. Check if the WebSocket server is running.`,
        variant: "destructive"
      })
      // Don't auto-reconnect on error - let user manually retry
    }

    ws.onclose = (event) => {
      console.log(`[useWebSocketVoice] WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason || 'N/A'}`)
      setIsConnected(false)
      setSession(null)
      setIsProcessing(false)
      setError(null)
      setAudioQueue([])
      setTranscript('')
      reconnectingRef.current = false

      // Don't auto-reconnect - let the component decide when to reconnect
      console.log('[useWebSocketVoice] Connection closed, waiting for manual reconnection.')
    }
  }, [toast, playNextAudioRef])

  // Initial session setup (not auto-connect)
  const startSession = useCallback(async (leadContext?: any) => {
    try {
      setError(null)
      
      // Connect WebSocket if not connected
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        console.log('[useWebSocketVoice] Initiating WebSocket connection via connectWebSocket()...')
        connectWebSocket()
      } else if (wsRef.current.readyState === WebSocket.CONNECTING) {
          console.log('[useWebSocketVoice] WebSocket is already connecting, waiting for open state.')
      } else if (wsRef.current.readyState === WebSocket.OPEN) {
          console.log('[useWebSocketVoice] WebSocket is already open, proceeding with start message.')
      }

      // Wait for connection to open with better error handling
      const connectionStartTime = Date.now();
      const connectionTimeout = 10000; // Increased to 10 seconds
      let lastState = wsRef.current?.readyState;

      return new Promise<void>((resolve, reject) => {
        const checkConnection = () => {
          const currentState = wsRef.current?.readyState;
          
          // Log state changes for debugging
          if (currentState !== lastState) {
            const stateText = currentState !== undefined
              ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][currentState]
              : 'UNKNOWN';
            console.log(
              `[useWebSocketVoice] WebSocket state changed: ${lastState} -> ${currentState} (${stateText})`
            );
            lastState = currentState;
          }

          if (currentState === WebSocket.OPEN) {
            console.log('[useWebSocketVoice] WebSocket is OPEN, sending start message.')
            
            // Send start message
            const message = {
              type: 'start',
              payload: { leadContext }
            }
            wsRef.current!.send(JSON.stringify(message))
            setIsProcessing(true)
            console.log('📤 [useWebSocketVoice] Sent start message to WebSocket server', leadContext)
            resolve()
            return
          }

          if (currentState === WebSocket.CLOSED) {
            const errorMsg = 'WebSocket closed before connection could be established.'
            console.error(`❌ [useWebSocketVoice] ${errorMsg}`)
            setError(errorMsg)
            reject(new Error(errorMsg))
            return
          }

          if (Date.now() - connectionStartTime > connectionTimeout) {
            const errorMsg = `WebSocket connection timed out after ${connectionTimeout/1000}s. Current state: ${['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][currentState || 3]}`
            console.error(`❌ [useWebSocketVoice] ${errorMsg}`)
            setError('WebSocket connection timed out.')
            reject(new Error(errorMsg))
            return
          }

          // Continue checking
          setTimeout(checkConnection, 100)
        }

        checkConnection()
      })

    } catch (error) {
      console.error('❌ [useWebSocketVoice] Error in startSession:', error)
      setIsConnected(false)
      setIsProcessing(false)
      
      if (error instanceof Error) {
        toast({
          title: "Session Start Failed",
          description: error.message,
          variant: "destructive"
        })
      }
      throw error
    }
  }, [connectWebSocket, toast])

  const stopSession = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('🔌 [useWebSocketVoice] Closing WebSocket connection...')
      wsRef.current.close(1000, "User initiated close") // Explicitly send normal closure code
      setSession(null)
      setIsConnected(false)
      setIsProcessing(false)
      setError(null)
      setAudioQueue([])
      setTranscript('') 
    }
  }, [])

  const sendMessage = useCallback(async (message: string) => {
    const payload = JSON.stringify({ type: 'user_message', payload: { message } })
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('📤 Sending text message via WebSocket:', message)
      wsRef.current.send(payload)
    } else {
      console.warn('WebSocket not open, queueing message')
      messageQueueRef.current.push(payload)
      if (!reconnectingRef.current) {
        connectWebSocket() // Try reconnecting if not already doing so
      }
    }
  }, [connectWebSocket])

  // Callback for voice recorder - properly encode audio data as base64
  const onAudioChunk = useCallback((audioData: ArrayBuffer) => {
    // Convert ArrayBuffer to base64 string
    let binary = '';
    const bytes = new Uint8Array(audioData);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64Audio = btoa(binary);
    
    const payload = JSON.stringify({
      type: 'user_audio',
      payload: { 
        audioData: base64Audio,
        mimeType: 'audio/pcm;rate=16000'
      }
    })
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log(`[useWebSocketVoice] Sending audio chunk: ${audioData.byteLength} bytes`)
      wsRef.current.send(payload)
    } else {
      console.warn('WebSocket not open, queueing audio chunk')
      messageQueueRef.current.push(payload)
      if (!reconnectingRef.current) {
        connectWebSocket()
      }
    }
  }, [connectWebSocket])

  // Callback for voice recorder - signal turn complete
  const onTurnComplete = useCallback(() => {
    const payload = JSON.stringify({
      type: 'TURN_COMPLETE',
      payload: {}
    })
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[useWebSocketVoice] 🎯 Sending TURN_COMPLETE signal after VAD delay')
      wsRef.current.send(payload)
    } else {
      console.warn('WebSocket not open, queueing turn complete')
      messageQueueRef.current.push(payload)
      if (!reconnectingRef.current) {
        connectWebSocket()
      }
    }
  }, [connectWebSocket])

  // Cleanup useEffect for lifecycle debugging
  useEffect(() => {
    return () => {
      console.log('--- useWebSocketVoice HOOK UNMOUNTING (Cleanup) ---');
      wsRef.current?.close();
    };
  }, []);

  return {
    session,
    isConnected,
    isProcessing,
    error,
    transcript,
    audioQueue,
    startSession,
    stopSession,
    sendMessage,
    playNextAudio: playNextAudioRef.current, // Expose the stable ref
    // Callbacks for voice recorder integration
    onAudioChunk,
    onTurnComplete,
  }
}
