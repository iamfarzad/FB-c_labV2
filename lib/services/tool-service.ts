import { z } from 'zod'

// Zod schemas for tool results
export const ROICalculationSchema = z.object({
  currentCosts: z.number().min(0),
  projectedSavings: z.number().min(0),
  implementationCost: z.number().min(0),
  timeFrameMonths: z.number().min(1)
})

export const VoiceTranscriptSchema = z.object({
  audioData: z.string().min(1, 'Audio data cannot be empty'),
  mimeType: z.string().optional()
})

export const WebcamCaptureSchema = z.object({
  image: z.string().min(1, 'Image data cannot be empty'),
  type: z.string().optional()
})

export const VideoAppResultSchema = z.object({
  videoUrl: z.string().url(),
  title: z.string().min(1),
  spec: z.string().min(1),
  code: z.string().min(1),
  summary: z.string().min(1)
})

export const ScreenShareSchema = z.object({
  image: z.string().min(1, 'Image data cannot be empty'),
  type: z.string().optional()
})

// Type definitions
export type ROICalculationResult = z.infer<typeof ROICalculationSchema>
export type VoiceTranscriptResult = z.infer<typeof VoiceTranscriptSchema>
export type WebcamCaptureResult = z.infer<typeof WebcamCaptureSchema>
export type VideoAppResult = z.infer<typeof VideoAppResultSchema>
export type ScreenShareResult = z.infer<typeof ScreenShareSchema>

// Service functions
export const handleROICalculation = async (result: ROICalculationResult) => {
  try {
    const validatedResult = ROICalculationSchema.parse(result)
    
    // Business logic for ROI calculation
    const response = await fetch('/api/tools/roi-calculation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedResult)
    })

    if (!response.ok) {
      throw new Error(`ROI calculation failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('ROI calculation error:', error)
    throw new Error('Failed to process ROI calculation')
  }
}

export const handleVoiceTranscript = async (result: VoiceTranscriptResult) => {
  try {
    const validatedResult = VoiceTranscriptSchema.parse(result)
    
    const response = await fetch('/api/tools/voice-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedResult)
    })

    if (!response.ok) {
      throw new Error(`Voice transcript failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Voice transcript error:', error)
    throw new Error('Failed to process voice transcript')
  }
}

export const handleWebcamCapture = async (result: WebcamCaptureResult) => {
  try {
    const validatedResult = WebcamCaptureSchema.parse(result)
    
    const response = await fetch('/api/tools/webcam-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedResult)
    })

    if (!response.ok) {
      throw new Error(`Webcam capture failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Webcam capture error:', error)
    throw new Error('Failed to process webcam capture')
  }
}

export const handleVideoAppResult = async (result: VideoAppResult) => {
  try {
    const validatedResult = VideoAppResultSchema.parse(result)
    
    const response = await fetch('/api/tools/video-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedResult)
    })

    if (!response.ok) {
      throw new Error(`Video app analysis failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Video app error:', error)
    throw new Error('Failed to process video app analysis')
  }
}

export const handleScreenShare = async (result: ScreenShareResult) => {
  try {
    const validatedResult = ScreenShareSchema.parse(result)
    
    const response = await fetch('/api/tools/screen-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedResult)
    })

    if (!response.ok) {
      throw new Error(`Screen share analysis failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Screen share error:', error)
    throw new Error('Failed to process screen share analysis')
  }
}
