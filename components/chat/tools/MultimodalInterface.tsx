'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useMultimodalSession } from '@/hooks/use-multimodal-session'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff, 
  Square, 
  Play,
  Volume2
} from 'lucide-react'

interface MultimodalInterfaceProps {
  leadId?: string
  onAnalysisComplete?: (result: string) => void
  className?: string
}

export function MultimodalInterface({ 
  leadId, 
  onAnalysisComplete, 
  className = '' 
}: MultimodalInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isWebcamOn, setIsWebcamOn] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState('Orus')
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    session,
    isConnected,
    error,
    startSession,
    stopSession,
    sendVideoFrame,
    sendAudioChunk,
    playAudio
  } = useMultimodalSession()

  // Initialize video elements
  const initializeVideoElements = useCallback(() => {
    if (!videoElement) {
      const video = document.createElement('video')
      video.autoplay = true
      video.muted = true
      setVideoElement(video)
    }
    
    if (!canvasElement) {
      const canvas = document.createElement('canvas')
      setCanvasElement(canvas)
    }
  }, [videoElement, canvasElement])

  // Capture video frame
  const captureFrame = useCallback(() => {
    if (!videoElement?.srcObject || !canvasElement) return null

    const { videoWidth, videoHeight } = videoElement
    if (videoWidth === 0 || videoHeight === 0) return null

    canvasElement.width = videoWidth
    canvasElement.height = videoHeight
    const ctx = canvasElement.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight)
    return canvasElement.toDataURL('image/jpeg', 0.8)
  }, [videoElement, canvasElement])

  // Start recording with all modalities
  const startRecording = useCallback(async () => {
    try {
      setIsProcessing(true)
      
      // Initialize video elements
      initializeVideoElements()

      // Start multimodal session
      await startSession({
        leadId,
        voiceName: selectedVoice,
        audioEnabled: isAudioEnabled,
        videoEnabled: isWebcamOn || isScreenSharing,
        screenShareEnabled: isScreenSharing
      })

      // Get media permissions
      let stream: MediaStream | null = null

      if (isWebcamOn) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: isAudioEnabled,
          video: true
        })
        if (videoElement) {
          videoElement.srcObject = stream
        }
      } else if (isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        })
        
        let audioStream: MediaStream | null = null
        if (isAudioEnabled) {
          audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true
          })
        }

        // Combine streams
        const tracks = [...screenStream.getVideoTracks()]
        if (audioStream) {
          tracks.push(...audioStream.getAudioTracks())
        }
        
        stream = new MediaStream(tracks)
        if (videoElement) {
          videoElement.srcObject = screenStream
        }

        // Handle screen share stop
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          stopRecording()
        }
      } else if (isAudioEnabled) {
        // Audio only
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        })
      }

      if (stream) {
        setMediaStream(stream)
      }

      setIsRecording(true)
      console.log('🎙️ Recording started')

    } catch (error) {
      console.error('❌ Error starting recording:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [
    leadId,
    selectedVoice,
    isAudioEnabled,
    isWebcamOn,
    isScreenSharing,
    startSession,
    initializeVideoElements,
    videoElement
  ])

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      setIsProcessing(true)
      
      // Stop media streams
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
        setMediaStream(null)
      }

      if (videoElement) {
        videoElement.srcObject = null
      }

      // Stop session
      await stopSession()
      
      setIsRecording(false)
      console.log('🛑 Recording stopped')

    } catch (error) {
      console.error('❌ Error stopping recording:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [mediaStream, videoElement, stopSession])

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  // Toggle webcam
  const toggleWebcam = useCallback(() => {
    if (isRecording) return
    
    setIsWebcamOn(prev => !prev)
    if (isScreenSharing) {
      setIsScreenSharing(false)
    }
  }, [isRecording, isScreenSharing])

  // Toggle screen share
  const toggleScreenShare = useCallback(() => {
    if (isRecording) return
    
    setIsScreenSharing(prev => !prev)
    if (isWebcamOn) {
      setIsWebcamOn(false)
    }
  }, [isRecording, isWebcamOn])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (isRecording) return
    setIsAudioEnabled(prev => !prev)
  }, [isRecording])

  // Send video frame periodically
  const sendVideoFramePeriodically = useCallback(() => {
    if (!isRecording || !isConnected) return

    const frame = captureFrame()
    if (frame) {
      const type = isWebcamOn ? 'webcam' as const : 'screen' as const
      sendVideoFrame(frame, type)
    }

    // Schedule next frame
    setTimeout(sendVideoFramePeriodically, 1000) // Send frame every second
  }, [isRecording, isConnected, captureFrame, sendVideoFrame, isWebcamOn])

  // Start video frame sending when recording starts
  if (isRecording && isConnected && (isWebcamOn || isScreenSharing)) {
    setTimeout(sendVideoFramePeriodically, 1000)
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Multimodal AI Assistant
        </CardTitle>
        
        {/* Status Indicators */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              Recording
            </Badge>
          )}
          {isWebcamOn && (
            <Badge variant="outline">
              <Video className="w-3 h-3 mr-1" />
              Webcam
            </Badge>
          )}
          {isScreenSharing && (
            <Badge variant="outline">
              <Monitor className="w-3 h-3 mr-1" />
              Screen Share
            </Badge>
          )}
          {isAudioEnabled && (
            <Badge variant="outline">
              <Volume2 className="w-3 h-3 mr-1" />
              Audio
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Video Preview */}
        {(isWebcamOn || isScreenSharing) && videoElement && (
          <div className="relative">
            <video
              ref={setVideoElement}
              className="w-full h-48 object-cover rounded-lg border border-border bg-muted"
              autoPlay
              muted
              playsInline
              style={{
                transform: isWebcamOn ? 'scaleX(-1)' : 'none'
              }}
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                {isWebcamOn ? 'Webcam' : 'Screen Share'}
              </Badge>
            </div>
          </div>
        )}

        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Voice</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            disabled={isRecording}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
          >
            <option value="Orus">Orus</option>
            <option value="Eirene">Eirene</option>
            <option value="Abeo">Abeo</option>
          </select>
        </div>

        <Separator />

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {/* Audio Toggle */}
          <Button
            variant={isAudioEnabled ? "default" : "outline"}
            size="icon"
            onClick={toggleAudio}
            disabled={isRecording}
            className="w-12 h-12"
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          {/* Webcam Toggle */}
          <Button
            variant={isWebcamOn ? "default" : "outline"}
            size="icon"
            onClick={toggleWebcam}
            disabled={isRecording}
            className="w-12 h-12"
          >
            {isWebcamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          {/* Screen Share Toggle */}
          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="icon"
            onClick={toggleScreenShare}
            disabled={isRecording}
            className="w-12 h-12"
          >
            {isScreenSharing ? <Monitor className="w-5 h-5" /> : <MonitorOff className="w-5 h-5" />}
          </Button>

          {/* Record/Stop Button */}
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="icon"
            onClick={toggleRecording}
            disabled={isProcessing}
            className="w-12 h-12"
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Session Info */}
        {session && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Session ID: {session.sessionId}</p>
            <p>Messages: {session.messageCount}</p>
            <p>Voice: {session.voiceName}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 