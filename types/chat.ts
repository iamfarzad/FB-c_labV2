import type { LucideIcon } from "lucide-react"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  model?: string
  imageUrl?: string
  sources?: Array<{
    title: string
    url: string
  }>
}

export interface ActivityItem {
  id: string
  type:
    | "message"
    | "tool_used"
    | "file_upload"
    | "lead_research"
    | "roi_calculation"
    | "document_analysis"
    | "meeting_scheduled"
    | "text_generation"
    | "image_generation"
    | "video_generation"
    | "speech_generation"
    | "music_generation"
    | "long_context"
    | "structured_output"
    | "thinking"
    | "function_calling"
    | "image_understanding"
    | "video_understanding"
    | "audio_understanding"
    | "code_execution"
    | "url_context"
    | "google_search"
  title: string
  status: "completed" | "failed" | "in_progress"
  timestamp: string
  details?: string
  icon: LucideIcon // Added icon property
}

export interface AIModel {
  id: string
  name: string
  provider: string
  description?: string
}

export interface ChatState {
  messages: Message[]
  activities: ActivityItem[]
  isLoading: boolean
  activeModal: string | null
}

export interface Activity extends ActivityItem {} // Alias for clarity in ActivityPanel
