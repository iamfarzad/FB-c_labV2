import { WebSocketServer, WebSocket } from 'ws'
import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from '@google/genai'
import { v4 as uuidv4 } from 'uuid'
import { Buffer } from 'buffer' // Explicitly import Buffer
import * as http from 'http'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Cost management and budget controls
interface SessionBudget {
  connectionId: string
  messageCount: number
  totalTokensUsed: number
  totalCost: number
  startTime: Date
  lastMessageTime: Date
  dailyTokenLimit: number
  perRequestTokenLimit: number
  isBlocked: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Cost calculation constants (based on Gemini 2.0 Flash pricing)
const COST_PER_1K_INPUT_TOKENS = 0.075 / 1000  // $0.075 per 1K input tokens
const COST_PER_1K_OUTPUT_TOKENS = 0.30 / 1000  // $0.30 per 1K output tokens

// Budget limits (matching existing system)
const DEFAULT_DAILY_TOKEN_LIMIT = 10000      // 10K tokens per day per session
const DEFAULT_PER_REQUEST_LIMIT = 500        // 500 tokens per request
const MAX_MESSAGES_PER_SESSION = 50          // Maximum messages per session
const RATE_LIMIT_WINDOW = 60000             // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20          // 20 requests per minute
const DUPLICATE_PREVENTION_WINDOW = 5000    // 5 seconds between identical requests

// Use PORT from Fly.io, fallback to LIVE_SERVER_PORT, then default
const PORT = process.env.PORT || process.env.LIVE_SERVER_PORT || 8080
const wss = new WebSocketServer({ 
  noServer: true, // Don't create HTTP server, we'll use our own
  perMessageDeflate: false, // Disable compression for lower latency
  clientTracking: true,
  maxPayload: 100 * 1024 * 1024 // 100MB max payload
})

// Add HTTP server for health checks (required by Fly.io)
const healthServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('OK')
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ 
      status: 'running', 
      connections: activeSessions.size,
      port: PORT 
    }))
  } else {
    res.writeHead(404)
    res.end()
  }
})

// Use same port but handle HTTP upgrade for WebSocket
const server = healthServer.listen(Number(PORT), () => {
  console.log(`🚀 WebSocket server listening on port ${PORT}`)
  console.log(`💚 Health check available at http://localhost:${PORT}/health`)
})

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request)
  })
})

// In-memory session management
const activeSessions = new Map<string, { ws: WebSocket; session: Session }>()
const sessionBudgets = new Map<string, SessionBudget>()
const rateLimits = new Map<string, RateLimitEntry>() // IP-based rate limiting
const recentMessages = new Map<string, { message: string; timestamp: number }>() // Duplicate prevention
const bufferedAudioChunks = new Map<string, ArrayBuffer[]>() // New: store audio chunks per session

// Budget management functions
function initializeSessionBudget(connectionId: string): SessionBudget {
  const budget: SessionBudget = {
    connectionId,
    messageCount: 0,
    totalTokensUsed: 0,
    totalCost: 0,
    startTime: new Date(),
    lastMessageTime: new Date(),
    dailyTokenLimit: DEFAULT_DAILY_TOKEN_LIMIT,
    perRequestTokenLimit: DEFAULT_PER_REQUEST_LIMIT,
    isBlocked: false
  }
  sessionBudgets.set(connectionId, budget)
  return budget
}

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now()
  const entry = rateLimits.get(clientIP)
  
  if (!entry || now > entry.resetTime) {
    // Reset rate limit window
    rateLimits.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false // Rate limit exceeded
  }
  
  entry.count++
  return true
}

function checkDuplicateMessage(connectionId: string, message: string): boolean {
  const messageKey = `${connectionId}:${message}`
  const recent = recentMessages.get(messageKey)
  const now = Date.now()
  
  if (recent && (now - recent.timestamp) < DUPLICATE_PREVENTION_WINDOW) {
    return true // Duplicate detected
  }
  
  recentMessages.set(messageKey, { message, timestamp: now })
  
  // Cleanup old entries
  for (const [key, entry] of recentMessages.entries()) {
    if (now - entry.timestamp > DUPLICATE_PREVENTION_WINDOW) {
      recentMessages.delete(key)
    }
  }
  
  return false
}

