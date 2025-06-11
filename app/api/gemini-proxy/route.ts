import { NextRequest, NextResponse } from 'next/server';
import { 
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

export const dynamic = 'force-dynamic';

// Map model names to Gemini 2.0 Flash - a single model for all tasks
// https://ai.google.dev/gemini-api/docs/models#live-api
const MODEL_MAP = {
  // Single model for all tasks
  'gemini-pro': 'gemini-2.0-flash',
  'gemini-pro-vision': 'gemini-2.0-flash',
  'gemini-chat': 'gemini-2.0-flash',
  'gemini-image': 'gemini-2.0-flash',
} as const;

// Convert role to Gemini's expected role format
function toGeminiRole(role: string): 'user' | 'model' | 'function' | 'system' {
  switch (role) {
    case 'assistant':
      return 'model';
    case 'system':
    case 'function':
      return role;
    default:
      return 'user';
  }
}

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    switch (action) {
      case 'generateText': {
        const { prompt } = await req.json();
        if (!prompt) {
          return NextResponse.json(
            { error: 'Prompt is required' },
            { status: 400 }
          );
        }

        const model = genAI.getGenerativeModel({ 
          model: MODEL_MAP['gemini-pro'],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 2048,
          },
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return NextResponse.json({ text });
      }

      case 'generateImage': {
        const { prompt } = await req.json();
        if (!prompt) {
          return NextResponse.json(
            { error: 'Prompt is required for image generation' },
            { status: 400 }
          );
        }

        const model = genAI.getGenerativeModel({ 
          model: MODEL_MAP['gemini-pro-vision'],
          generationConfig: {
            temperature: 0.4,
            topP: 0.9,
            topK: 32,
            maxOutputTokens: 4096,
          },
        });

        try {
          // For Gemini 2.0 Flash, we use generateContentStream with a detailed, positive prompt
          const enhancedPrompt = `Create a detailed, professional illustration of a modern, ethical AI research laboratory. 
            Show a bright, clean space with:
            - Researchers collaborating at high-tech workstations
            - Holographic displays showing data visualizations
            - Advanced but approachable robotics
            - Natural light and green spaces
            - A focus on human-AI collaboration
            Style: Digital illustration, futuristic but realistic, vibrant colors, highly detailed
            Mood: Innovative, positive, and inspiring
            Context: ${prompt}`;

          const result = await model.generateContentStream([
            { text: enhancedPrompt },
          ]);

          // Collect the response chunks
          let response = '';
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            response += chunkText;
          }
          
          return NextResponse.json({ text: response });
        } catch (error: any) {
          console.error('Error generating image:', error);
          return NextResponse.json(
            { 
              error: 'Failed to generate image', 
              details: error.message,
              stack: error.stack 
            },
            { status: 500 }
          );
        }
      }

      case 'summarizeChat': {
        const { messages } = await req.json();
        if (!messages || !Array.isArray(messages)) {
          return NextResponse.json(
            { error: 'Messages array is required' },
            { status: 400 }
          );
        }

        const model = genAI.getGenerativeModel({ 
          model: MODEL_MAP['gemini-chat'],
          generationConfig: {
            temperature: 0.3,  // Lower temperature for more focused responses
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096,
          },
        });

        // Format messages for Gemini's chat
        const chatHistory = messages.map(msg => ({
          role: toGeminiRole(msg.role),
          parts: [{ text: msg.content || '' }],
        }));

        const chat = model.startChat({
          history: chatHistory,
        });

        const result = await chat.sendMessage(
          'Please provide a brief summary of this conversation.'
        );
        const response = await result.response;
        const text = response.text();
        
        return NextResponse.json({ summary: text });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Gemini Proxy Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
