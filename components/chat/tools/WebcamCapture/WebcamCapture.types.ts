export interface WebcamCaptureProps {
  mode?: 'card' | 'modal'
  onCapture: (imageData: string) => void
  onClose?: () => void
  onCancel?: () => void
  onAIAnalysis?: (analysis: string) => void
}

export interface WebcamCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture?: (imageData: string) => void
  onAIAnalysis?: (analysis: string) => void
}

export interface WebcamCaptureCardProps {
  onCapture: (imageData: string) => void
  onCancel: () => void
  onAIAnalysis?: (analysis: string) => void
}

export type WebcamState = "initializing" | "active" | "error" | "stopped" | "permission-denied"
export type InputMode = "camera" | "upload"
