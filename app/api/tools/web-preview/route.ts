import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Mock web preview data (in a real implementation, you'd fetch the actual page)
    const previewData = {
      url: parsedUrl.toString(),
      title: `Preview of ${parsedUrl.hostname}`,
      logs: [
        {
          level: 'log',
          message: `Loading ${parsedUrl.toString()}`,
          timestamp: new Date()
        },
        {
          level: 'log',
          message: 'Page loaded successfully',
          timestamp: new Date()
        }
      ],
      screenshot: null, // In real implementation, you'd capture a screenshot
      metadata: {
        title: `Page from ${parsedUrl.hostname}`,
        description: `Web preview of ${parsedUrl.toString()}`,
        favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`
      }
    }

    return NextResponse.json({
      success: true,
      output: previewData,
      calculatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Web preview error:', error)
    return NextResponse.json(
      { error: 'Failed to generate web preview' },
      { status: 500 }
    )
  }
}
