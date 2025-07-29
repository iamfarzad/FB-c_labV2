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
  role: "user" | "assistant"
  content: string
  timestamp: string
  model?: string
}

export interface ActivityItem {
  id: string
  type: string
  status: "active" | "completed" | "failed"
  title: string
  timestamp: string
  details?: any
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
  currentModel: string
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

export interface ModalState {
  isOpen: boolean
  type: string | null
}
