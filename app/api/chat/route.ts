import { constructPrompt, createStreamingResponse } from "@/lib/chat-utils";
import { generateContentWithGemini } from "@/lib/gemini-api";

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

    const { messages, imageData, cameraFrame } = requestBody;

    // Validate required fields
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
    const stream = createStreamingResponse(text);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
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
