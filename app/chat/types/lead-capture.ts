export interface LeadCaptureState {
  stage: "initial" | "collecting_info" | "consultation"
  leadData: {
    name?: string
    email?: string
    company?: string
    engagementType: string
    initialQuery?: string
  }
}
