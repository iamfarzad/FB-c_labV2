import { NextRequest, NextResponse } from 'next/server';
import { UnifiedAIService } from '@/lib/ai/unified-ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = request.nextUrl.searchParams.get('action') || 'conversationalFlow';
    
    const aiService = new UnifiedAIService({
      geminiApiKey: process.env.GEMINI_API_KEY,
      elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
      elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    
    let result;
    
    switch (action) {
      case 'conversationalFlow':
        result = await aiService.handleConversationalFlow(
          body.message || '', 
          body.conversationState || {},
          body.messageCount || 0,
          body.includeAudio || false
        );
        break;
      case 'generateImage':
        result = await aiService.handleImageGeneration(body.prompt || '');
        break;
      case 'leadCapture':
        result = await aiService.handleLeadCapture(body.conversationState || {});
        break;
      default:
        result = await aiService.handleConversationalFlow(
          body.message || '', 
          body.conversationState || {},
          body.messageCount || 0,
          body.includeAudio || false
        );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in AI service route:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 