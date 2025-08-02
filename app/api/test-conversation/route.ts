import { NextRequest, NextResponse } from 'next/server'
import { ConversationStateManager } from '@/lib/conversation-state-manager'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()
    
    console.log('Test conversation endpoint called:', { message, sessionId })
    
    const manager = ConversationStateManager.getInstance()
    
    // Initialize if needed
    let state = manager.getConversationState(sessionId)
    if (!state) {
      state = await manager.initializeConversation(sessionId)
      console.log('Initialized new conversation:', state)
    }
    
    // Process message
    const result = await manager.processMessage(sessionId, message)
    
    console.log('Conversation result:', {
      newStage: result.newStage,
      leadData: result.updatedState.context.leadData,
      response: result.response.substring(0, 100) + '...'
    })
    
    return NextResponse.json({
      success: true,
      result: {
        response: result.response,
        newStage: result.newStage,
        leadData: result.updatedState.context.leadData,
        shouldTriggerResearch: result.shouldTriggerResearch
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