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

// -------- Structured tool/event messages (chat pipeline) --------
export type ROIResultPayload = {
  roi: number
  paybackMonths: number | null
  netProfit: number
  monthlyProfit: number
  totalRevenue: number
  totalExpenses: number
  inputs: {
    initialInvestment: number
    monthlyRevenue: number
    monthlyExpenses: number
    timePeriod: number
    companySize?: string
    industry?: string
    useCase?: string
  }
  calculatedAt: string
}

export type ChatMessage =
  | { role: "assistant"; type: "text"; content: string }
  | { role: "tool"; type: "roi.result"; payload: ROIResultPayload }
