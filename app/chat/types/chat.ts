export interface Message {
  id: string
  role: "user" | "assistant" | "system" | "function" | "data" | "tool"
  content: string
  timestamp: Date // In the stable version, timestamp was required and always a Date object.
  sources?: any[]
  audioData?: string | null
  imageUrl?: string
  metadata?: Record<string, any>
}

export interface ActivityItem {
  id: string
  type:
    | "user_action"
    | "ai_request"
    | "ai_stream"
    | "stream_chunk"
    | "tool_used"
    | "google_search"
    | "web_scrape"
    | "doc_analysis"
    | "memory_update"
    | "grounding"
    | "function_call"
    | "image_upload"
    | "image_capture"
    | "voice_input"
    | "voice_response"
    | "screen_share"
    | "file_upload"
    | "lead_capture"
    | "search"
    | "link"
    | "ai_thinking"
    | "vision_analysis"
    | "error"
    | "generic"
    | "database"
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "failed"
  timestamp: number
  duration?: number
  details?: string[]
  metadata?: Record<string, any>
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error?: string
  sessionId: string
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
