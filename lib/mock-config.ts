export const MOCK_CONFIG = {
  enabled: process.env.NODE_ENV === 'development' && process.env.ENABLE_GEMINI_MOCKING === 'true',
  
  // Mock response delays (in ms)
  delays: {
    chat: 1000,
    tts: 800,
    imageAnalysis: 1200,
    documentAnalysis: 1500,
    leadResearch: 2000,
    videoProcessing: 3000
  },
  
  // Mock data templates
  responses: {
    chat: (message: string) => `[MOCK] Thank you for your message: "${message.substring(0, 50)}...". I'm here to help with your business needs. This is a development mock response.`,
    
    tts: (prompt: string) => `[MOCK TTS] ${prompt?.substring(0, 100)}... This is a development mock response.`,
    
    imageAnalysis: (type: string) => type === 'webcam' 
      ? '[MOCK] I can see a person in front of a computer screen. The environment appears to be a home office setup with good lighting. The person seems to be working on something on their computer. This is a development mock response for webcam analysis.'
      : '[MOCK] I can see a screenshot showing what appears to be a business application or website. The interface contains various UI elements and text content. This appears to be a professional software interface. This is a development mock response for screenshot analysis.',
    
    documentAnalysis: () => ({
      summary: '[MOCK] This appears to be a business document containing important information about company operations, strategies, or processes. The document shows structured content with various sections and data points.',
      keyInsights: [
        'Business process documentation identified',
        'Potential automation opportunities detected',
        'Strategic planning elements present'
      ],
      recommendations: [
        'Consider AI automation for repetitive tasks',
        'Implement process optimization strategies',
        'Explore digital transformation opportunities'
      ],
      painPoints: [
        'Manual processes that could be automated',
        'Data entry and processing inefficiencies',
        'Communication workflow bottlenecks'
      ]
    }),

    leadResearch: (name: string, company: string) => ({
      leadProfile: {
        name,
        company,
        role: 'Business Development Manager',
        industry: 'Technology',
        companySize: '50-200 employees'
      },
      businessChallenges: [
        'Manual lead qualification processes',
        'Inefficient customer onboarding',
        'Limited data-driven decision making'
      ],
      aiOpportunities: [
        'Automated lead scoring and qualification',
        'Intelligent customer journey mapping',
        'Predictive analytics for sales forecasting'
      ],
      outreachStrategy: {
        approach: 'Value-based consultation',
        keyMessage: 'Focus on ROI and efficiency gains',
        followUpPlan: 'Multi-touch campaign with personalized content'
      }
    })
  }
}

export function logMockActivity(endpoint: string, correlationId: string) {
  console.log(`🟠 [MOCK] ${endpoint} called with correlation ID: ${correlationId}`)
}

export function generateCorrelationId(): string {
  return Math.random().toString(36).substring(7)
} 