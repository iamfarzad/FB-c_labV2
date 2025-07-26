/**
 * WebRTC Audio Processor for Real-time Low-latency Audio Streaming
 * Provides ultra-low latency audio processing using WebRTC
 */

export interface WebRTCAudioConfig {
  sampleRate: number
  channels: number
  bitDepth: number
  bufferSize: number
  enableEchoCancellation: boolean
  enableNoiseSuppression: boolean
  enableAutoGainControl: boolean
}

export interface AudioStreamConfig {
  streamId: string
  userId: string
  sessionId: string
  voiceName: string
  languageCode: string
}

export class WebRTCAudioProcessor {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private audioProcessor: ScriptProcessorNode | null = null
  private config: WebRTCAudioConfig
  private isConnected = false
  private onAudioData: ((data: ArrayBuffer) => void) | null = null
  private onConnectionStateChange: ((state: string) => void) | null = null

  constructor(config: Partial<WebRTCAudioConfig> = {}) {
    this.config = {
      sampleRate: 24000,
      channels: 1,
      bitDepth: 16,
      bufferSize: 4096,
      enableEchoCancellation: true,
      enableNoiseSuppression: true,
      enableAutoGainControl: true,
      ...config
    }
  }

  /**
   * Initialize WebRTC audio processing
   */
  async initialize(): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.config.sampleRate,
        latencyHint: 'interactive'
      })

      // Create peer connection with optimized settings for low latency
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceTransportPolicy: 'all'
      })

      // Set up connection state change handler
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState || 'unknown'
        this.isConnected = state === 'connected'
        this.onConnectionStateChange?.(state)
        console.log('WebRTC connection state:', state)
      }

      // Set up data channel for audio streaming
      const dataChannel = this.peerConnection.createDataChannel('audio', {
        ordered: false,
        maxRetransmits: 0
      })

      dataChannel.onopen = () => {
        console.log('WebRTC data channel opened')
      }

      dataChannel.onmessage = (event) => {
        if (this.onAudioData) {
          this.onAudioData(event.data)
        }
      }

      console.log('✅ WebRTC audio processor initialized')
    } catch (error) {
      console.error('❌ Failed to initialize WebRTC audio processor:', error)
      throw error
    }
  }

  /**
   * Start audio capture with enhanced quality
   */
  async startAudioCapture(): Promise<MediaStream> {
    try {
      if (!this.audioContext) {
        throw new Error('Audio context not initialized')
      }

      // Request microphone access with optimized constraints
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: this.config.enableEchoCancellation,
          noiseSuppression: this.config.enableNoiseSuppression,
          autoGainControl: this.config.enableAutoGainControl,
          latency: 0.01, // 10ms latency target
          googEchoCancellation: this.config.enableEchoCancellation,
          googAutoGainControl: this.config.enableAutoGainControl,
          googNoiseSuppression: this.config.enableNoiseSuppression,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
          googAudioMirroring: false
        },
        video: false
      })

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!)
      })

      // Set up audio processing
      await this.setupAudioProcessing()

      console.log('✅ Audio capture started with WebRTC')
      return this.localStream
    } catch (error) {
      console.error('❌ Failed to start audio capture:', error)
      throw error
    }
  }

  /**
   * Set up real-time audio processing
   */
  private async setupAudioProcessing(): Promise<void> {
    if (!this.audioContext || !this.localStream) {
      throw new Error('Audio context or local stream not available')
    }

    try {
      // Create audio source from microphone
      const source = this.audioContext.createMediaStreamSource(this.localStream)

      // Create audio processor for real-time processing
      this.audioProcessor = this.audioContext.createScriptProcessor(
        this.config.bufferSize,
        this.config.channels,
        this.config.channels
      )

      // Process audio in real-time
      this.audioProcessor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer
        const outputBuffer = event.outputBuffer

        // Apply real-time audio enhancements
        for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
          const inputData = inputBuffer.getChannelData(channel)
          const outputData = outputBuffer.getChannelData(channel)

          // Apply real-time processing
          for (let i = 0; i < inputData.length; i++) {
            // Apply noise gate
            const threshold = 0.01
            if (Math.abs(inputData[i]) < threshold) {
              outputData[i] = 0
            } else {
              // Apply compression
              const compressionRatio = 4
              const compressionThreshold = 0.5
              let sample = inputData[i]
              
              if (Math.abs(sample) > compressionThreshold) {
                const excess = Math.abs(sample) - compressionThreshold
                const compressedExcess = excess / compressionRatio
                sample = sample > 0 ? 
                  compressionThreshold + compressedExcess : 
                  -(compressionThreshold + compressedExcess)
              }
              
              outputData[i] = sample
            }
          }
        }
      }

      // Connect the audio processing chain
      source.connect(this.audioProcessor)
      this.audioProcessor.connect(this.audioContext.destination)

      console.log('✅ Real-time audio processing set up')
    } catch (error) {
      console.error('❌ Failed to set up audio processing:', error)
      throw error
    }
  }

  /**
   * Send audio data through WebRTC
   */
  async sendAudioData(audioData: ArrayBuffer): Promise<void> {
    try {
      if (!this.peerConnection || !this.isConnected) {
        throw new Error('WebRTC not connected')
      }

      const dataChannel = this.peerConnection.dataChannels?.[0]
      if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(audioData)
      }
    } catch (error) {
      console.error('❌ Failed to send audio data:', error)
      throw error
    }
  }

  /**
   * Create offer for WebRTC connection
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized')
      }

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      })

      await this.peerConnection.setLocalDescription(offer)
      return offer
    } catch (error) {
      console.error('❌ Failed to create offer:', error)
      throw error
    }
  }

  /**
   * Set remote description (answer from server)
   */
  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized')
      }

      await this.peerConnection.setRemoteDescription(description)
      console.log('✅ Remote description set')
    } catch (error) {
      console.error('❌ Failed to set remote description:', error)
      throw error
    }
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized')
      }

      await this.peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error('❌ Failed to add ICE candidate:', error)
      throw error
    }
  }

  /**
   * Set up event handlers
   */
  onAudioDataReceived(callback: (data: ArrayBuffer) => void): void {
    this.onAudioData = callback
  }

  onConnectionStateChanged(callback: (state: string) => void): void {
    this.onConnectionStateChange = callback
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats(): Promise<RTCStatsReport | null> {
    try {
      if (!this.peerConnection) {
        return null
      }

      return await this.peerConnection.getStats()
    } catch (error) {
      console.error('❌ Failed to get connection stats:', error)
      return null
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      // Stop audio processing
      if (this.audioProcessor) {
        this.audioProcessor.disconnect()
        this.audioProcessor = null
      }

      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop())
        this.localStream = null
      }

      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close()
        this.peerConnection = null
      }

      // Close audio context
      if (this.audioContext) {
        await this.audioContext.close()
        this.audioContext = null
      }

      this.isConnected = false
      console.log('✅ WebRTC audio processor cleaned up')
    } catch (error) {
      console.error('❌ Error during cleanup:', error)
    }
  }

  /**
   * Check if WebRTC is supported
   */
  static isSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      window.RTCPeerConnection &&
      window.AudioContext &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    )
  }

  /**
   * Get optimal configuration for different use cases
   */
  static getOptimalConfig(useCase: 'conversation' | 'presentation' | 'broadcast'): WebRTCAudioConfig {
    switch (useCase) {
      case 'conversation':
        return {
          sampleRate: 24000,
          channels: 1,
          bitDepth: 16,
          bufferSize: 2048, // Smaller buffer for lower latency
          enableEchoCancellation: true,
          enableNoiseSuppression: true,
          enableAutoGainControl: true
        }
      case 'presentation':
        return {
          sampleRate: 24000,
          channels: 1,
          bitDepth: 16,
          bufferSize: 4096,
          enableEchoCancellation: true,
          enableNoiseSuppression: false,
          enableAutoGainControl: true
        }
      case 'broadcast':
        return {
          sampleRate: 24000,
          channels: 2,
          bitDepth: 16,
          bufferSize: 8192,
          enableEchoCancellation: false,
          enableNoiseSuppression: true,
          enableAutoGainControl: false
        }
      default:
        return {
          sampleRate: 24000,
          channels: 1,
          bitDepth: 16,
          bufferSize: 4096,
          enableEchoCancellation: true,
          enableNoiseSuppression: true,
          enableAutoGainControl: true
        }
    }
  }
}