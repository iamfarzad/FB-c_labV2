import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()
    
    console.info('Test conversation endpoint called:', { message, sessionId })
    
    // Simple test response - legacy conversation state manager removed
    const testResponse = `Test response for: "${message}" (Session: ${sessionId})`
    
    console.info('Test conversation response:', testResponse)
    
    return NextResponse.json({
      success: true,
      result: {
        response: testResponse,
        newStage: 'TEST',
        leadData: null,
        shouldTriggerResearch: false
      }
    })
  } catch (error) {
    console.error('Test conversation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}