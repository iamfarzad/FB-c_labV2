export interface ROICalculationResult {
  companySize: string
  industry: string
  useCase: string
  currentProcessTime: number
  currentCost: number
  automationPotential: number
  estimatedROI: number
  timeSavings: number
  costSavings: number
  paybackPeriod: number
}

export interface ROICalculatorProps {
  mode?: 'card' | 'modal'
  onComplete: (result: ROICalculationResult) => void
  onClose?: () => void
  onCancel?: () => void
  /** Session id used for analytics + context prefill */
  sessionId?: string | null
  /** Optional defaults derived from chat lead context */
  defaults?: {
    companySize?: string
    industry?: string
    useCase?: string
  }
  onEmitMessage?: (msg: import('@/types/chat').ChatMessage) => void
}

export interface ROICalculatorModalProps {
  isOpen: boolean
  onClose: () => void
  onCalculationComplete?: (result: ROICalculationResult) => void
}

export interface ROICalculatorCardProps {
  onComplete: (result: ROICalculationResult) => void
  onCancel: () => void
}

export type WizardStep = "company-info" | "metrics" | "results"
