export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
  imageUrl?: string
  sources?: Array<{
    title?: string
    url: string
  }>
  videoToAppCard?: {
    videoUrl: string
    status: 'pending' | 'analyzing' | 'generating' | 'completed' | 'error'
    sessionId: string
    progress?: number
    spec?: string
    code?: string
    error?: string
  }
  businessContent?: {
    type: 'roi_calculator' | 'lead_capture' | 'consultation_planner' | 'business_analysis' | 'proposal_generator' | 'educational_module'
    htmlContent: string
    context?: {
      industry?: string
      companySize?: string
      stage?: string
      customData?: Record<string, any>
    }
  }
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error?: string
}

export interface LeadContext {
  name?: string
  company?: string
  role?: string
  interests?: string
}
