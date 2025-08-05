import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

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
  sendAudioChunk: (audioData: ArrayBuffer, mimeType: string) => void
  playNextAudio: () => void
}

export function useWebSocketVoice(): WebSocketVoiceHook {
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

      const audioBuffer = await audioContextRef.current?.decodeAudioData(
        Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer
      ) as AudioBuffer

      const source = audioContextRef.current?.createBufferSource()
      if (source) {
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
  }, [initAudioContext]) // playNextAudioRef.current is stable, so not a dependency

  // Connect to WebSocket server
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.log('[useWebSocketVoice] WebSocket already connecting or open.')
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_LIVE_SERVER_URL || 'ws://localhost:3001'
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
      // No retry here, as this is a fundamental failure to even create the WS object
      return
    }

    ws.onopen = () => {
      console.log('✅ [useWebSocketVoice] WebSocket connected. State:', ws.readyState)
      setIsConnected(true)
      setError(null)
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
              leadContext: session?.leadContext
            })
            console.log('[useWebSocketVoice] Gemini session started.', data.payload)
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
      console.error('❌ [useWebSocketVoice] WebSocket raw error event:', error)
      const errorMessage = `WebSocket connection error: ${error.type}`;
      setError(errorMessage)
      setIsConnected(false)
      console.error(`[useWebSocketVoice] Error: ${errorMessage}. Current state: ${ws.readyState}`)
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive"
      })
      // Exponential backoff for reconnection
      if (ws.readyState === WebSocket.CLOSED) { // Only attempt reconnect if truly closed
        let retryDelay = 1000 + Math.random() * 2000; // 1-3 seconds initial delay
        console.log(`[useWebSocketVoice] Attempting to reconnect in ${retryDelay / 1000}s...`)
        setTimeout(connectWebSocket, retryDelay);
      }
    }

    ws.onclose = (event) => {
      console.log(`[useWebSocketVoice] WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason || 'N/A'}`)
      setIsConnected(false)
      setSession(null)
      setIsProcessing(false)
      setError(null)
      setAudioQueue([])
      setTranscript('') 

      // Attempt to reconnect only on abnormal closures or network issues
      // Common codes: 1000 (Normal), 1001 (Going Away), 1006 (Abnormal closure - often network/timeout)
      if (event.code === 1006 || (event.code !== 1000 && event.code !== 1001 && event.code !== 1005)) {
        let retryDelay = 1000 + Math.random() * 2000; // 1-3 seconds initial delay
        console.log(`[useWebSocketVoice] Attempting to reconnect due to unexpected close in ${retryDelay / 1000}s...`)
        setTimeout(connectWebSocket, retryDelay);
      } else {
        console.log('[useWebSocketVoice] Not attempting to reconnect for this close code.')
      }
    }
  }, [session, toast, playNextAudioRef]) 

  // Initial session setup (not auto-connect)
  const startSession = useCallback(async (leadContext?: any) => {
    try {
      setError(null)
      
      // Connect WebSocket if not connected. This call is non-blocking now.
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        console.log('[useWebSocketVoice] Initiating WebSocket connection via connectWebSocket()...')
        connectWebSocket()
      } else if (wsRef.current.readyState === WebSocket.CONNECTING) {
          console.log('[useWebSocketVoice] WebSocket is already connecting, waiting for open state.')
      } else if (wsRef.current.readyState === WebSocket.OPEN) {
          console.log('[useWebSocketVoice] WebSocket is already open, proceeding with start message.')
      }

      // Wait for connection to open, with a fixed timeout
      const connectionStartTime = Date.now();
      const connectionTimeout = 5000; // 5 seconds to get OPEN

      while (wsRef.current?.readyState !== WebSocket.OPEN) {
          if (Date.now() - connectionStartTime > connectionTimeout) {
              console.error('❌ [useWebSocketVoice] WebSocket connection timed out waiting for OPEN state.');
              setError('WebSocket connection timed out.');
              throw new Error("WebSocket connection timed out during startSession.");
          }
          console.log('[useWebSocketVoice] Waiting for WebSocket to be OPEN... Current state:', wsRef.current?.readyState);
          await new Promise(resolve => setTimeout(resolve, 200)); // Polling interval
      }
      console.log('[useWebSocketVoice] WebSocket is OPEN, sending start message.')

      // Send a 'start' message to the WebSocket server
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const message = {
          type: 'start',
          payload: { leadContext }
        }
        wsRef.current.send(JSON.stringify(message))
        setIsProcessing(true)
        console.log('📤 [useWebSocketVoice] Sent start message to WebSocket server', leadContext)
      } else {
          console.error('[useWebSocketVoice] WebSocket not open to send start message. Final state:', wsRef.current?.readyState)
          throw new Error("WebSocket not open to send start message.")
      }

    } catch (error) {
      console.error('❌ [useWebSocketVoice] Error in startSession:', error)
      // Ensure client state reflects error, but don't endlessly retry here
      setIsConnected(false);
      setIsProcessing(false);
      if (error instanceof Error && !error.message.includes("timed out")){
        toast({
          title: "Session Start Failed",
          description: error.message,
          variant: "destructive"
        });
      }
      throw error // Re-throw to propagate to component
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
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('📤 Sending text message via WebSocket:', message)
      const payload = { type: 'user_message', payload: { message } }
      wsRef.current.send(JSON.stringify(payload))
    } else {
      console.error('❌ WebSocket not open, cannot send message')
      throw new Error('WebSocket connection not active.')
    }
  }, [])

  const sendAudioChunk = useCallback((audioData: ArrayBuffer, mimeType: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log(`[useWebSocketVoice] Attempting to send audio chunk: ${audioData.byteLength} bytes, type: ${mimeType}`)
      // Convert ArrayBuffer to base64 for sending over WebSocket
      const payload = {
        type: 'user_audio', // A new type for audio chunks
        payload: { audioData: Buffer.from(audioData).toString('base64'), mimeType }
      }
      wsRef.current?.send(JSON.stringify(payload))
      console.log(`[useWebSocketVoice] Sent audio chunk to WebSocket: ${payload.payload.audioData.length} base64 chars`)
    } else {
      console.warn('WebSocket not open, cannot send audio chunk')
    }
  }, [])

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
    sendAudioChunk,
    playNextAudio: playNextAudioRef.current, // Expose the stable ref
  }
}