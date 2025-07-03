export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  metadata?: {
    sources?: Source[]
    audioData?: string
    audioMimeType?: string
    sidebarActivity?: string
  }
}

export interface Source {
  title: string
  url: string
  snippet: string
}

export interface ActivityItem {
  id: string
  type:
    | "user_action"
    | "ai_thinking"
    | "processing"
    | "complete"
    | "error"
    | "document_analysis"
    | "video_analysis"
    | "url_analysis"
    | "code_execution"
    | "image_generation"
    | "voice_generation"
    | "company_analysis"
    | "webcam_analysis"
    | "screen_analysis"
  title: string
  description: string
  timestamp: number
  status: "pending" | "in_progress" | "completed" | "failed"
  progress?: number
  metadata?: Record<string, any>
}

export interface ChatContextType {
  messages: Message[]
  input: string
  isLoading: boolean
  activities: ActivityItem[]
  setInput: (input: string) => void
  sendMessage: (content: string) => Promise<void>
  addActivity: (activity: Omit<ActivityItem, "id" | "timestamp">) => void
  updateActivity: (id: string, updates: Partial<ActivityItem>) => void
  uploadFile: (file: File) => Promise<void>
  uploadMedia: (file: File) => Promise<string | undefined>
}

export interface ConversationState {
  sessionId: string
  stage: string
  messages: Array<{
    role: "user" | "model"
    parts: Array<{ text: string }>
  }>
  messagesInStage: number
  name?: string
  email?: string
  companyInfo?: {
    name?: string
    domain?: string
    industry?: string
    analysis?: string
  }
  aiGuidance?: string
  sidebarActivity?: string
  isLimitReached?: boolean
}
