import { WebSocketServer, WebSocket } from 'ws'
import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from '@google/genai'
import { v4 as uuidv4 } from 'uuid'

const PORT = process.env.LIVE_SERVER_PORT || 3001
const wss = new WebSocketServer({ port: Number(PORT) })

// In-memory session management
const activeSessions = new Map<string, { ws: WebSocket; session: Session }>()

console.log(`🚀 Gemini Live WebSocket server started on port ${PORT}`)

wss.on('connection', (ws: WebSocket) => {
  const connectionId = uuidv4()
  console.log(`[${connectionId}] Client connected.`)

  ws.on('message', async (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString())
      console.log(`[${connectionId}] Received message type: ${data.type}`)

      switch (data.type) {
        case 'start':
          await handleStart(connectionId, ws, data.payload)
          break
        case 'user_message':
          await handleUserMessage(connectionId, data.payload)
          break
        default:
          console.warn(`[${connectionId}] Unknown message type: ${data.type}`)
          ws.send(JSON.stringify({ type: 'error', payload: { message: 'Unknown message type' } }))
      }
    } catch (error) {
      console.error(`[${connectionId}] Error processing message:`, error)
      ws.send(JSON.stringify({ type: 'error', payload: { message: 'Failed to process message' } }))
    }
  })

  ws.on('close', () => {
    handleClose(connectionId)
  })

  ws.on('error', (error) => {
    console.error(`[${connectionId}] WebSocket error:`, error)
    handleClose(connectionId)
  })
})

async function handleStart(connectionId: string, ws: WebSocket, payload: any) {
  if (activeSessions.has(connectionId)) {
    console.log(`[${connectionId}] Session already exists. Closing old one.`)
    await activeSessions.get(connectionId)?.session.close()
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error(`[${connectionId}] GEMINI_API_KEY not configured.`)
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'GEMINI_API_KEY not configured' } }))
    return
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const model = 'models/gemini-2.5-flash-exp-native-audio-thinking-dialog'
    
    // NOTE: The system instruction is simplified here for clarity.
    // You can re-integrate the full version from your original file.
    const systemInstruction = `You are F.B/c AI, a unified multimodal assistant for business consulting. Capabilities:
- Voice: Real-time conversation, TTS responses.
- Vision: Analyze webcam/screenshare images for insights.
- Chat: Streaming text with context.
- Integration: Combine modalities (e.g., describe image verbally).
Personalize for user: ${payload.leadContext ? `Name: ${payload.leadContext.name || ''}, Company: ${payload.leadContext.company || ''}, Role: ${payload.leadContext.role || ''}, Interests: ${payload.leadContext.interests || ''}` : 'General user'}.
Keep responses concise, professional. On errors, apologize and suggest retry.`

    const config = {
      responseModalities: [Modality.AUDIO, Modality.TEXT],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
      },
      contextWindowCompression: {
        slidingWindow: { targetTokens: '12800' }
      },
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
    }

    const session = await ai.live.connect({
      model,
      config,
      callbacks: {
        onopen: () => {
          console.log(`[${connectionId}] Gemini Live session opened.`)
          ws.send(JSON.stringify({ type: 'session_started', payload: { connectionId } }))
        },
        onmessage: (message: LiveServerMessage) => {
          handleGeminiMessage(connectionId, ws, message)
        },
        onerror: (e: ErrorEvent) => {
          console.error(`[${connectionId}] Gemini Live error:`, e.message)
          ws.send(JSON.stringify({ type: 'error', payload: { message: `Gemini Error: ${e.message || 'Unknown'}` } }))
          if (e.message.includes('API key')) {
            // Specific handling
            handleClose(connectionId)
          }
        },
        onclose: (e: CloseEvent) => {
          console.log(`[${connectionId}] Gemini Live session closed:`, e.reason)
          ws.send(JSON.stringify({ type: 'session_closed', payload: { reason: e.reason } }))
          handleClose(connectionId)
        },
      },
    })
    
    activeSessions.set(connectionId, { ws, session })
    console.log(`[${connectionId}] Active session stored. Total sessions: ${activeSessions.size}`)

    // Send initial message if provided
    if (payload.message) {
      session.sendClientContent({
        turns: [{ role: 'user', parts: [{ text: payload.message }] }],
        turnComplete: true,
      })
    }

  } catch (error) {
    console.error(`[${connectionId}] Failed to start Gemini session:`, error)
    ws.send(JSON.stringify({ type: 'error', payload: { message: error instanceof Error ? error.message : 'Failed to start session' } }))
  }
}

function handleGeminiMessage(connectionId: string, ws: WebSocket, message: LiveServerMessage) {
  const client = activeSessions.get(connectionId)
  if (!client || client.ws.readyState !== WebSocket.OPEN) {
    console.log(`[${connectionId}] WS closed or session not found, skipping Gemini message.`)
    return
  }

  // Forward the relevant parts of the message to the client
  if (message.serverContent?.modelTurn?.parts) {
    const part = message.serverContent.modelTurn.parts[0]
    if (part.text) {
      ws.send(JSON.stringify({ type: 'text', payload: { content: part.text } }))
    }
    if (part.inlineData) {
      // Sending raw base64 data. Client will handle WAV conversion if needed, or play directly.
      ws.send(JSON.stringify({ type: 'audio', payload: { audioData: part.inlineData.data, mimeType: part.inlineData.mimeType } }))
    }
  }

  if (message.serverContent?.turnComplete) {
    ws.send(JSON.stringify({ type: 'turn_complete' }))
  }
}

async function handleUserMessage(connectionId: string, payload: any) {
  const client = activeSessions.get(connectionId)
  if (!client) {
    console.warn(`[${connectionId}] Session not found for user message.`)
    return
  }

  console.log(`[${connectionId}] Sending user text to Gemini: "${payload.message.slice(0, 50)}..."`)
  await client.session.sendClientContent({
    turns: [{ role: 'user', parts: [{ text: payload.message }] }],
    turnComplete: true,
  })
}

function handleClose(connectionId: string) {
  const client = activeSessions.get(connectionId)
  if (client) {
    console.log(`[${connectionId}] Closing session and cleaning up resources.`)
    try {
      client.session.close()
    } catch (e: any) {
      console.error(`[${connectionId}] Error closing Gemini session:`, e)
    }
    if(client.ws.readyState === WebSocket.OPEN) {
        client.ws.close()
    }
    activeSessions.delete(connectionId)
    console.log(`[${connectionId}] Session removed. Total sessions: ${activeSessions.size}`)
  }
} 