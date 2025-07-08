export interface LeadCaptureState {
  stage: "initial" | "collecting_info" | "tc_agreement" | "research" | "consultation"
  hasName: boolean
  hasEmail: boolean
  hasAgreedToTC: boolean
  leadData: {
    name?: string
    email?: string
    company?: string
    role?: string
    interests?: string
    initialQuery?: string
    engagementType: "chat" | "voice" | "screen_share" | "webcam"
    agreedToTerms?: boolean
    capturedAt?: string
  }
}

export interface TCAcceptance {
  accepted: boolean
  timestamp: number
  ipAddress?: string
  userAgent?: string
}
