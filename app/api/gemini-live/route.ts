import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_MODELS = [
  'gemini-live-2.5-flash-preview',
  'gemini-2.0-flash-live-001',
  'gemini-2.5-flash-preview-native-audio-dialog',
  'gemini-2.5-flash-exp-native-audio-thinking-dialog'
];

export async function GET(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // In production, you might want to use ephemeral tokens instead of exposing API key
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key not configured',
          mockMode: true,
          wsUrl: 'wss://mock.generativelanguage.googleapis.com/v1beta/models',
          models: ALLOWED_MODELS
        },
        { status: 200, headers }
      );
    }

    // Return WebSocket connection info
    return NextResponse.json({
      success: true,
      wsUrl: 'wss://generativelanguage.googleapis.com/v1beta/models',
      apiKey: apiKey, // In production, use ephemeral tokens
      models: ALLOWED_MODELS,
      defaultModel: 'gemini-live-2.5-flash-preview',
      features: {
        voiceActivityDetection: true,
        sessionResumption: true,
        interruptions: true,
        nativeAudio: true,
        multimodal: true
      }
    }, { headers });
  } catch (error: any) {
    console.error('Gemini Live API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get connection info' },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
