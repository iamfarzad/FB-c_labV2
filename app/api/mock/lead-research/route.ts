import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, company } = body

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create mock lead research response
    const mockResponse = {
      id: `lead-${Date.now()}`,
      email: email || 'demo@example.com',
      company: company || 'Demo Company Inc.',
      research: {
        companyInfo: {
          name: company || 'Demo Company Inc.',
          industry: 'Technology',
          size: '50-200 employees',
          founded: '2015',
          location: 'San Francisco, CA',
          website: 'https://democompany.com',
          description: 'A leading technology company specializing in innovative solutions for modern businesses.'
        },
        keyPeople: [
          {
            name: 'John Demo',
            role: 'CEO',
            linkedin: 'https://linkedin.com/in/johndemo',
            background: 'Former VP at TechCorp, 15+ years in technology leadership'
          },
          {
            name: 'Jane Smith',
            role: 'CTO',
            linkedin: 'https://linkedin.com/in/janesmith',
            background: 'Ex-Google engineer, expert in AI and machine learning'
          }
        ],
        recentNews: [
          {
            title: 'Demo Company Raises $10M Series A',
            date: '2024-01-15',
            source: 'TechCrunch',
            summary: 'Company announces major funding round to expand AI capabilities'
          },
          {
            title: 'New Partnership with Enterprise Client',
            date: '2024-02-01',
            source: 'Business Wire',
            summary: 'Strategic partnership to deliver innovative solutions'
          }
        ],
        socialMedia: {
          linkedin: 'https://linkedin.com/company/democompany',
          twitter: 'https://twitter.com/democompany',
          followers: {
            linkedin: 5420,
            twitter: 2100
          }
        },
        financials: {
          revenue: '$5-10M',
          funding: '$15M total',
          lastRound: 'Series A - $10M (2024)'
        }
      },
      insights: [
        'Company is in growth phase with recent funding',
        'Strong technical leadership team',
        'Focus on AI and automation aligns with our services',
        'Good timing for partnership discussions'
      ],
      recommendations: [
        'Highlight AI automation ROI in initial outreach',
        'Reference recent funding and growth trajectory',
        'Connect with CTO Jane Smith for technical discussions',
        'Propose pilot project to demonstrate value'
      ],
      confidence: 0.85,
      timestamp: new Date().toISOString(),
      metadata: {
        sources: 5,
        processingTime: 1000,
        model: 'lead-research-mock'
      }
    }

    return NextResponse.json(mockResponse)

  } catch (error) {
    console.error('Mock lead research API error:', error)
    return NextResponse.json(
      { error: 'Mock API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
