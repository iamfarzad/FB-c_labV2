export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  model?: string
}

export interface AIModel {
  id: string
  name: string
  provider: string
}

export interface ActivityItem {
  id: string
  type:
    | "lead_research"
    | "roi_calculation"
    | "document_analysis"
    | "meeting_scheduled"
    | "file_upload"
    | "tool_used"
    | "message"
  title: string
  status: "in_progress" | "completed" | "failed"
  timestamp: string
  details?: string
}

export interface ToolAction {
  id: string
  label: string
  icon: string
  description?: string
}
