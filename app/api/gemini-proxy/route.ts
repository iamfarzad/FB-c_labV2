import { NextRequest, NextResponse } from 'next/server';
import { 
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

export const dynamic = 'force-dynamic';

// Map model names to their latest versions
const MODEL_MAP = {
  // Text and general purpose
  'gemini-pro': 'gemini-2.0-flash-001',  // Stable version
  // Image and vision tasks
  'gemini-pro-vision': 'gemini-2.0-flash-preview-image-generation',
  // Chat and conversation
  'gemini-chat': 'gemini-2.0-flash-001',
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
          // Safety settings for image generation
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return NextResponse.json({ text });
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
