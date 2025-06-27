/**
 * Gemini Live API Client
 * Implements WebSocket-based real-time streaming for voice, video, and screen sharing
 */

export interface GeminiLiveConfig {
  model?: string;
  responseModalities?: ('TEXT' | 'AUDIO')[];
  voiceName?: 'Aoede' | 'Charon' | 'Fenrir' | 'Kore' | 'Puck';
  systemInstruction?: string;
  tools?: any[];
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface RealtimeInputConfig {
  automaticActivityDetection?: {
    startOfSpeechSensitivity?: 'LOW' | 'HIGH';
    endOfSpeechSensitivity?: 'LOW' | 'HIGH';
    prefixPaddingMs?: number;
    silenceDurationMs?: number;
    disabled?: boolean;
  };
  activityHandling?: 'START_OF_ACTIVITY_INTERRUPTS' | 'NO_INTERRUPTION';
  turnCoverage?: 'TURN_INCLUDES_ONLY_ACTIVITY' | 'TURN_INCLUDES_ALL_INPUT';
}

export interface SessionResumptionConfig {
  timeout?: number;
  transparent?: boolean;
}

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private sessionHandle?: string;
  
  // Event handlers
  public onSetupComplete?: () => void;
  public onTextResponse?: (text: string) => void;
  public onAudioResponse?: (audioData: Blob) => void;
  public onMediaResponse?: (mediaData: any) => void;
  public onTurnComplete?: () => void;
  public onInterrupted?: () => void;
  public onError?: (error: Error) => void;
  public onConnectionChange?: (connected: boolean) => void;
  public onTokenUsage?: (usage: any) => void;
  public onTranscription?: (transcription: string, type: 'input' | 'output') => void;
  
