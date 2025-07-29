export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
}

export interface AIModel {
  id: string
  name: string
  provider: string
}

export interface ActivityItem {
  id: string
  type: "lead_research" | "roi_calculation" | "document_analysis" | "meeting_scheduled" | "file_upload"
  title: string
  status: "in_progress" | "completed" | "failed"
  timestamp: Date
  details?: string
}

export interface ToolAction {
  id: string
  label: string
  icon: string
  description?: string
}
