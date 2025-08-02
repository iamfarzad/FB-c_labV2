export interface ScreenShareProps {
  mode?: 'card' | 'modal'
  onAnalysis: (analysis: string) => void
  onClose?: () => void
  onCancel?: () => void
  onStream?: (stream: MediaStream) => void
}

export interface ScreenShareModalProps {
  isOpen: boolean
  onClose: () => void
  onAnalysis?: (analysis: string) => void
}

export interface ScreenShareCardProps {
  onAnalysis: (analysis: string) => void
  onCancel: () => void
  onStream?: (stream: MediaStream) => void
}

export type ScreenShareState = "initializing" | "sharing" | "analyzing" | "error" | "stopped"
