export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  imageUrl?: string
  metadata?: {
    tokens?: number
    cost?: number
    model?: string
    processingTime?: number
  }
}

export interface ActivityItem {
  id: string
  type: "user_action" | "ai_request" | "search" | "file_upload" | "image_upload" | "voice_input" | "error" | "system"
  title: string
  description: string
  timestamp: number
  status: "in_progress" | "completed" | "failed"
  details?: string[]
  metadata?: {
    tokens?: number
    cost?: number
    model?: string
    duration?: number
  }
}

export interface ChatSession {
  id: string
  messages: Message[]
  activities: ActivityItem[]
  createdAt: Date
  updatedAt: Date
  leadData?: any
}
