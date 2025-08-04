import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { document, analysisType } = body

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Create mock document analysis response
    const mockResponse = {
      id: `doc-analysis-${Date.now()}`,
      document: {
        name: document?.name || 'sample-document.pdf',
        type: document?.type || 'application/pdf',
        size: document?.size || 245760,
        pages: 5
      },
      analysis: {
        summary: 'This document appears to be a business proposal outlining AI automation opportunities for enterprise clients. It covers current challenges, proposed solutions, and implementation roadmap.',
        keyPoints: [
          'Current manual processes are costing 40+ hours per week',
          'Proposed AI automation could reduce processing time by 75%',
          'ROI projection shows 300% return within 12 months',
          'Implementation timeline: 3-6 months',
          'Required investment: $50,000-$75,000'
        ],
        entities: [
          { type: 'Organization', value: 'Acme Corporation', confidence: 0.95 },
          { type: 'Person', value: 'John Smith', confidence: 0.90 },
          { type: 'Date', value: '2024-Q2', confidence: 0.85 },
          { type: 'Money', value: '$75,000', confidence: 0.92 }
        ],
        sentiment: {
          overall: 'positive',
          confidence: 0.78,
          breakdown: {
            positive: 0.65,
            neutral: 0.25,
            negative: 0.10
          }
        },
        topics: [
          { topic: 'AI Automation', relevance: 0.95 },
          { topic: 'Process Optimization', relevance: 0.88 },
          { topic: 'Cost Reduction', relevance: 0.82 },
          { topic: 'Digital Transformation', relevance: 0.76 }
        ],
        actionItems: [
          'Schedule follow-up meeting with stakeholders',
          'Prepare detailed technical specification',
          'Conduct ROI analysis validation',
          'Create implementation timeline'
        ],
        risks: [
          'Integration complexity with legacy systems',
          'Change management and user adoption',
          'Data migration challenges'
        ],
        opportunities: [
          'Expand automation to other departments',
          'Develop custom AI models for specific use cases',
          'Create competitive advantage through efficiency gains'
        ]
      },
      insights: [
        'Document shows strong business case for AI implementation',
        'Client appears ready for significant investment',
        'Technical requirements are well-defined',
        'Timeline is realistic and achievable'
      ],
      recommendations: [
        'Prepare detailed technical proposal',
        'Schedule demo of similar implementations',
        'Provide case studies from comparable clients',
        'Offer pilot project to reduce risk'
      ],
      confidence: 0.87,
      processingTime: 800,
      timestamp: new Date().toISOString(),
      metadata: {
        analysisType: analysisType || 'comprehensive',
        model: 'document-analysis-mock',
        version: '1.0'
      }
    }

    return NextResponse.json(mockResponse)

  } catch (error) {
    console.error('Mock document analysis API error:', error)
    return NextResponse.json(
      { error: 'Mock API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
