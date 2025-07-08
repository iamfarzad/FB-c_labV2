export interface LeadCaptureState {
  stage: "initial" | "collecting_info" | "tc_agreement" | "research" | "consultation"
  hasName: boolean
  hasEmail: boolean
  hasAgreedToTC: boolean
  leadData: {
    name?: string
    email?: string
    company?: string
    initialQuery?: string
    engagementType: "chat" | "voice" | "screen_share" | "webcam"
  }
}

export interface TCAcceptance {
  accepted: boolean
  timestamp: number
  ipAddress?: string
  userAgent?: string
}
