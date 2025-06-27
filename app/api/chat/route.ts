import { NextRequest, NextResponse } from 'next/server';
import { UnifiedAIService } from '@/lib/ai/unified-ai-service';

// Initialize UnifiedAIService
const aiService = new UnifiedAIService({
  geminiApiKey: process.env.GEMINI_API_KEY,
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});

export async function POST(req: NextRequest) {
  try {
    const { messages, message, includeAudio = false, leadCaptureState } = await req.json();

    // Get the prompt from either messages array or direct message
    let prompt = message;
    if (!prompt && messages?.length > 0) {
      const lastMessage = messages[messages.length - 1];
      prompt = lastMessage?.content || lastMessage?.parts?.[0]?.text || 'Hello';
    }
    if (!prompt) prompt = 'Hello';

    // Demo responses for fallback
    const demoResponses = [
      `Hello! I'm F.B/c AI Assistant. I can help you with AI consulting, business automation, and custom solutions. How can I assist you today?`,
      `That's a great question! As an AI consultant, I specialize in helping businesses implement AI solutions effectively. Would you like to know more about my services?`,
      `I understand you're interested in AI implementation. I offer comprehensive consulting on machine learning, automation, and custom AI development. What's your specific use case?`,
      `Excellent! I can help you transform your business with AI. My expertise covers data analysis, workflow automation, and intelligent system development. What challenges are you facing?`,
      `Perfect! I'd love to help you explore AI opportunities for your business. I work with companies to identify the best AI strategies and implement practical solutions. Tell me about your goals.`
    ];

    // Try UnifiedAIService first
    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await aiService.handleConversationalFlow(
          prompt,
          {
            sessionId: `chat_${Date.now()}`,
            stage: 'conversation',
            messages: messages || [],
            ...leadCaptureState
          },
          (messages?.length || 0),
          includeAudio
        );

        if (result.success && result.data?.text) {
          return NextResponse.json({
            reply: result.data.text,
            audioData: result.data.audioData,
            sources: result.data.sources
          });
        }
      } catch (error: any) {
        console.log('UnifiedAIService failed, using fallback:', error?.message || 'Unknown error');
      }
    }

    // Fallback to demo responses
    let response = demoResponses[0];
    
    if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
      response = demoResponses[0];
    } else if (prompt.toLowerCase().includes('help') || prompt.toLowerCase().includes('service')) {
      response = demoResponses[1];
    } else if (prompt.toLowerCase().includes('ai') || prompt.toLowerCase().includes('automation')) {
      response = demoResponses[2];
    } else if (prompt.toLowerCase().includes('business') || prompt.toLowerCase().includes('implement')) {
      response = demoResponses[3];
    } else {
      response = demoResponses[Math.floor(Math.random() * demoResponses.length)];
    }

    return NextResponse.json({ 
      reply: response,
      sources: ['Demo Mode - Enhanced responses available with full API setup']
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json({
      reply: "Hello! I'm F.B/c AI Assistant. I'm here to help with AI consulting and business automation. How can I assist you?",
      sources: ['Fallback Response']
    });
  }
}
