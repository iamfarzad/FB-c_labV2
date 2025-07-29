export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system" | "function" | "data" | "tool"
  content: string
  createdAt: Date
  sources?: any[]
  audioData?: string | null
  imageUrl?: string
  metadata?: Record<string, any>
}

export interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "file" | "analysis" | "roi" | "lead" | "meeting"
  imageUrl?: string
  sources?: any[]
  metadata?: Record<string, any>
}

export interface ActivityItem {
  id: string
  type:
    | "user_action"
    | "ai_request"
    | "ai_stream"
    | "tool_used"
    | "roi_calculation"
    | "lead_research"
    | "document_analysis"
    | "meeting_scheduled"
    | "voice_input"
    | "webcam_capture"
    | "screen_share"
    | "file_upload"
    | "modal_opened"
    | "modal_closed"
    | "new_chat"
    | "export"
    | "error"
  title?: string
  description?: string
  content: string
  status?: "pending" | "in_progress" | "completed" | "failed"
  timestamp: string
  duration?: number
  details?: string[]
  metadata?: Record<string, any>
}

export interface ActiveFeatures {
  voice: boolean
  video: boolean
  screen: boolean
}

export type ModalType = "voiceInput" | "webcam" | "screenShare"

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error?: string
  sessionId: string
  isTyping: boolean
  activeFeatures: ActiveFeatures
  activeModal: ModalType | null
  activities: ActivityItem[]
}

export interface StreamChunk {
  type: "text" | "function_call" | "tool_use" | "error"
  content: string
  metadata?: Record<string, any>
}

export interface AIResponse {
  id: string
  content: string
  role: "assistant"
  timestamp: string
  sources?: string[]
  audioData?: string | null
  metadata?: Record<string, any>
}

export interface BusinessTool {
  id: string
  name: string
  icon: string
  description: string
  category: "analysis" | "generation" | "communication" | "media"
  enabled: boolean
}

export interface ROICalculation {
  investment: number
  returns: number
  timeframe: string
  roi: number
  recommendations: string[]
}

export interface LeadData {
  id: string
  name: string
  email: string
  company: string
  status: "new" | "contacted" | "qualified" | "converted"
  source: string
  value: number
}
