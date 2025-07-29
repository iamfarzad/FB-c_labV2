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
  title: string
  status: "completed" | "failed" | "in_progress"
  timestamp: string
  details?: string
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
