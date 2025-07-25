import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG, logMockActivity, generateCorrelationId } from '@/lib/mock-config'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = generateCorrelationId()
  
  try {
    const { topic, difficulty, format } = await req.json()
    
    logMockActivity('educational-content', correlationId)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.delays.chat))
    
    const mockContent = {
      title: `[MOCK] Educational Content: ${topic}`,
      content: `This is mock educational content about ${topic}. It's designed for ${difficulty} level learners and presented in ${format} format.`,
      learningObjectives: [
        'Understand the basic concepts',
        'Apply knowledge in practical scenarios',
        'Evaluate different approaches'
      ],
      exercises: [
        {
          type: 'multiple-choice',
          question: 'What is the primary benefit of this approach?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A'
        }
      ],
      resources: [
        'Additional reading materials',
        'Practice exercises',
        'Video tutorials'
      ],
      metadata: {
        topic,
        difficulty,
        format,
        generatedAt: new Date().toISOString()
      }
    }
    
    return NextResponse.json({
      ...mockContent,
      correlationId,
      responseTime: Date.now() - startTime,
      mock: true
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Mock educational content error',
      details: error instanceof Error ? error.message : 'Unknown error',
      correlationId
    }, { status: 500 })
  }
} 