function checkSessionBudget(connectionId: string, estimatedTokens: number): { 
  allowed: boolean; 
  reason?: string; 
  budget: SessionBudget | null 
} {
  const budget = sessionBudgets.get(connectionId)
  if (!budget) {
    return { allowed: false, reason: 'Session budget not initialized', budget: null }
  }
  
  if (budget.isBlocked) {
    return { allowed: false, reason: 'Session blocked due to budget violations', budget }
  }
  
  // Check per-request token limit
  if (estimatedTokens > budget.perRequestTokenLimit) {
    return { 
      allowed: false, 
      reason: `Request exceeds token limit: ${estimatedTokens} > ${budget.perRequestTokenLimit}`,
      budget 
    }
  }
  
  // Check daily token limit
  if (budget.totalTokensUsed + estimatedTokens > budget.dailyTokenLimit) {
    return { 
      allowed: false, 
      reason: `Daily token limit exceeded: ${budget.totalTokensUsed + estimatedTokens} > ${budget.dailyTokenLimit}`,
      budget 
    }
  }
  
  // Check message count limit
  if (budget.messageCount >= MAX_MESSAGES_PER_SESSION) {
    return { 
      allowed: false, 
      reason: `Maximum messages per session exceeded: ${budget.messageCount} >= ${MAX_MESSAGES_PER_SESSION}`,
      budget 
    }
  }
  
  return { allowed: true, budget }
}

function updateSessionBudget(connectionId: string, inputTokens: number, outputTokens: number) {
  const budget = sessionBudgets.get(connectionId)
  if (!budget) return
  
  const totalTokens = inputTokens + outputTokens
  const cost = (inputTokens * COST_PER_1K_INPUT_TOKENS) + (outputTokens * COST_PER_1K_OUTPUT_TOKENS)
  
  budget.messageCount++
  budget.totalTokensUsed += totalTokens
  budget.totalCost += cost
  budget.lastMessageTime = new Date()
  
  console.log(`[${connectionId}] Budget update: ${budget.messageCount} messages, ${budget.totalTokensUsed} tokens, $${budget.totalCost.toFixed(6)} cost`)
  
  // Block session if approaching limits
  if (budget.totalTokensUsed > budget.dailyTokenLimit * 0.9) {
    console.warn(`[${connectionId}] Approaching token limit: ${budget.totalTokensUsed}/${budget.dailyTokenLimit}`)
  }
}

function estimateTokens(text: string): number {
  // Simple token estimation (roughly 4 characters per token for English)
  return Math.ceil(text.length / 4)
}

// Add server startup error handling
wss.on('error', (error) => {
  console.error('❌ WebSocket Server Error:', error)
})

wss.on('listening', () => {
  console.log(`🚀 Gemini Live WebSocket server started on port ${PORT}`)
  console.log(`💰 Budget limits: ${DEFAULT_PER_REQUEST_LIMIT} tokens/request, ${DEFAULT_DAILY_TOKEN_LIMIT} tokens/day`)
})

