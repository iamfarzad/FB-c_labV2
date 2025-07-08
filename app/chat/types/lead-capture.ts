export interface LeadCaptureData {
  name: string
  email: string
  company?: string
  role?: string
  interests?: string
  challenges?: string
  sessionSummary?: string
  timestamp: string
  tcAcceptance: {
    accepted: boolean
    timestamp: string
    version: string
  }
}

export interface LeadCaptureResponse {
  success: boolean
  leadId?: string
  message?: string
  error?: string
}
