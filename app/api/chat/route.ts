import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSupabase } from '@/lib/supabase/server';
import { TokenCostCalculator } from '@/lib/token-cost-calculator';
import type { NextRequest } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

export const dynamic = 'force-dynamic';

const buildSystemPrompt = (leadContext: any): string => {
  let systemPrompt = `You are F.B/c AI Assistant, an expert in AI automation and business consulting.`;
  if (leadContext?.name) systemPrompt += ` The user's name is ${leadContext.name}.`;
  if (leadContext?.company) systemPrompt += ` They work at ${leadContext.company}.`;
  if (leadContext?.role) systemPrompt += ` Their role is ${leadContext.role}.`;
  if (leadContext?.interests) systemPrompt += ` They're interested in: ${leadContext.interests}.`;
  systemPrompt += `\n\nProvide helpful, personalized responses about AI automation, business processes, and technology solutions. Be conversational, professional, and focus on practical business value.`;
  return systemPrompt;
};

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is missing on the server!' }), { status: 500 });
  }

  try {
    const { messages, data = {} } = await req.json();
    const { leadContext = {}, sessionId = null, userId = null } = data;
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = 'gemini-1.5-flash';
    const systemPrompt = buildSystemPrompt(leadContext);

    const contents = messages.map((message: Message) => {
      const parts: any[] = [{ text: message.content }];
      if (message.imageUrl) {
        const base64Match = message.imageUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (base64Match) {
          parts.push({
            inlineData: {
              mimeType: `image/${base64Match[1]}`,
              data: base64Match[2],
            },
          });
        }
      }
      return {
        role: message.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    const geminiPrompt = {
      system_instruction: {
        role: 'system',
        parts: [{ text: systemPrompt }],
      },
      contents: contents,
    };

    const geminiResponse = await genAI.getGenerativeModel({ model }).generateContentStream(geminiPrompt);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of geminiResponse.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunkText })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('[Chat API Error]', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}
