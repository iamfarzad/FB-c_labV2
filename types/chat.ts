import type React from "react"
export interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "file" | "analysis"
}

export interface Activity {
  id: string
  icon: React.ElementType
  title: string
  status: "in_progress" | "completed" | "failed"
  timestamp: string
}
