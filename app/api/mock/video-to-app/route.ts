import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG, logMockActivity, generateCorrelationId } from '@/lib/mock-config'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = generateCorrelationId()
  
  try {
    const { videoUrl, learningObjectives } = await req.json()
    
    logMockActivity('video-to-app', correlationId)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.delays.videoProcessing))
    
    const mockApp = {
      title: '[MOCK] Educational App Generated from Video',
      description: 'This is a mock educational application generated from the provided video content.',
      learningObjectives: [
        'Understand key concepts from the video',
        'Apply knowledge through interactive exercises',
        'Test comprehension with quizzes'
      ],
      features: [
        'Interactive video player with annotations',
        'Knowledge check quizzes',
        'Progress tracking dashboard',
        'Discussion forum for learners'
      ],
      codeSnippet: `// Mock React component for educational app
function EducationalApp() {
  return (
    <div className="educational-app">
      <h1>Learning from Video Content</h1>
      <p>This is a mock educational application.</p>
    </div>
  );
}`,
      metadata: {
        videoUrl,
        processingTime: Date.now() - startTime,
        generatedAt: new Date().toISOString()
      }
    }
    
    return NextResponse.json({
      ...mockApp,
      correlationId,
      responseTime: Date.now() - startTime,
      mock: true
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Mock video-to-app error',
      details: error instanceof Error ? error.message : 'Unknown error',
      correlationId
    }, { status: 500 })
  }
} 