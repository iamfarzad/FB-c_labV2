import { useState, useEffect, useCallback, useRef } from 'react'

interface VoiceRecorderConfig {
  onAudioChunk: (chunk: ArrayBuffer) => void
  onTurnComplete: () => void
  vadSilenceThreshold?: number // ms of silence before turn complete
  sampleRate?: number // Target sample rate (16kHz for Gemini)
  chunkSize?: number // Size of audio chunks to send
}

interface VoiceRecorderState {
  isRecording: boolean
  isInitializing: boolean
  error: string | null
  volume: number
  hasPermission: boolean
}

export function useVoiceRecorder({
  onAudioChunk,
  onTurnComplete,
  vadSilenceThreshold = 700,
  sampleRate = 16000,
  chunkSize = 4096
}: VoiceRecorderConfig) {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isInitializing: false,
    error: null,
    volume: 0,
    hasPermission: false
  })

  // Audio processing refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null)
  const analyserNodeRef = useRef<AnalyserNode | null>(null)
  
  // VAD and timing refs
  const silenceStartRef = useRef<number | null>(null)
  const lastSpeechTimeRef = useRef<number>(0)
  const isProcessingTurnCompleteRef = useRef<boolean>(false)
  
  // Audio data refs
  const audioBufferRef = useRef<Float32Array[]>([])
  const volumeDataRef = useRef<Uint8Array>(new Uint8Array(256))

  // Initialize audio context
  const initializeAudioContext = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isInitializing: true, error: null }))

      // Create audio context with target sample rate
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000 // Use browser's native rate, we'll resample
      })

      // Resume if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 48000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      mediaStreamRef.current = stream
      
      // Create audio processing nodes
      const source = audioContextRef.current.createMediaStreamSource(stream)
      const analyser = audioContextRef.current.createAnalyser()
      const processor = audioContextRef.current.createScriptProcessor(chunkSize, 1, 1)

      sourceNodeRef.current = source
      analyserNodeRef.current = analyser
      processorNodeRef.current = processor

      // Configure analyser for volume detection
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.3

      // Connect audio nodes
      source.connect(analyser)
      analyser.connect(processor)
      processor.connect(audioContextRef.current.destination)

      setState(prev => ({ 
        ...prev, 
        isInitializing: false, 
        hasPermission: true,
        error: null 
      }))

      console.log('✅ Audio context initialized successfully')
      return true

    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error)
      setState(prev => ({ 
        ...prev, 
        isInitializing: false, 
        error: error instanceof Error ? error.message : 'Failed to access microphone',
        hasPermission: false
      }))
      return false
    }
  }, [chunkSize])

  // Resample audio from source rate to target rate (16kHz)
  const resampleAudio = useCallback((inputBuffer: Float32Array, inputSampleRate: number): Float32Array => {
    if (inputSampleRate === sampleRate) {
      return inputBuffer
    }

    const ratio = inputSampleRate / sampleRate
    const outputLength = Math.round(inputBuffer.length / ratio)
    const outputBuffer = new Float32Array(outputLength)

    for (let i = 0; i < outputLength; i++) {
      const sourceIndex = i * ratio
      const index = Math.floor(sourceIndex)
      const fraction = sourceIndex - index

      if (index + 1 < inputBuffer.length) {
        // Linear interpolation
        outputBuffer[i] = inputBuffer[index] * (1 - fraction) + inputBuffer[index + 1] * fraction
      } else {
        outputBuffer[i] = inputBuffer[index] || 0
      }
    }

    return outputBuffer
  }, [sampleRate])

  // Convert Float32Array to 16-bit PCM ArrayBuffer
  const convertToPCM16 = useCallback((floatBuffer: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(floatBuffer.length * 2)
    const view = new DataView(buffer)
    
    for (let i = 0; i < floatBuffer.length; i++) {
      // Clamp to [-1, 1] and convert to 16-bit signed integer
      const sample = Math.max(-1, Math.min(1, floatBuffer[i]))
      const pcmSample = Math.round(sample * 32767)
      view.setInt16(i * 2, pcmSample, true) // little-endian
    }
    
    return buffer
  }, [])

  // Calculate volume level for visualization
  const calculateVolume = useCallback((): number => {
    if (!analyserNodeRef.current) return 0

    analyserNodeRef.current.getByteFrequencyData(volumeDataRef.current)
    
    let sum = 0
    for (let i = 0; i < volumeDataRef.current.length; i++) {
      sum += volumeDataRef.current[i]
    }
    
    return sum / volumeDataRef.current.length / 255 // Normalize to 0-1
  }, [])

  // Simple Voice Activity Detection
  const detectVoiceActivity = useCallback((volume: number): boolean => {
    const voiceThreshold = 0.005 // Lowered threshold for better detection
    return volume > voiceThreshold
  }, [])

  // Process audio chunk
  const processAudioChunk = useCallback((inputBuffer: Float32Array) => {
    const currentTime = Date.now()
    const volume = calculateVolume()
    
    // Update volume state
    setState(prev => ({ ...prev, volume }))

    // Voice Activity Detection
    const hasVoice = detectVoiceActivity(volume)
    
    if (hasVoice) {
      lastSpeechTimeRef.current = currentTime
      silenceStartRef.current = null
    } else {
      if (silenceStartRef.current === null) {
        silenceStartRef.current = currentTime
      }
    }

    // Resample to target rate (16kHz)
    const resampledBuffer = resampleAudio(inputBuffer, audioContextRef.current?.sampleRate || 48000)
    
    // Convert to 16-bit PCM
    const pcmBuffer = convertToPCM16(resampledBuffer)
    
    // Send audio chunk
    onAudioChunk(pcmBuffer)

    // Check for turn complete (silence detection)
    if (
      silenceStartRef.current !== null && 
      currentTime - silenceStartRef.current >= vadSilenceThreshold &&
      currentTime - lastSpeechTimeRef.current >= vadSilenceThreshold &&
      !isProcessingTurnCompleteRef.current
    ) {
      console.log(`🔇 Silence detected for ${vadSilenceThreshold}ms, completing turn`)
      isProcessingTurnCompleteRef.current = true
      
      // Reset silence detection
      silenceStartRef.current = null
      
      // Signal turn complete
      onTurnComplete()
      
      // Reset flag after a short delay
      setTimeout(() => {
        isProcessingTurnCompleteRef.current = false
      }, 1000)
    }
  }, [
    calculateVolume,
    detectVoiceActivity,
    resampleAudio,
    convertToPCM16,
    onAudioChunk,
    onTurnComplete,
    vadSilenceThreshold
  ])

  // Add a ref to track recording state for the audio processor
  const isRecordingRef = useRef<boolean>(false)

  // Start recording
  const startRecording = useCallback(async () => {
    if (state.isRecording) {
      console.warn('Recording already in progress')
      return false
    }

    try {
      // Initialize audio context if needed
      if (!audioContextRef.current || !state.hasPermission) {
        const initialized = await initializeAudioContext()
        if (!initialized) return false
      }

      // Set up audio processing
      if (processorNodeRef.current) {
        processorNodeRef.current.onaudioprocess = (event) => {
          // Use ref instead of state to avoid closure issues
          if (isRecordingRef.current) {
            const inputBuffer = event.inputBuffer.getChannelData(0)
            processAudioChunk(inputBuffer)
          }
        }
      }

      // Reset timing references
      lastSpeechTimeRef.current = Date.now()
      silenceStartRef.current = null
      isProcessingTurnCompleteRef.current = false
      audioBufferRef.current = []

      // Update both state and ref
      isRecordingRef.current = true
      setState(prev => ({ ...prev, isRecording: true, error: null }))
      console.log('🎤 Recording started')
      return true

    } catch (error) {
      console.error('❌ Failed to start recording:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start recording' 
      }))
      return false
    }
  }, [state.isRecording, state.hasPermission, initializeAudioContext, processAudioChunk])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!state.isRecording) {
      console.warn('No recording in progress')
      return
    }

    try {
      // Stop audio processing
      if (processorNodeRef.current) {
        processorNodeRef.current.onaudioprocess = null
      }

      // Update both state and ref
      isRecordingRef.current = false
      setState(prev => ({ ...prev, isRecording: false, volume: 0 }))
      console.log('🛑 Recording stopped')

    } catch (error) {
      console.error('❌ Error stopping recording:', error)
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error stopping recording' 
      }))
    }
  }, [state.isRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isRecording) {
        stopRecording()
      }
      
      // Cleanup audio resources
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, []) // Only run on unmount

  return {
    ...state,
    startRecording,
    stopRecording,
    initializeAudioContext
  }
}
