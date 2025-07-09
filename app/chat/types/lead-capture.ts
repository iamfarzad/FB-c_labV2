export interface LeadCaptureData {
  name: string
  email: string
  company?: string
  role?: string
  interests?: string
  challenges?: string
  sessionSummary?: string
  timestamp?: string
  tcAcceptance: {
    accepted: boolean
    timestamp: string
    version: string
  }
}

export interface LeadCaptureState {
  stage: "initial" | "collecting_info" | "consultation"
  hasName?: boolean
  hasEmail?: boolean
  hasAgreedToTC?: boolean
  leadData: {
    name?: string
    email?: string
    company?: string
    engagementType: string
    initialQuery?: string
  }
}
