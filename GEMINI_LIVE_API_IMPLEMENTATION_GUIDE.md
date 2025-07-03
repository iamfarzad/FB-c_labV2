# Google Gemini Live API Implementation Guide

## Overview

The Google Gemini Live API enables low-latency, real-time voice and video interactions with Gemini models. This guide covers implementing voice, webcam, and screen sharing features using the Live API.

## Current Implementation Status

### ✅ What's Already Implemented
- **WebcamModal**: Captures frames every 3 seconds and sends for analysis
- **ScreenShareModal**: Captures screen content periodically for analysis  
- **VoiceInputModal**: Basic real-time conversation mode with transcription
- **REST API Integration**: Uses standard HTTP requests to `/api/gemini`

### ❌ What's Missing (Live API Features)
- **WebSocket Connection**: Real-time bidirectional streaming
- **Continuous Streaming**: True real-time video/audio processing
- **Native Audio Output**: High-quality voice responses
- **Voice Activity Detection**: Automatic speech detection
- **Interruption Support**: Natural conversation flow

## Live API Key Features

### 1. **Bidirectional Streaming**
- WebSocket-based communication
- Send and receive text, audio, and video data concurrently
- Sub-second latency (600ms for first token)

### 2. **Supported Models**
\`\`\`typescript
// Models with Live API support
const LIVE_API_MODELS = [
  "gemini-live-2.5-flash-preview",           // Half-cascade audio
  "gemini-2.0-flash-live-001",               // Half-cascade audio
  "gemini-2.5-flash-preview-native-audio-dialog",     // Native audio
  "gemini-2.5-flash-exp-native-audio-thinking-dialog" // Native audio with thinking
];
\`\`\`

### 3. **Audio Capabilities**
- **Input**: 16-bit PCM, 16kHz, mono format
- **Output**: 24kHz sample rate
- **Multiple Voices**: 5 distinct expressive voices
- **30+ Languages**: Expanded language support

### 4. **Video/Screen Capabilities**
- Real-time video stream processing
- Configurable media resolution
- Continuous or activity-based capture

## Implementation Guide

### Step 1: WebSocket Connection Setup

\`\`\`typescript
// lib/ai/gemini-live-client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private sessionConfig: any;
  
  constructor(private apiKey: string) {}
  
  async connect(model: string = 'gemini-live-2.5-flash-preview') {
    // WebSocket endpoint for Gemini Live API
    const wsUrl = `wss://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${this.apiKey}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      // Send initial setup message
      this.sendSetup({
        model,
        generationConfig: {
          responseModalities: ['AUDIO', 'TEXT'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Aoede" // Or: Charon, Fenrir, Kore, Puck
              }
            }
          }
        },
        systemInstruction: "You are a helpful AI assistant with real-time conversation capabilities.",
        tools: [] // Add function calling tools if needed
      });
    };
    
    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }
  
  private sendSetup(config: any) {
    this.send({ setup: config });
  }
  
  private send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  
  // Send real-time audio/video input
  sendRealtimeInput(mediaChunks: Blob[]) {
    this.send({
      realtimeInput: {
        mediaChunks: mediaChunks.map(chunk => ({
          data: chunk,
          mimeType: chunk.type
        }))
      }
    });
  }
}
\`\`\`

### Step 2: Updated Voice Implementation

\`\`\`typescript
// components/voice-input-live.tsx
export const VoiceInputLive: React.FC = () => {
  const [liveClient, setLiveClient] = useState<GeminiLiveClient | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const startLiveConversation = async () => {
    // Initialize Live API client
    const client = new GeminiLiveClient(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    await client.connect();
    setLiveClient(client);
    
    // Start audio capture
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      } 
    });
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && liveClient) {
        // Convert to PCM format before sending
        convertToPCM(event.data).then(pcmData => {
          liveClient.sendRealtimeInput([pcmData]);
        });
      }
    };
    
    mediaRecorder.start(100); // Send chunks every 100ms
    mediaRecorderRef.current = mediaRecorder;
  };
  
  // Conversion utility
  async function convertToPCM(webmBlob: Blob): Promise<Blob> {
    // Use Web Audio API to convert to PCM
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await webmBlob.arrayBuffer();
    const decodedData = await audioContext.decodeAudioData(audioBuffer);
    
    // Extract PCM data
    const pcmData = decodedData.getChannelData(0);
    const pcmBuffer = new Int16Array(pcmData.length);
    
    for (let i = 0; i < pcmData.length; i++) {
      pcmBuffer[i] = Math.max(-32768, Math.min(32767, pcmData[i] * 32768));
    }
    
    return new Blob([pcmBuffer.buffer], { type: 'audio/pcm;rate=16000' });
  }
};
\`\`\`

### Step 3: Enhanced Webcam Streaming

\`\`\`typescript
// components/webcam-live.tsx
export const WebcamLive: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [liveClient, setLiveClient] = useState<GeminiLiveClient | null>(null);
  
  const startWebcamStream = async () => {
    const client = new GeminiLiveClient(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    await client.connect('gemini-live-2.5-flash-preview');
    setLiveClient(client);
    
    // Start video capture
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: true // Include audio with video
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    
    // Stream video frames
    const captureFrame = () => {
      if (!canvasRef.current || !videoRef.current || !liveClient) return;
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob && liveClient) {
          liveClient.sendRealtimeInput([blob]);
        }
      }, 'image/jpeg', 0.8);
      
      // Continue streaming at 10 FPS for efficiency
      setTimeout(captureFrame, 100);
    };
    
    // Start streaming after video is ready
    videoRef.current.onloadedmetadata = () => {
      captureFrame();
    };
  };
};
\`\`\`

### Step 4: Screen Share with Live API

\`\`\`typescript
// components/screen-share-live.tsx
export const ScreenShareLive: React.FC = () => {
  const [liveClient, setLiveClient] = useState<GeminiLiveClient | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const startScreenShare = async () => {
    const client = new GeminiLiveClient(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    await client.connect();
    setLiveClient(client);
    
    // Get screen share stream
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',
        displaySurface: 'monitor'
      },
      audio: false
    });
    
    streamRef.current = stream;
    
    // Create video element to capture frames
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Stream screen content
    const captureScreen = () => {
      if (!ctx || !liveClient || !stream.active) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob && liveClient) {
          liveClient.sendRealtimeInput([blob]);
        }
      }, 'image/jpeg', 0.9);
      
      requestAnimationFrame(captureScreen);
    };
    
    video.onloadedmetadata = () => {
      captureScreen();
    };
  };
};
\`\`\`

### Step 5: Handling Live API Responses

\`\`\`typescript
// lib/ai/gemini-live-client.ts (continued)
export class GeminiLiveClient {
  // ... previous code ...
  
  private handleMessage(data: string | Blob) {
    if (data instanceof Blob) {
      // Handle audio data
      this.handleAudioResponse(data);
    } else {
      // Handle JSON messages
      const message = JSON.parse(data);
      
      if (message.setupComplete) {
        console.log('Setup complete, ready for streaming');
      } else if (message.serverContent) {
        this.handleServerContent(message.serverContent);
      } else if (message.toolCall) {
        this.handleToolCall(message.toolCall);
      } else if (message.usageMetadata) {
        console.log('Token usage:', message.usageMetadata);
      }
    }
  }
  
  private handleServerContent(content: any) {
    if (content.modelTurn?.parts) {
      for (const part of content.modelTurn.parts) {
        if (part.text) {
          // Handle text response
          this.onTextResponse?.(part.text);
        }
        if (part.inlineData) {
          // Handle audio/video response
          this.onMediaResponse?.(part.inlineData);
        }
      }
    }
    
    if (content.turnComplete) {
      this.onTurnComplete?.();
    }
  }
  
  private async handleAudioResponse(audioBlob: Blob) {
    // Play audio response
    const audio = new Audio();
    audio.src = URL.createObjectURL(audioBlob);
    await audio.play();
  }
}
\`\`\`

## Session Management Features

### Voice Activity Detection (VAD)
\`\`\`typescript
// Configure VAD in setup
{
  realtimeInputConfig: {
    automaticActivityDetection: {
      startOfSpeechSensitivity: "LOW", // or "HIGH"
      endOfSpeechSensitivity: "LOW",   // or "HIGH"
      prefixPaddingMs: 300,
      silenceDurationMs: 1000,
      disabled: false // Set true for manual control
    }
  }
}
\`\`\`

### Session Resumption
\`\`\`typescript
// Enable session resumption
{
  sessionResumption: {
    timeout: 3600, // 1 hour
    transparent: true // Auto-reconnect support
  }
}
\`\`\`

### Context Compression
\`\`\`typescript
// Configure context window compression
{
  contextWindowCompression: {
    slidingWindow: {
      maxTokens: 100000,
      compressionRatio: 0.5
    }
  }
}
\`\`\`

## Best Practices

1. **Audio Format**: Always convert to 16-bit PCM, 16kHz, mono before sending
2. **Video Streaming**: Limit frame rate to 10-30 FPS for efficiency
3. **Error Handling**: Implement reconnection logic for WebSocket disconnections
4. **Token Management**: Monitor usage via `usageMetadata` messages
5. **Interruptions**: Handle `interrupted` flag in server responses
6. **Voice Selection**: Test different voices for your use case
7. **Network Optimization**: Use appropriate video resolution based on bandwidth

## Migration Checklist

- [ ] Replace REST API calls with WebSocket connections
- [ ] Update audio capture to use proper PCM format
- [ ] Implement continuous streaming instead of periodic captures
- [ ] Add WebSocket reconnection logic
- [ ] Update UI to show real-time connection status
- [ ] Test voice activity detection settings
- [ ] Implement session resumption for reliability
- [ ] Add proper error handling for streaming failures
- [ ] Test with different network conditions
- [ ] Optimize media capture settings for performance

## Next Steps

1. Install required dependencies:
   \`\`\`bash
   npm install @google/generative-ai websocket
   \`\`\`

2. Create WebSocket service for Live API
3. Update existing components to use streaming
4. Test with different models and configurations
5. Implement production-ready error handling

## Resources

- [Gemini Live API Documentation](https://ai.google.dev/gemini-api/docs/live)
- [Live API Reference](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/multimodal-live)
- [WebSocket API Specification](https://cloud.google.com/vertex-ai/generative-ai/docs/reference/websockets)
- [Example Applications](https://github.com/google-gemini/multimodal-live-api-web-console)
