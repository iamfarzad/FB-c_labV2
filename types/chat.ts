export interface Message {
  id?: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: Date
  metadata?: any
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}

export interface LeadData {
  name?: string
  email?: string
  company?: string
  role?: string
  interests?: string
  engagementType: "demo" | "free-trial" | "sales-call"
}
