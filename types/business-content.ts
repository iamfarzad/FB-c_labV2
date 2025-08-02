/**
 * Business Content Types for F.B/c Inline Content System
 * Adapted from Gemini-OS interaction framework for business consulting
 */

export interface BusinessInteractionData {
  id: string
  type: 'roi_input' | 'lead_submit' | 'consultation_step' | 'analysis_request' | 'proposal_view' | 'educational_progress' | 'generic_click'
  value?: string
  elementType: string
  elementText: string
  businessContext?: {
    industry?: string
    companySize?: string
    currentTool?: string
    userGoals?: string[]
  }
}

export interface BusinessContentData {
  type: 'roi_calculator' | 'lead_capture' | 'consultation_planner' | 'business_analysis' | 'proposal_generator' | 'educational_module'
  htmlContent: string
  context?: {
    industry?: string
    companySize?: string
    stage?: string
    customData?: Record<string, any>
  }
}

export interface UserBusinessContext {
  industry?: string
  companySize?: string
  businessChallenges?: string[]
  currentGoals?: string[]
  conversationStage?: 'discovery' | 'analysis' | 'proposal' | 'implementation'
  previousInteractions?: BusinessInteractionData[]
}

// Template types for business content generation
export interface BusinessContentTemplate {
  id: string
  name: string
  description: string
  triggerKeywords: string[]
  generateContent: (context: UserBusinessContext) => string
}
