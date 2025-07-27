import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company } = body

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create a mock lead research response
    const mockResponse = {
      id: `mock-research-${Date.now()}`,
      name: name || 'Unknown',
      email: email || 'unknown@example.com',
      company: company || 'Unknown Company',
      researchResults: [
        {
          source: 'LinkedIn',
          title: `${name || 'User'} - Professional Profile`,
          url: 'https://linkedin.com/in/mock-profile',
          summary: 'Professional with experience in technology and business development.'
        },
        {
          source: 'Company Website',
          title: `${company || 'Company'} - About Us`,
          url: 'https://example-company.com/about',
          summary: 'Innovative company focused on AI and automation solutions.'
        }
      ],
      recommendations: [
        'Schedule a discovery call to understand their specific needs',
        'Prepare a customized demo based on their industry',
        'Follow up with relevant case studies and ROI examples'
      ],
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(mockResponse, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Mock lead research API error:', error)
    return NextResponse.json(
      { error: 'Mock lead research API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 