  constructor(
    private apiKey: string,
    private config: GeminiLiveConfig = {}
  ) {
    this.config = {
      model: 'gemini-live-2.5-flash-preview',
      responseModalities: ['TEXT', 'AUDIO'],
      voiceName: 'Aoede',
      systemInstruction: 'You are a helpful AI assistant with real-time conversation capabilities.',
      ...config
    };
  }
  
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `wss://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:streamGenerateContent?key=${this.apiKey}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected to Gemini Live API');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.onConnectionChange?.(true);
          
          // Send initial setup
          this.sendSetup();
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.onError?.(new Error('WebSocket connection error'));
          reject(error);
        };
        
        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.isConnected = false;
          this.onConnectionChange?.(false);
          
          // Attempt reconnection if not manually closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  
  private sendSetup(): void {
    const setupMessage = {
      setup: {
        model: this.config.model,
        generationConfig: {
          candidateCount: 1,
          maxOutputTokens: 8192,
          temperature: this.config.temperature || 0.7,
          topP: this.config.topP || 0.9,
          topK: this.config.topK || 40,
          responseModalities: this.config.responseModalities,
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voiceName
              }
            }
          }
        },
        systemInstruction: this.config.systemInstruction,
        tools: this.config.tools || [],
        sessionResumption: this.sessionHandle ? {
          sessionHandle: this.sessionHandle
        } : undefined
      }
    };
    
    this.send(setupMessage);
  }
  
  private send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, queuing message');
    }
  }
  
  sendText(text: string): void {
    this.send({
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text }]
        }],
        turnComplete: true
      }
    });
  }
  
  sendRealtimeInput(mediaChunks: Blob[]): void {
    this.send({
      realtimeInput: {
        mediaChunks: mediaChunks.map(chunk => ({
          data: this.blobToBase64(chunk),
          mimeType: chunk.type
        }))
      }
    });
  }
  
  sendActivityStart(): void {
    this.send({
      realtimeInput: {
        activityStart: {}
      }
    });
  }
  
  sendActivityEnd(): void {
    this.send({
      realtimeInput: {
        activityEnd: {}
      }
    });
  }
  
  sendToolResponse(functionResponses: any[]): void {
    this.send({
      toolResponse: {
        functionResponses
      }
    });
  }
  
  updateConfig(config: Partial<GeminiLiveConfig>): void {
    this.config = { ...this.config, ...config };
    
    // If connected, send updated configuration
    if (this.isConnected) {
      // Note: Some config changes may require reconnection
      console.log('Config updated. Some changes may require reconnection.');
    }
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
      this.isConnected = false;
    }
  }
  
  private async reconnect(): Promise<void> {
    this.reconnectAttempts++;
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000 * this.reconnectAttempts));
    
    try {
      await this.connect();
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }
  
  private handleMessage(data: string | Blob): void {
    try {
      if (data instanceof Blob) {
        // Binary data - likely audio
        this.onAudioResponse?.(data);
      } else {
        // JSON message
        const message = JSON.parse(data);
        
        if (message.setupComplete) {
          console.log('Setup complete');
          this.onSetupComplete?.();
        } else if (message.serverContent) {
          this.handleServerContent(message.serverContent);
        } else if (message.toolCall) {
          this.handleToolCall(message.toolCall);
        } else if (message.toolCallCancellation) {
          console.log('Tool calls cancelled:', message.toolCallCancellation.ids);
        } else if (message.usageMetadata) {
          this.onTokenUsage?.(message.usageMetadata);
        } else if (message.goAway) {
          console.warn('Server signaling disconnect:', message.goAway);
          // Prepare for disconnect
        } else if (message.sessionResumptionUpdate) {
          this.handleSessionResumption(message.sessionResumptionUpdate);
        } else if (message.inputTranscription) {
          this.onTranscription?.(message.inputTranscription.text, 'input');
        } else if (message.outputTranscription) {
          this.onTranscription?.(message.outputTranscription.text, 'output');
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.onError?.(error as Error);
    }
  }
  
  private handleServerContent(content: any): void {
    if (content.interrupted) {
      console.log('Generation interrupted');
      this.onInterrupted?.();
    }
    
    if (content.modelTurn?.parts) {
      for (const part of content.modelTurn.parts) {
        if (part.text) {
          this.onTextResponse?.(part.text);
        }
        if (part.inlineData) {
          // Convert base64 audio to blob if needed
          if (part.inlineData.mimeType?.startsWith('audio/')) {
            const audioBlob = this.base64ToBlob(
              part.inlineData.data,
              part.inlineData.mimeType
            );
            this.onAudioResponse?.(audioBlob);
          } else {
            this.onMediaResponse?.(part.inlineData);
          }
        }
      }
    }
    
    if (content.turnComplete) {
      this.onTurnComplete?.();
    }
  }
  
  private handleToolCall(toolCall: any): void {
    console.log('Tool call requested:', toolCall);
    // Implement tool call handling based on your needs
  }
  
  private handleSessionResumption(update: any): void {
    if (update.newHandle && update.resumable) {
      this.sessionHandle = update.newHandle;
      console.log('Session handle updated:', this.sessionHandle);
    }
  }
  
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
  
  get connected(): boolean {
    return this.isConnected;
  }
}

// Audio conversion utilities
export async function convertToPCM(audioBlob: Blob): Promise<Blob> {
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const audioBuffer = await audioBlob.arrayBuffer();
  
  try {
    const decodedData = await audioContext.decodeAudioData(audioBuffer);
    const pcmData = decodedData.getChannelData(0);
    const pcmBuffer = new Int16Array(pcmData.length);
    
    for (let i = 0; i < pcmData.length; i++) {
      pcmBuffer[i] = Math.max(-32768, Math.min(32767, pcmData[i] * 32768));
    }
    
    return new Blob([pcmBuffer.buffer], { type: 'audio/pcm;rate=16000' });
  } finally {
    audioContext.close();
  }
}

export function createPCMFromFloat32(float32Array: Float32Array): Blob {
  const pcmBuffer = new Int16Array(float32Array.length);
  
  for (let i = 0; i < float32Array.length; i++) {
    pcmBuffer[i] = Math.max(-32768, Math.min(32767, float32Array[i] * 32768));
  }
  
  return new Blob([pcmBuffer.buffer], { type: 'audio/pcm;rate=16000' });
}