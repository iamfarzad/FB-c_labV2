import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { image, analysisType } = body

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 600))

    // Create mock image analysis response
    const mockResponse = {
      id: `img-analysis-${Date.now()}`,
      image: {
        name: image?.name || 'sample-image.jpg',
        type: image?.type || 'image/jpeg',
        size: image?.size || 1024000,
        dimensions: {
          width: 1920,
          height: 1080
        }
      },
      analysis: {
        description: 'This image shows a modern office environment with multiple people working at computers. The setting appears to be a technology company with open workspace design, featuring collaborative areas and modern equipment.',
        objects: [
          { name: 'computer', confidence: 0.98, count: 6 },
          { name: 'person', confidence: 0.95, count: 4 },
          { name: 'desk', confidence: 0.92, count: 4 },
          { name: 'chair', confidence: 0.90, count: 5 },
          { name: 'monitor', confidence: 0.88, count: 8 },
          { name: 'keyboard', confidence: 0.85, count: 6 }
        ],
        people: {
          count: 4,
          demographics: {
            estimated_ages: ['25-35', '30-40', '25-30', '35-45'],
            gender_distribution: { male: 2, female: 2 },
            activities: ['typing', 'discussing', 'reviewing documents', 'presenting']
          }
        },
        scene: {
          setting: 'office environment',
          lighting: 'natural and artificial',
          mood: 'professional and collaborative',
          time_of_day: 'daytime',
          indoor_outdoor: 'indoor'
        },
        text: {
          detected: true,
          content: [
            'QUARTERLY RESULTS',
            'AI AUTOMATION',
            'PRODUCTIVITY +45%'
          ],
          locations: [
            { text: 'QUARTERLY RESULTS', x: 120, y: 45, confidence: 0.92 },
            { text: 'AI AUTOMATION', x: 340, y: 180, confidence: 0.88 },
            { text: 'PRODUCTIVITY +45%', x: 560, y: 220, confidence: 0.85 }
          ]
        },
        colors: {
          dominant: ['#2C3E50', '#3498DB', '#FFFFFF', '#ECF0F1'],
          palette: 'professional blue and gray tones',
          mood: 'corporate and modern'
        },
        quality: {
          resolution: 'high',
          clarity: 'excellent',
          lighting: 'good',
          composition: 'well-balanced'
        }
      },
      insights: [
        'Image depicts a productive, modern workplace',
        'Technology-focused environment with multiple screens',
        'Collaborative workspace design promotes teamwork',
        'Professional setting suitable for business presentations',
        'Evidence of data-driven work (charts and metrics visible)'
      ],
      businessContext: {
        industry: 'Technology/Consulting',
        useCase: 'Workplace productivity showcase',
        relevance: 'High - aligns with AI automation messaging',
        recommendations: [
          'Use for productivity improvement case studies',
          'Highlight collaborative work environment',
          'Emphasize technology integration',
          'Showcase modern workplace transformation'
        ]
      },
      confidence: 0.91,
      processingTime: 600,
      timestamp: new Date().toISOString(),
      metadata: {
        analysisType: analysisType || 'comprehensive',
        model: 'image-analysis-mock',
        version: '1.0',
        features: ['object_detection', 'text_recognition', 'scene_analysis', 'color_analysis']
      }
    }

    return NextResponse.json(mockResponse)

  } catch (error) {
    console.error('Mock image analysis API error:', error)
    return NextResponse.json(
      { error: 'Mock API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
