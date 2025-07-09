export interface LeadCaptureData {
  name: string
  email: string
  company?: string
  role?: string
  interests?: string
  challenges?: string
  engagementType?: string
  initialQuery?: string
  timestamp: string
  tcAcceptance: {
    accepted: boolean
    timestamp: string
    version: string
  }
}

export interface LeadCaptureState {
  stage: "initial" | "collecting_info" | "consultation"
  leadData: Partial<LeadCaptureData>
}
