import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
  try {
    const { messages, includeAudio = false } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { reply: "I'm currently in demo mode. Please configure the Gemini API key to enable full functionality." },
        { status: 200 }
      );
    }

    // Use enhanced gemini proxy for full functionality
    try {
      const proxyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/gemini?action=conversationalFlow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: messages[messages.length - 1]?.parts?.[0]?.text || 'Hello',
          conversationHistory: messages,
          includeAudio: includeAudio,
          currentConversationState: {
            sessionId: `chat_${Date.now()}`,
            stage: 'conversation',
            messages: messages
          }
        })
      });

      if (proxyResponse.ok) {
        const proxyResult = await proxyResponse.json();
        if (proxyResult.success) {
          return NextResponse.json({
            reply: proxyResult.data.text,
            audioData: proxyResult.data.audioData,
            sources: proxyResult.data.sources
          });
        }
      }
    } catch (proxyError) {
      console.log('Proxy failed, falling back to direct API');
    }

    // Fallback to direct API
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.parts[0].text }]
    }));

    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
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
