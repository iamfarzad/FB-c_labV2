import { z } from 'zod'

// ROI Calculation Schema
export const ROICalculationSchema = z.object({
  initialInvestment: z.number().min(0, 'Initial investment must be positive'),
  monthlyRevenue: z.number().min(0, 'Monthly revenue must be positive'),
  monthlyExpenses: z.number().min(0, 'Monthly expenses must be positive'),
  timePeriod: z.number().min(1, 'Time period must be at least 1 month').max(60, 'Time period cannot exceed 60 months')
})

export const VoiceTranscriptSchema = z.object({
  audioData: z.string().min(1, 'Audio data cannot be empty'),
  mimeType: z.string().optional()
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
  type: z.string().min(1, 'Type cannot be empty')
})

export const WebcamCaptureSchema = z.object({
  image: z.string().min(1, 'Image data cannot be empty'),
  type: z.string().min(1, 'Type cannot be empty')
})

// Type definitions
export type ROICalculationResult = z.infer<typeof ROICalculationSchema>
export type VoiceTranscriptResult = z.infer<typeof VoiceTranscriptSchema>
export type VideoAppResult = z.infer<typeof VideoAppResultSchema>
export type ScreenShareResult = z.infer<typeof ScreenShareSchema>
export type WebcamCaptureResult = z.infer<typeof WebcamCaptureSchema>

// Service functions
export const handleROICalculation = async (result: ROICalculationResult) => {
  try {
    const validatedResult = ROICalculationSchema.parse(result)
    
    // Business logic for ROI calculation
    const response = await fetch('/api/tools/roi', {
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

export const handleVideoAppResult = async (result: VideoAppResult) => {
  try {
    const validatedResult = VideoAppResultSchema.parse(result)
    
    const response = await fetch('/api/video-to-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedResult)
    })

    if (!response.ok) {
      throw new Error(`Video to app failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Video to app error:', error)
    throw new Error('Failed to process video to app')
  }
}

export const handleScreenShare = async (result: ScreenShareResult) => {
  try {
    const validatedResult = ScreenShareSchema.parse(result)
    
    const response = await fetch('/api/tools/screen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedResult)
    })

    if (!response.ok) {
      throw new Error(`Screen share analysis failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Screen share analysis error:', error)
    throw new Error('Failed to process screen share analysis')
  }
}

export const handleWebcamCapture = async (result: WebcamCaptureResult) => {
  try {
    const validatedResult = WebcamCaptureSchema.parse(result)
    
    const response = await fetch('/api/tools/webcam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedResult)
    })

    if (!response.ok) {
      throw new Error(`Webcam capture analysis failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Webcam capture analysis error:', error)
    throw new Error('Failed to process webcam capture analysis')
  }
}


