import { useState, useRef, useCallback, useEffect } from 'react'

export interface AudioPlayerState {
  isPlaying: boolean
  isPaused: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  volume: number
  error: string | null
}

export interface AudioPlayerControls {
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  playAudioData: (audioData: string) => Promise<void>
  playStreamingAudio: (chunks: string[]) => Promise<void>
}

interface UseAudioPlayerOptions {
  autoPlay?: boolean
  volume?: number
  onPlay?: () => void
  onPause?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}) {
  const {
    autoPlay = false,
    volume: initialVolume = 0.8,
    onPlay,
    onPause,
    onEnd,
    onError,
    onTimeUpdate,
  } = options

  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: initialVolume,
    error: null,
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio()
    audio.volume = initialVolume
    audio.preload = 'metadata'

    // Event listeners
    audio.addEventListener('loadstart', () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
    })

    audio.addEventListener('loadedmetadata', () => {
      setState(prev => ({ 
        ...prev, 
        duration: audio.duration,
        isLoading: false 
      }))
    })

    audio.addEventListener('timeupdate', () => {
      const currentTime = audio.currentTime
      const duration = audio.duration
      setState(prev => ({ ...prev, currentTime }))
      onTimeUpdate?.(currentTime, duration)
    })

    audio.addEventListener('play', () => {
      setState(prev => ({ ...prev, isPlaying: true, isPaused: false }))
      onPlay?.()
    })

    audio.addEventListener('pause', () => {
      setState(prev => ({ ...prev, isPlaying: false, isPaused: true }))
      onPause?.()
    })

    audio.addEventListener('ended', () => {
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isPaused: false,
        currentTime: 0 
      }))
      onEnd?.()
    })

    audio.addEventListener('error', (e) => {
      const errorMessage = 'Failed to load audio'
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false,
        isPlaying: false 
      }))
      onError?.(errorMessage)
    })

    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
      audio.remove()
    }
  }, [initialVolume, onPlay, onPause, onEnd, onError, onTimeUpdate])

  // Initialize Web Audio Context for advanced audio processing
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }, [])

  const play = useCallback(async () => {
    if (!audioRef.current) return

    try {
      setState(prev => ({ ...prev, error: null }))
      await audioRef.current.play()
    } catch (error) {
      const errorMessage = 'Failed to play audio'
      setState(prev => ({ ...prev, error: errorMessage }))
      onError?.(errorMessage)
    }
  }, [onError])

  const pause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
  }, [])

  const stop = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isPaused: false, 
      currentTime: 0 
    }))
  }, [])

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, Math.min(time, audioRef.current.duration))
  }, [])

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume
    }
    setState(prev => ({ ...prev, volume: clampedVolume }))
  }, [])

  // Play audio from base64 data
  const playAudioData = useCallback(async (audioData: string) => {
    if (!audioRef.current) return

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Handle data URL format
      const audioUrl = audioData.startsWith('data:') 
        ? audioData 
        : `data:audio/mp3;base64,${audioData}`
      
      audioRef.current.src = audioUrl
      
      if (autoPlay) {
        await play()
      }
    } catch (error) {
      const errorMessage = 'Failed to load audio data'
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }))
      onError?.(errorMessage)
    }
  }, [autoPlay, play, onError])

  // Play streaming audio chunks
  const playStreamingAudio = useCallback(async (chunks: string[]) => {
    if (!audioContextRef.current || chunks.length === 0) {
      // Fallback to concatenating chunks for regular audio element
      const fullAudioData = chunks.join('')
      return playAudioData(fullAudioData)
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Decode and play audio chunks using Web Audio API
      const buffers: AudioBuffer[] = []
      
      for (const chunk of chunks) {
        try {
          const binaryString = atob(chunk.replace(/^data:audio\/[^;]+;base64,/, ''))
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          
          const audioBuffer = await audioContextRef.current!.decodeAudioData(bytes.buffer)
          buffers.push(audioBuffer)
        } catch (error) {
          console.warn('Failed to decode audio chunk:', error)
        }
      }

      if (buffers.length === 0) {
        throw new Error('No valid audio chunks found')
      }

      // Create combined buffer
      const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0)
      const combinedBuffer = audioContextRef.current!.createBuffer(
        buffers[0].numberOfChannels,
        totalLength,
        buffers[0].sampleRate
      )

      let offset = 0
      for (const buffer of buffers) {
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          combinedBuffer.copyToChannel(buffer.getChannelData(channel), channel, offset)
        }
        offset += buffer.length
      }

      // Play the combined buffer
      sourceRef.current = audioContextRef.current!.createBufferSource()
      sourceRef.current.buffer = combinedBuffer
      sourceRef.current.connect(audioContextRef.current!.destination)
      
      sourceRef.current.onended = () => {
        setState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          isPaused: false 
        }))
        onEnd?.()
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        isPlaying: true,
        duration: combinedBuffer.duration 
      }))
      
      sourceRef.current.start()
      onPlay?.()

    } catch (error) {
      console.error('Streaming audio playback failed:', error)
      // Fallback to regular concatenation method
      const fullAudioData = chunks.join('')
      return playAudioData(fullAudioData)
    }
  }, [playAudioData, onPlay, onEnd])

  const controls: AudioPlayerControls = {
    play,
    pause,
    stop,
    seek,
    setVolume,
    playAudioData,
    playStreamingAudio,
  }

  return {
    state,
    controls,
    audioElement: audioRef.current,
  }
}

export default useAudioPlayer 