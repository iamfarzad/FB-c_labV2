    import { WebSocketServer, WebSocket } from 'ws';
    import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
    import { v4 as uuidv4 } from 'uuid';
    import { Buffer } from 'buffer';
    import * as https from 'https';
    import * as http from 'http';
    import * as fs from 'fs';
    import * as path from 'path';
    import * as dotenv from 'dotenv';

    dotenv.config();

    // --- Interfaces and Constants ---
    interface SessionBudget {
    connectionId: string;
    messageCount: number;
    totalTokensUsed: number;
    totalCost: number;
    startTime: Date;
    lastMessageTime: Date;
    dailyTokenLimit: number;
    perRequestTokenLimit: number;
    isBlocked: boolean;
    }

    const COST_PER_1K_INPUT_TOKENS = 0.075 / 1000;
    const COST_PER_1K_OUTPUT_TOKENS = 0.30 / 1000;
    const DEFAULT_DAILY_TOKEN_LIMIT = 10000;
    const DEFAULT_PER_REQUEST_LIMIT = 500;
    const MAX_MESSAGES_PER_SESSION = 50;
    // Use PORT for Fly.io compatibility, fallback to 3001 for local development
    const PORT = process.env.PORT || process.env.LIVE_SERVER_PORT || 3001;

    // --- Server Setup ---
    const wss = new WebSocketServer({ noServer: true });
    // SSL Certificate paths - only use in development
    let sslOptions = {};
    const isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.FLY_APP_NAME;

    if (isLocalDev) {
    try {
        sslOptions = {
        key: fs.readFileSync(path.join(__dirname, '..', 'localhost-key.pem')),
        cert: fs.readFileSync(path.join(__dirname, '..', 'localhost.pem')),
        };
        console.log('🔐 SSL certificates loaded for local development');
    } catch (error) {
        console.warn('⚠️  SSL certificates not found. Run: mkcert localhost');
        console.warn('Falling back to HTTP for local development');
    }
    }

    // Create server based on environment
    const healthServer = isLocalDev && Object.keys(sslOptions).length > 0
    ? https.createServer(sslOptions, (req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('OK');
        } else {
            res.writeHead(404).end();
        }
        })
    : http.createServer((req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('OK');
        } else {
            res.writeHead(404).end();
        }
        });

    const server = healthServer.listen(Number(PORT), '0.0.0.0', () => {
    const protocol = isLocalDev && Object.keys(sslOptions).length > 0 ? 'HTTPS/WSS' : 'HTTP/WS';
    console.log(`🚀 WebSocket server listening on port ${PORT}`);
    console.log(`🔐 Using ${protocol} protocol`);
    });

    server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
    });

    // --- In-Memory Stores ---
    const activeSessions = new Map<string, { ws: WebSocket; session: Session }>();
    const sessionBudgets = new Map<string, SessionBudget>();
    const bufferedAudioChunks = new Map<string, ArrayBuffer[]>();

    // --- Core Logic ---

    function initializeSessionBudget(connectionId: string): SessionBudget {
    const budget: SessionBudget = {
        connectionId, messageCount: 0, totalTokensUsed: 0, totalCost: 0,
        startTime: new Date(), lastMessageTime: new Date(),
        dailyTokenLimit: DEFAULT_DAILY_TOKEN_LIMIT,
        perRequestTokenLimit: DEFAULT_PER_REQUEST_LIMIT, isBlocked: false,
    };
    sessionBudgets.set(connectionId, budget);
    return budget;
    }

    function updateSessionBudget(connectionId: string, inputTokens: number, outputTokens: number) {
        const budget = sessionBudgets.get(connectionId);
        if (!budget) return;
        const totalTokens = inputTokens + outputTokens;
        const cost = (inputTokens * COST_PER_1K_INPUT_TOKENS) + (outputTokens * COST_PER_1K_OUTPUT_TOKENS);
        budget.messageCount++;
        budget.totalTokensUsed += totalTokens;
        budget.totalCost += cost;
        budget.lastMessageTime = new Date();
        console.log(`[${connectionId}] Budget update: ${budget.messageCount} messages, ${budget.totalTokensUsed} tokens, $${budget.totalCost.toFixed(6)} cost`);
    }

    function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
    }

    async function handleStart(connectionId: string, ws: WebSocket, payload: any) {
  if (activeSessions.has(connectionId)) {
    console.log(`[${connectionId}] Session already exists. Closing old one.`);
    activeSessions.get(connectionId)?.session.close();
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error(`[${connectionId}] FATAL: GEMINI_API_KEY not configured.`);
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'GEMINI_API_KEY not configured on server.' } }));
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const session = await ai.live.connect({
      model: 'models/gemini-live-2.5-flash-preview-native-audio', // THE CORRECT MODEL
      config: {
        responseModalities: [Modality.AUDIO, Modality.TEXT],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        generationConfig: { maxOutputTokens: DEFAULT_PER_REQUEST_LIMIT },
        systemInstruction: {
          parts: [{
            text: `You are Puck, an AI assistant from Future Builders Consulting. You should:
            - Always respond to user audio input with both text and audio responses
            - Be conversational, friendly, and helpful
            - Keep responses concise but informative
            - Always acknowledge what the user said before providing your response
            - Speak clearly and naturally when generating audio responses`
          }]
        },
      },
      callbacks: {
        onopen: () => {
          console.log(`[${connectionId}] 🚀 Gemini session opened successfully`);
          ws.send(JSON.stringify({ type: 'session_started', payload: { connectionId } }));
        },
        onmessage: (message: LiveServerMessage) => {
          console.log(`[${connectionId}] 📨 Raw Gemini message received:`, JSON.stringify(message, null, 2));
          handleGeminiMessage(connectionId, ws, message);
        },
        onerror: (e: ErrorEvent) => {
          console.error(`[${connectionId}] 🚨 Gemini session error:`, e);
          ws.send(JSON.stringify({ type: 'error', payload: { message: `Gemini Error: ${e.message}` } }));
        },
        onclose: (e: CloseEvent) => {
          console.log(`[${connectionId}] 🔚 Gemini session closed:`, e.code, e.reason);
          handleClose(connectionId);
        },
      },
    });

    activeSessions.set(connectionId, { ws, session });
    console.log(`[${connectionId}] Active session stored.`);

  } catch (error) {
    console.error(`[${connectionId}] Failed to start Gemini session:`, error);
    ws.send(JSON.stringify({ type: 'error', payload: { message: error instanceof Error ? error.message : 'Failed to start session' } }));
  }
}

    function handleGeminiMessage(connectionId: string, ws: WebSocket, message: LiveServerMessage) {
        console.log(`[${connectionId}] 🎯 Received message from Gemini:`, JSON.stringify(message, null, 2));
        
        if (message.serverContent?.modelTurn?.parts) {
            console.log(`[${connectionId}] 📝 Processing ${message.serverContent.modelTurn.parts.length} parts from Gemini`);
            for (const part of message.serverContent.modelTurn.parts) {
                if (part.text) {
                    console.log(`[${connectionId}] 💬 Sending text response: ${part.text.substring(0, 100)}...`);
                    const outputTokens = estimateTokens(part.text);
                    updateSessionBudget(connectionId, 0, outputTokens);
                    ws.send(JSON.stringify({ type: 'text', payload: { content: part.text } }));
                }
                if (part.inlineData?.data) {
                    console.log(`[${connectionId}] 🔊 Sending audio response: ${part.inlineData.data.length} bytes`);
                    const audioTokens = Math.ceil(part.inlineData.data.length / 1000);
                    updateSessionBudget(connectionId, 0, audioTokens);
                    ws.send(JSON.stringify({ type: 'audio', payload: { audioData: part.inlineData.data } }));
                }
            }
        }
        if (message.serverContent?.turnComplete) {
            console.log(`[${connectionId}] ✅ Turn complete - conversation ready for next input`);
            ws.send(JSON.stringify({ type: 'turn_complete' }));
        }
    }

    async function handleUserMessage(connectionId: string, payload: any) {
        if (payload.audioData && payload.mimeType) {
            const audioDataBuffer = Buffer.from(payload.audioData, 'base64');
            let sessionAudioBuffers = bufferedAudioChunks.get(connectionId) || [];
            sessionAudioBuffers.push(audioDataBuffer);
            bufferedAudioChunks.set(connectionId, sessionAudioBuffers);
            console.log(`[${connectionId}] Buffered audio chunk (${audioDataBuffer.length} bytes).`);
            return; // Wait for TURN_COMPLETE
        }
        // Handle text messages if needed in the future
    }

    async function sendBufferedAudioToGemini(connectionId: string) {
        const client = activeSessions.get(connectionId);
        const audioBuffers = bufferedAudioChunks.get(connectionId);
        if (!client || !audioBuffers || audioBuffers.length === 0) {
            console.log(`[${connectionId}] No buffered audio to send.`);
            return;
        }
        const mergedAudio = Buffer.concat(audioBuffers.map(b => Buffer.from(b)));
        bufferedAudioChunks.delete(connectionId);
        const estimatedTokens = Math.ceil(mergedAudio.length / 1000);
        updateSessionBudget(connectionId, estimatedTokens, 0);

        console.log(`[${connectionId}] Sending FULL buffered audio to Gemini (${mergedAudio.length} bytes).`);
        console.log(`[${connectionId}] 🔍 Audio format: PCM, Base64 length: ${mergedAudio.toString('base64').length}`);
        
        try {
            const audioContent = {
                turns: [{
                    role: 'user',
                    parts: [{
                        inlineData: {
                            mimeType: 'audio/pcm',
                            data: mergedAudio.toString('base64'),
                        },
                    }],
                }],
                turnComplete: true,
            };
            
            console.log(`[${connectionId}] 📤 Sending content structure:`, JSON.stringify(audioContent, null, 2));
            await client.session.sendClientContent(audioContent);
            console.log(`[${connectionId}] ✅ Audio successfully sent to Gemini, waiting for response...`);
        } catch (error) {
            console.error(`[${connectionId}] ❌ Failed to send audio to Gemini:`, error);
            console.error(`[${connectionId}] ❌ Error details:`, JSON.stringify(error, null, 2));
        }
    }

    function handleClose(connectionId: string) {
        const client = activeSessions.get(connectionId);
        if (client) {
            client.session.close();
            if (client.ws.readyState === WebSocket.OPEN) client.ws.close();
            activeSessions.delete(connectionId);
            sessionBudgets.delete(connectionId);
            bufferedAudioChunks.delete(connectionId);
            console.log(`[${connectionId}] Session removed.`);
        }
    }

    wss.on('connection', (ws: WebSocket) => {
        const connectionId = uuidv4();
        initializeSessionBudget(connectionId);
        console.log(`[${connectionId}] Client connected. Budget initialized.`);

        ws.on('message', async (message: WebSocket.RawData) => {
            try {
                const parsedMessage = JSON.parse(message.toString());
                switch (parsedMessage.type) {
                    case 'start':
                        await handleStart(connectionId, ws, parsedMessage.payload);
                        break;
                    case 'user_audio':
                        await handleUserMessage(connectionId, parsedMessage.payload);
                        break;
                    case 'TURN_COMPLETE':
                        await sendBufferedAudioToGemini(connectionId);
                        break;
                }
            } catch (error) {
                console.error(`[${connectionId}] Error:`, error);
            }
        });

        ws.on('close', () => handleClose(connectionId));
        ws.on('error', () => handleClose(connectionId));
    });

    console.log('Server setup complete.');