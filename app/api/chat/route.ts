import { NextRequest } from 'next/server';
import { POST as AiServicePost } from '../ai-service/route';

export async function POST(req: NextRequest) {
  const { messages, message, includeAudio, leadCaptureState } = await req.json();

  let prompt = message;
  if (!prompt && messages?.length > 0) {
    const lastMessage = messages[messages.length - 1];
    prompt = lastMessage?.content || lastMessage?.parts?.[0]?.text || 'Hello';
  }
  if (!prompt) prompt = 'Hello';

  // Construct a new request for the ai-service route
  const aiServiceRequest = new NextRequest(
    new URL('/api/ai-service?action=conversationalFlow', req.url).toString(),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        conversationState: leadCaptureState || { messages: messages || [] },
        messageCount: messages?.length || 0,
        includeAudio: includeAudio || false,
      }),
    }
  );

  // Call the ai-service POST handler
  return AiServicePost(aiServiceRequest);
}
