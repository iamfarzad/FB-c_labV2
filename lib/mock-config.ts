export const MOCK_CONFIG = {
  enabled: process.env.NODE_ENV === 'development' && process.env.ENABLE_GEMINI_MOCKING === 'true',
  
  delays: {
    chat: 1000,
    tts: 800,
    imageAnalysis: 1200,
    documentAnalysis: 1500,
    leadResearch: 2000,
    videoProcessing: 3000,
    geminiLive: 1000,
    analyzeImage: 1200,
    analyzeDocument: 1500,
    analyzeScreenshot: 1000,
    aiStream: 800,
    exportSummary: 500
  },
  
  responses: {
    chat: (message: string) => 
      `[MOCK] Thank you for your message: "${message.substring(0, 50)}...". I'm here to help with your business needs. This is a comprehensive AI response that demonstrates the chat functionality working properly with realistic content length and business context.`,
    
    tts: (prompt: string) => 
      `[MOCK TTS] ${prompt?.substring(0, 100)}... This is a development mock response for text-to-speech functionality.`,
    
    imageAnalysis: (type: string) => 
      type === 'webcam' 
        ? '[MOCK] I can see a person in front of a computer screen. The environment appears to be a home office setup with good lighting. The person seems to be working on what looks like a business application or development environment.'
        : '[MOCK] I can see a screenshot showing what appears to be a business application or website. There are various UI elements visible including navigation menus, content areas, and interactive components.',
    
    documentAnalysis: () => ({
      summary: '[MOCK] This appears to be a business document containing important information about processes, strategies, or operational guidelines.',
      keyInsights: [
        'Business process documentation identified',
        'Potential automation opportunities detected',
        'Strategic recommendations available',
        'Process optimization possibilities noted'
      ],
      recommendations: [
        'Consider AI automation for repetitive tasks',
        'Implement process optimization strategies',
        'Review current workflows for efficiency gains',
        'Explore digital transformation opportunities'
      ]
    }),

    leadResearch: (company: string) => ({
      company: company || '[MOCK] Sample Company',
      industry: 'Technology Services',
      size: '50-200 employees',
      insights: [
        'Growing technology company with expansion opportunities',
        'Strong digital presence and modern tech stack',
        'Potential for AI automation implementation',
        'Active in business development and client acquisition'
      ],
      recommendations: [
        'Focus on AI-driven process automation',
        'Implement customer relationship management improvements',
        'Consider digital transformation consulting',
        'Explore data analytics and business intelligence solutions'
      ]
    }),

    videoProcessing: (url: string) => ({
      title: '[MOCK] Sample Video Analysis',
      summary: 'This video contains educational content about business processes and automation strategies.',
      keyPoints: [
        'Introduction to business automation concepts',
        'Real-world implementation examples',
        'Best practices and recommendations',
        'Future trends and opportunities'
      ],
      interactiveApp: {
        lessons: 3,
        quizzes: 2,
        exercises: 4
      }
    })
  }
}

export function logMockActivity(endpoint: string, correlationId: string) {
  console.log(`🟠 [MOCK] ${endpoint} called with correlation ID: ${correlationId}`)
}

export function generateCorrelationId(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function createMockResponse(content: any, endpoint: string) {
  const correlationId = generateCorrelationId()
  logMockActivity(endpoint, correlationId)
  
  return {
    success: true,
    content,
    correlationId,
    responseTime: Date.now(),
    mock: true,
    timestamp: new Date().toISOString(),
    endpoint
  }
}
