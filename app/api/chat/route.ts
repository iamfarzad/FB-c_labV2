import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
  try {
    const { messages, includeAudio = false, leadCaptureState } = await req.json();

    // Get the last message
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage?.content || lastMessage?.parts?.[0]?.text || 'Hello';

    // Call your advanced AI showcase API directly
    try {
      const response = await fetch(`${req.nextUrl.origin}/api/gemini?action=conversationalFlow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          currentConversationState: {
            sessionId: `chat_${Date.now()}`,
            stage: 'conversation',
            messages: messages,
            ...leadCaptureState
          },
          includeAudio: includeAudio
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return NextResponse.json({
            reply: result.data.text,
            audioData: result.data.audioData,
            sources: result.data.sources
          });
        }
      }
    } catch (error) {
      console.log('Advanced API failed:', error);
    }

    // Fallback only if no API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: "I'm currently in demo mode. Please configure the Gemini API key to enable full functionality."
      });
    }

    // Basic fallback
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content || msg.parts?.[0]?.text || '' }]
    }));

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    const text = result.text;
    
    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { reply: "Sorry, I encountered an error. Please try again." },
      { status: 500 }
    );
  }
}
