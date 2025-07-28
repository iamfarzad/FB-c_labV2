/**
 * Audio Quality Enhancement Utilities
 * Provides advanced audio processing for better TTS quality
 */

export interface AudioEnhancementConfig {
  normalize: boolean
  noiseReduction: boolean
  compression: boolean
  equalization: boolean
  sampleRate: number
  bitDepth: number
}

export interface VoiceStyleConfig {
  voiceStyle: 'professional' | 'casual' | 'energetic' | 'calm' | 'friendly'
  speakingRate: number
  pitch: number
  volumeGainDb: number
  clarity: number
}

export class AudioQualityEnhancer {
  private config: AudioEnhancementConfig

  constructor(config: Partial<AudioEnhancementConfig> = {}) {
    this.config = {
      normalize: true,
      noiseReduction: true,
      compression: true,
      equalization: true,
      sampleRate: 24000,
      bitDepth: 16,
      ...config
    }
  }

  /**
   * Get optimized voice configuration based on content type
   */
  getVoiceStyleForContent(content: string): VoiceStyleConfig {
    const isQuestion = content.includes('?')
    const isExclamation = content.includes('!')
    const isLongText = content.length > 200
    const hasEmotionalWords = /(amazing|incredible|wow|great|excellent|terrible|awful)/i.test(content)

    if (isQuestion) {
      return {
        voiceStyle: 'friendly',
        speakingRate: 0.95,
        pitch: 2.0,
        volumeGainDb: 1.0,
        clarity: 1.2
      }
    }

    if (isExclamation || hasEmotionalWords) {
      return {
        voiceStyle: 'energetic',
        speakingRate: 1.1,
        pitch: 1.5,
        volumeGainDb: 2.0,
        clarity: 1.1
      }
    }

    if (isLongText) {
      return {
        voiceStyle: 'calm',
        speakingRate: 0.9,
        pitch: -1.0,
        volumeGainDb: 0.0,
        clarity: 1.0
      }
    }

    return {
      voiceStyle: 'professional',
      speakingRate: 1.0,
      pitch: 0.0,
      volumeGainDb: 0.0,
      clarity: 1.0
    }
  }

  /**
   * Enhance audio data with quality improvements
   */
  async enhanceAudioData(audioData: string): Promise<string> {
    try {
      // Decode base64 audio
      const audioBuffer = this.base64ToArrayBuffer(audioData)
      
      // Apply audio enhancements
      let enhancedBuffer = audioBuffer
      
      if (this.config.normalize) {
        enhancedBuffer = this.normalizeAudio(enhancedBuffer)
      }
      
      if (this.config.noiseReduction) {
        enhancedBuffer = this.reduceNoise(enhancedBuffer)
      }
      
      if (this.config.compression) {
        enhancedBuffer = this.compressAudio(enhancedBuffer)
      }
      
      if (this.config.equalization) {
        enhancedBuffer = this.applyEqualization(enhancedBuffer)
      }
      
      // Convert back to base64
      return this.arrayBufferToBase64(enhancedBuffer)
    } catch (error) {
      console.warn('Audio enhancement failed, returning original:', error)
      return audioData
    }
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Normalize audio levels
   */
  private normalizeAudio(buffer: ArrayBuffer): ArrayBuffer {
    const view = new Int16Array(buffer)
    let max = 0
    
    // Find maximum amplitude
    for (let i = 0; i < view.length; i++) {
      max = Math.max(max, Math.abs(view[i]))
    }
    
    if (max > 0) {
      const scale = 32767 / max * 0.95 // 95% of max to avoid clipping
      for (let i = 0; i < view.length; i++) {
        view[i] = Math.round(view[i] * scale)
      }
    }
    
    return buffer
  }

  /**
   * Simple noise reduction using high-pass filter
   */
  private reduceNoise(buffer: ArrayBuffer): ArrayBuffer {
    const view = new Int16Array(buffer)
    const filtered = new Int16Array(view.length)
    
    // Simple high-pass filter to reduce low-frequency noise
    const alpha = 0.95
    filtered[0] = view[0]
    
    for (let i = 1; i < view.length; i++) {
      filtered[i] = alpha * (filtered[i - 1] + view[i] - view[i - 1])
    }
    
    return filtered.buffer
  }

  /**
   * Apply dynamic range compression
   */
  private compressAudio(buffer: ArrayBuffer): ArrayBuffer {
    const view = new Int16Array(buffer)
    const threshold = 16384 // 50% of max
    const ratio = 4 // 4:1 compression ratio
    
    for (let i = 0; i < view.length; i++) {
      const absValue = Math.abs(view[i])
      if (absValue > threshold) {
        const excess = absValue - threshold
        const compressedExcess = excess / ratio
        const newValue = threshold + compressedExcess
        view[i] = view[i] > 0 ? newValue : -newValue
      }
    }
    
    return buffer
  }

  /**
   * Apply basic equalization for voice clarity
   */
  private applyEqualization(buffer: ArrayBuffer): ArrayBuffer {
    const view = new Int16Array(buffer)
    
    // Boost frequencies around 2-4kHz for voice clarity
    // Simple implementation - in production, use Web Audio API
    for (let i = 0; i < view.length; i++) {
      // Apply slight boost to mid-high frequencies
      if (i % 3 === 0) { // Every 3rd sample gets a boost
        view[i] = Math.round(view[i] * 1.1)
      }
    }
    
    return buffer
  }

  /**
   * Get optimal audio configuration for different use cases
   */
  static getOptimalConfig(useCase: 'conversation' | 'presentation' | 'narration'): AudioEnhancementConfig {
    switch (useCase) {
      case 'conversation':
        return {
          normalize: true,
          noiseReduction: true,
          compression: true,
          equalization: false,
          sampleRate: 24000,
          bitDepth: 16
        }
      case 'presentation':
        return {
          normalize: true,
          noiseReduction: false,
          compression: true,
          equalization: true,
          sampleRate: 24000,
          bitDepth: 16
        }
      case 'narration':
        return {
          normalize: true,
          noiseReduction: true,
          compression: false,
          equalization: true,
          sampleRate: 24000,
          bitDepth: 16
        }
      default:
        return {
          normalize: true,
          noiseReduction: true,
          compression: true,
          equalization: true,
          sampleRate: 24000,
          bitDepth: 16
        }
    }
  }
}
