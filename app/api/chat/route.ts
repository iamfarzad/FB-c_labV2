import { constructPrompt, createStreamingResponse } from "@/lib/chat-utils";
import { generateContentWithGemini } from "@/lib/gemini-api";

// AI Showcase handler
async function handleAIShowcase(message: string, context: any) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Create AI showcase specific prompt
    let prompt = `You are F.B/c's AI assistant showcasing advanced AI capabilities.

Current conversation context:
- Stage: ${context.stage}
- Name: ${context.name || 'Not provided'}
- Email: ${context.email || 'Not provided'}
- Message count: ${context.messageCount}

User message: "${message}"

Respond naturally while demonstrating AI capabilities. Include relevant capabilities you're showcasing in your response.

Guidelines:
- Be conversational and personable
- Use their name when available
- Ask for email after getting their name
- Show business insights and intelligence
- Keep responses concise but informative
- Guide toward consultation booking after email is collected`;

    // Generate response with specific prompts based on stage
    if (context.stage === 'name_collection' && context.name) {
      prompt += `\n\nThe user just provided their name (${context.name}). Welcome them personally and ask for their email to provide customized AI insights for their business.`;
    } else if (context.stage === 'email_collection' && context.email) {
      prompt += `\n\nThe user provided their email (${context.email}). Analyze the domain and provide relevant business insights. Show enthusiasm about helping their specific type of business.`;
    }

    const response = await generateContentWithGemini(apiKey, prompt);

    if (!response) {
      throw new Error('No response generated');
    }

    // Determine capabilities being demonstrated
    const capabilities = [];
    if (context.name) capabilities.push('Personalization');
    if (context.email) {
      capabilities.push('Domain Analysis', 'Business Intelligence');
    }
    capabilities.push('Natural Language Processing', 'Context Awareness');

    return new Response(
      JSON.stringify({
        success: true,
        message: response,
        capabilities: capabilities.slice(0, 3) // Limit to 3 for UI
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('AI Showcase error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate response'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const maxDuration = 30;

interface Message {
  role: string;
  parts?: { text: string }[];
  content?: string;
}

interface ChatRequest {
  messages?: Message[];
  imageData?: string;
  cameraFrame?: string;
  // AI Showcase specific fields
  message?: string;
  context?: {
    stage: string;
    name?: string;
    email?: string;
    messageCount: number;
  };
}

export async function POST(req: Request) {
  try {
    console.log('Chat API request received');

    // Parse and validate request body
    let requestBody: ChatRequest;
    try {
      requestBody = await req.json();
      console.log('Request body:', JSON.stringify({
        ...requestBody,
        imageData: requestBody.imageData ? '[image data present]' : null,
        cameraFrame: requestBody.cameraFrame ? '[camera frame present]' : null
      }));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, imageData, cameraFrame, message, context } = requestBody;

    // Handle AI Showcase requests
    if (message && context) {
      return handleAIShowcase(message, context);
    }

    // Validate required fields for regular chat
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No messages provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get API key with fallback
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Constructing prompt from messages...');
    const prompt = constructPrompt(messages);
    if (!prompt) {
      console.error('Failed to construct prompt from messages:', messages);
      return new Response(
        JSON.stringify({ error: 'Could not process the provided messages' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing image data if present...');
    // Clean image data if necessary
    const cleanedImageData = imageData?.startsWith("data:") ? imageData.split(",")[1] : imageData;
    const cleanedCameraFrame = cameraFrame?.startsWith("data:") ? cameraFrame.split(",")[1] : cameraFrame;

    console.log('Generating content with Gemini API...');
    const text = await generateContentWithGemini(apiKey, prompt, cleanedImageData, cleanedCameraFrame);

    if (!text) {
      console.error('No content generated from Gemini API');
      return new Response(
        JSON.stringify({ error: 'No response generated' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Content generated successfully');

    // Create a simple streaming response that sends the full text in one chunk
    const stream = new ReadableStream({
      start(controller) {
        // Send the text as a single chunk
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: text })}\n\n`));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    const errorMessage = process.env.NODE_ENV === 'development'
      ? error.message || 'An unknown error occurred'
      : 'An error occurred while processing your request';

    return new Response(
      JSON.stringify({
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
