export interface VideoToAppProps {
  mode?: 'card' | 'modal'
  videoUrl?: string
  status?: 'pending' | 'analyzing' | 'generating' | 'completed' | 'error'
  progress?: number
  spec?: string
  code?: string
  error?: string
  sessionId?: string
  onClose?: () => void
  onCancel?: () => void
  onAnalysisComplete?: (data: any) => void
}

export interface VideoToAppModalProps {
  videoUrl?: string
  onClose: () => void
  onCancel?: () => void
  onAnalysisComplete?: (data: any) => void
}

export interface VideoToAppCardProps {
  videoUrl: string
  status: 'pending' | 'analyzing' | 'generating' | 'completed' | 'error'
  progress?: number
  spec?: string
  code?: string
  error?: string
  sessionId?: string
  onCancel?: () => void
}

export interface VideoAnalysisResult {
  title: string
  spec: string
  code: string
  summary: string
}
