export interface VideoToAppData {
  url: string
  spec: string
  code: string
  title?: string
}

export interface VideoAnalysisResult {
  success: boolean
  data?: VideoToAppData
  error?: string
}

export type VideoProcessingState = "idle" | "validating" | "loading-spec" | "loading-code" | "ready" | "error"