wss.on('connection', (ws: WebSocket, req) => {
  const connectionId = uuidv4()
  const clientIP = req.socket.remoteAddress || 'unknown'
  
  // Send immediate acknowledgment to prevent connection stall
  ws.send(JSON.stringify({ 
    type: 'connected', 
    payload: { connectionId, timestamp: new Date().toISOString() } 
  }))

  // This map is client-specific, so use connectionId
  // clients.set(ws, connectionId) // This line was removed as per the new_code, as clients is not defined.
  sessionBudgets.set(connectionId, initializeSessionBudget(connectionId))
  console.log(`[${connectionId}] Client connected from ${clientIP}. Budget initialized.`)

  ws.on('message', async (message: WebSocket.RawData, isBinary: boolean) => {
    // The connectionId might be available from the closure scope or mapped if not using `this.clients`
    const currentConnectionId = connectionId // Use the closure-scoped connectionId
    try {
      const parsedMessage = JSON.parse(message.toString())
      console.log(`[${currentConnectionId}] Received message type: ${parsedMessage.type}`)
      console.log(`[${currentConnectionId}] DEBUG: parsedMessage.type value: '${parsedMessage.type}', typeof: ${typeof parsedMessage.type}`)
  
      switch (parsedMessage.type) {
        case 'start':
          console.log(`[${currentConnectionId}] DEBUG: Entering 'start' case.`)
          await handleStart(currentConnectionId, ws, parsedMessage.payload)
          break
        
        case 'user_message':
          console.log(`[${currentConnectionId}] DEBUG: Entering 'user_message' case.`)
          await handleUserMessage(currentConnectionId, parsedMessage.payload)
          break

        case 'user_audio': 
          console.log(`[${currentConnectionId}] DEBUG: Entering 'user_audio' case.`) // This MUST appear if audio is sent
          await handleUserMessage(currentConnectionId, parsedMessage.payload)
          break

        case 'TURN_COMPLETE': // New: Handle client signal for end of user audio turn
          console.log(`[${currentConnectionId}] Received TURN_COMPLETE signal from client.`)
          await sendBufferedAudioToGemini(currentConnectionId)
          break

        case 'ping': 
          console.log(`[${currentConnectionId}] DEBUG: Entering 'ping' case.`)
          ws.send(JSON.stringify({ type: 'pong' }))
          break
  
        default:
          console.warn(`[${currentConnectionId}] DEBUG: Entering 'default' case. Unknown type: '${parsedMessage.type}'`)
          console.warn(`[${currentConnectionId}] Unknown message type: ${parsedMessage.type}`)
          ws.send(JSON.stringify({ type: 'error', payload: { message: `Unknown message type: ${parsedMessage.type}` } }))
          break
      }
    } catch (error) {
      console.error(`[${currentConnectionId}] Error parsing message or handling WebSocket event:`, error)
      ws.send(JSON.stringify({ type: 'error', payload: { message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` } }))
    }
  })

  ws.on('close', (code, reason) => {
    console.log(`[${connectionId}] Client disconnected. Code: ${code}, Reason: ${reason ? reason.toString() : 'N/A'}`)
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
    const existingSession = activeSessions.get(connectionId)
    if (existingSession) {
      existingSession.session.close()
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error(`[${connectionId}] GEMINI_API_KEY not configured.`)
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'GEMINI_API_KEY not configured' } }))
    return
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    // Use the correct model name for Gemini Live API
    const model = 'models/gemini-2.0-flash-exp'
    
    // Simplified system instruction
    const systemInstruction = `You are a helpful AI assistant. ${payload.leadContext ? `User: ${payload.leadContext.name || 'User'}` : ''}`

    // Correct configuration format for Gemini Live API
    const config = {
      model: model,
      systemInstruction: systemInstruction,
      // Re-adding response modalities and speech config
      responseModalities: [Modality.AUDIO, Modality.TEXT],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
      },
      generationConfig: {
        candidateCount: 1,
        maxOutputTokens: DEFAULT_PER_REQUEST_LIMIT,
        temperature: 0.7,
        topP: 0.95,
        topK: 40
      }
    }

    // Connect with updated config
    const session = await ai.live.connect({
      ...config,
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

    // Send initial message if provided (now handles audio or text explicitly)
    if (payload.message || payload.audioData) {
      if (payload.message) {
        session.sendClientContent({
          turns: [{ role: 'user', parts: [{ text: payload.message }] }],
          turnComplete: true,
        })
      } else if (payload.audioData && payload.mimeType) {
        // If initial payload contains audio (unlikely for start, but for consistency)
        session.sendClientContent({
          turns: [{
            role: 'user',
            parts: [{
              inlineData: {
                mimeType: payload.mimeType,
                data: payload.audioData,
              },
            }],
          }],
          turnComplete: true,
        })
      }
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
    for (const part of message.serverContent.modelTurn.parts) {
      if (part.text) {
        console.log(`[Server] Received text part from Gemini: "${part.text.slice(0, 50)}..."`)
        // Estimate output tokens for budget tracking
        const outputTokens = estimateTokens(part.text)
        updateSessionBudget(connectionId, 0, outputTokens)
        
        ws.send(JSON.stringify({ type: 'text', payload: { content: part.text } }))
      }
      if (part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
        console.log(`[Server] Received audio part from Gemini: ${part.inlineData.data.length} base64 chars, type: ${part.inlineData.mimeType}`)
        // Audio responses also count as output tokens (estimate based on duration/size)
        const audioTokens = Math.ceil(part.inlineData.data.length / 1000) // Rough estimate
        updateSessionBudget(connectionId, 0, audioTokens)
        
        // Sending raw base64 data to client
        ws.send(JSON.stringify({ type: 'audio', payload: { audioData: part.inlineData.data, mimeType: part.inlineData.mimeType } }))
      }
    }
  }

  if (message.serverContent?.turnComplete) {
    console.log(`[Server] Received turn_complete from Gemini.`)
    ws.send(JSON.stringify({ type: 'turn_complete' }))
  }
}

async function handleUserMessage(connectionId: string, payload: any) {
  const client = activeSessions.get(connectionId)
  if (!client) {
    console.warn(`[${connectionId}] Session not found for user message.`)
    return
  }

  let userContentParts = []
  let estimatedTokens = 0
  let messageForDuplicateCheck = ''
  let contentType: 'audio' | 'text' | 'unknown' = 'unknown'

  // Determine content type and extract data based on content presence
  if (payload.audioData && payload.mimeType) {
    contentType = 'audio'
    console.log(`[Server] Received audio content. Size: ${payload.audioData.length} chars, type: ${payload.mimeType}`)
    
    // Handle different audio data formats
    let audioDataBuffer: Uint8Array
    try {
      if (typeof payload.audioData === 'string') {
        // If it's a base64 string, decode it
        if (payload.audioData.includes(',')) {
          // Remove data URL prefix if present (e.g., "data:audio/pcm;base64,")
          const base64Data = payload.audioData.split(',')[1]
          audioDataBuffer = new Uint8Array(Buffer.from(base64Data, 'base64'))
        } else {
          // Assume it's pure base64
          audioDataBuffer = new Uint8Array(Buffer.from(payload.audioData, 'base64'))
        }
      } else if (payload.audioData instanceof ArrayBuffer) {
        audioDataBuffer = new Uint8Array(payload.audioData)
      } else if (Array.isArray(payload.audioData)) {
        // If it's an array of bytes
        audioDataBuffer = new Uint8Array(payload.audioData)
      } else {
        throw new Error(`Unsupported audio data format: ${typeof payload.audioData}`)
      }
    } catch (decodeError) {
      console.error(`[${connectionId}] Error decoding audio data:`, decodeError)
      client.ws.send(JSON.stringify({ 
        type: 'error', 
        payload: { message: `Invalid audio data format: ${decodeError instanceof Error ? decodeError.message : 'Unknown error'}` } 
      }))
      return
    }
    
    // Buffer audio chunk instead of sending immediately
    let sessionAudioBuffers = bufferedAudioChunks.get(connectionId) || []
    sessionAudioBuffers.push(audioDataBuffer.buffer as ArrayBuffer) // Store raw ArrayBuffer
    bufferedAudioChunks.set(connectionId, sessionAudioBuffers)

    estimatedTokens = Math.ceil(audioDataBuffer.length / 1000) // Rough estimate for audio
    messageForDuplicateCheck = `audio_chunk_${connectionId}_${Date.now()}` // Unique for audio for duplicate check
    console.log(`[${connectionId}] Buffered audio chunk (${audioDataBuffer.length} bytes). Total buffered: ${sessionAudioBuffers.reduce((sum, buf) => sum + buf.byteLength, 0)} bytes`)
    
    // DO NOT RETURN HERE. Proceed to budget check and log, but won't send to Gemini yet.
    // Actual sending happens when TURN_COMPLETE is received.

  } else if (payload.message) {
    contentType = 'text'
    const message = payload.message || ''
    if (!message) {
      console.warn(`[${connectionId}] Empty user_message payload received.`)
      client.ws.send(JSON.stringify({ type: 'error', payload: { message: 'Empty message.' } }))
      return
    }
    messageForDuplicateCheck = message
    estimatedTokens = estimateTokens(message)
    userContentParts.push({ text: message })
    console.log(`[${connectionId}] Received user text message: "${message.slice(0, 50)}..." (${estimatedTokens} estimated tokens)`)
  } else {
    console.warn(`[${connectionId}] handleUserMessage received unknown payload type: ${payload.type || 'N/A'}`)
    client.ws.send(JSON.stringify({ type: 'error', payload: { message: `Unknown message type sent to handler: ${payload.type || 'N/A'}` } }))
    return
  }
  
  // Check for duplicate messages
  if (checkDuplicateMessage(connectionId, messageForDuplicateCheck)) {
    console.log(`[${connectionId}] Duplicate message detected, ignoring.`)
    client.ws.send(JSON.stringify({ 
      type: 'error', 
      payload: { message: 'Duplicate message detected. Please wait 5 seconds between identical messages.' } 
    }))
    return
  }
  
  // Estimate tokens for budget check
  const budgetCheck = checkSessionBudget(connectionId, estimatedTokens)
  
  if (!budgetCheck.allowed) {
    console.warn(`[${connectionId}] Budget limit exceeded: ${budgetCheck.reason}`)
    client.ws.send(JSON.stringify({ 
      type: 'error', 
      payload: { 
        message: `Budget limit exceeded: ${budgetCheck.reason}`,
        budgetInfo: budgetCheck.budget
      } 
    }))
    return
  }

  // Handle content validation differently for text vs audio
  if (contentType === 'text') {
    if (userContentParts.length > 0) {
      console.log(`[${connectionId}] Sending text content to Gemini. Estimated Tokens: ${estimatedTokens}`)
    } else {
      console.warn(`[${connectionId}] No text content parts to send to Gemini.`)
      client.ws.send(JSON.stringify({ type: 'error', payload: { message: 'No text content to send to AI.' } }))
      return
    }
  } else if (contentType === 'audio') {
    console.log(`[${connectionId}] Audio buffered for turn completion. Estimated Tokens: ${estimatedTokens}`)
    return // Exit early for audio - wait for TURN_COMPLETE signal
  }

  try {
    // Only send text messages here. Audio will be sent by sendBufferedAudioToGemini.
    if (contentType === 'text') {
      await client.session.sendClientContent({
        turns: [{ role: 'user', parts: userContentParts }],
        turnComplete: true,
        // speechConfig is not a valid parameter for sendClientContent
      })
    }
    
    // Update budget with estimated input tokens (output tokens will be updated when response arrives)
    updateSessionBudget(connectionId, estimatedTokens, 0)
    
  } catch (error) {
    console.error(`[${connectionId}] Error sending message to Gemini:`, error)
    client.ws.send(JSON.stringify({ 
      type: 'error', 
      payload: { message: 'Failed to send message to AI service.' } 
    }))
  }
}

// New function to send buffered audio to Gemini when turn is complete
async function sendBufferedAudioToGemini(connectionId: string) {
  const client = activeSessions.get(connectionId)
  if (!client || !client.session) {
    console.warn(`[${connectionId}] Session not found for sending buffered audio.`)
    return
  }

  const audioBuffers = bufferedAudioChunks.get(connectionId)
  if (!audioBuffers || audioBuffers.length === 0) {
    console.log(`[${connectionId}] No buffered audio to send for turn complete.`)
    return
  }

  // Concatenate all buffered audio ArrayBuffers
  const totalLength = audioBuffers.reduce((acc, val) => acc + val.byteLength, 0)
  const mergedAudio = new Uint8Array(totalLength)
  let offset = 0
  for (const buffer of audioBuffers) {
    mergedAudio.set(new Uint8Array(buffer), offset)
    offset += buffer.byteLength
  }

  // Clear buffer
  bufferedAudioChunks.delete(connectionId)

  const estimatedTokens = Math.ceil(mergedAudio.byteLength / 1000) // Re-estimate tokens for full audio
  const messageForDuplicateCheck = `full_audio_turn_${connectionId}_${Date.now()}`

  // Apply budget and duplicate checks for the full turn
  if (checkDuplicateMessage(connectionId, messageForDuplicateCheck)) {
    console.log(`[${connectionId}] Duplicate full audio turn detected, ignoring.`) 
    client.ws.send(JSON.stringify({ 
      type: 'error', 
      payload: { message: 'Duplicate audio turn detected.' } 
    }))
    return
  }

  const budgetCheck = checkSessionBudget(connectionId, estimatedTokens)
  if (!budgetCheck.allowed) {
    console.warn(`[${connectionId}] Budget limit exceeded for full audio turn: ${budgetCheck.reason}`)
    client.ws.send(JSON.stringify({ 
      type: 'error', 
      payload: { 
        message: `Budget limit exceeded for audio turn: ${budgetCheck.reason}`,
        budgetInfo: budgetCheck.budget
      } 
    }))
    return
  }

  console.log(`[${connectionId}] Sending FULL buffered audio turn to Gemini (${mergedAudio.byteLength} bytes, ${estimatedTokens} tokens).`)

  try {
    await client.session.sendClientContent({
      turns: [{
        role: 'user',
        parts: [{
          inlineData: {
            mimeType: 'audio/pcm',
            data: Buffer.from(mergedAudio.buffer).toString('base64'),
          },
        }],
      }],
      turnComplete: true, // Signal end of turn with the full audio
    })

    updateSessionBudget(connectionId, estimatedTokens, 0)

  } catch (error) {
    console.error(`[${connectionId}] Error sending buffered audio to Gemini:`, error)
    client.ws.send(JSON.stringify({ 
      type: 'error', 
      payload: { message: 'Failed to send complete audio turn to AI service.' } 
    }))
  }
}

function handleClose(connectionId: string) {
  const client = activeSessions.get(connectionId)
  if (client) {
    // Log final budget stats before cleanup
    const budget = sessionBudgets.get(connectionId)
    if (budget) {
      const sessionDuration = (Date.now() - budget.startTime.getTime()) / 1000
      console.log(`[${connectionId}] Session summary: ${budget.messageCount} messages, ${budget.totalTokensUsed} tokens, $${budget.totalCost.toFixed(6)} cost, ${sessionDuration.toFixed(1)}s duration`)
    }
    
    console.log(`[${connectionId}] Closing session and cleaning up resources.`)
    try {
      client.session.close()
    } catch (e: any) {
      console.error(`[${connectionId}] Error closing Gemini session:`, e)
    }
    if(client.ws.readyState === WebSocket.OPEN) {
        client.ws.close()
    }
    
    // Cleanup all session data
    activeSessions.delete(connectionId)
    sessionBudgets.delete(connectionId)
    bufferedAudioChunks.delete(connectionId) // New: cleanup buffered audio as well
    
    // Cleanup recent messages for this connection
    for (const [key] of recentMessages.entries()) {
      if (key.startsWith(`${connectionId}:`)) {
        recentMessages.delete(key)
      }
    }
    
    console.log(`[${connectionId}] Session removed. Total sessions: ${activeSessions.size}`)
  }
}
