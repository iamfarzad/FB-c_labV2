import type { LucideIcon } from "lucide-react"

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  model?: string
}

export interface Activity {
  id: string
  icon: LucideIcon
  title: string
  status: "in_progress" | "completed" | "failed"
  timestamp: string
  type:
    | "thinking"
    | "text_generation"
    | "image_generation"
    | "video_generation"
    | "speech_generation"
    | "music_generation"
    | "long_context"
    | "structured_output"
    | "function_calling"
    | "document_understanding"
    | "image_understanding"
    | "video_understanding"
    | "audio_understanding"
    | "code_execution"
    | "url_context"
    | "google_search"
    | "roi_calculation"
    | "lead_research"
    | "file_upload"
    | "tool_used"
}
