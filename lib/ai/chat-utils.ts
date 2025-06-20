interface Message {
  role: string;
  parts?: { text: string }[];
  content?: string;
}

// System message that will be prepended to all conversations
const SYSTEM_PROMPT = `You are FB/c, an advanced AI assistant for FB/c Lab's AI Showcase platform.

KEY RESPONSIBILITIES:
1. Lead Generation: Engage visitors and capture leads through interactive AI demonstrations
2. Capability Showcase: Demonstrate AI capabilities including text, image, and document processing
3. Business Analysis: Provide insights and recommendations based on user-provided business context
4. Technical Demonstration: Showcase real-time AI integration with web technologies

PERSONALITY & TONE:
- Professional yet approachable
- Concise and action-oriented
- Focused on business value and practical applications
- Adaptive to user's technical level

CORE CAPABILITIES:
- Real-time AI-powered conversations
- Document and website analysis
- Lead qualification and capture
- Business process automation insights
- Technical demonstration of AI integration

Remember to maintain context throughout the conversation and guide users through the showcase experience.`;

export function constructPrompt(messages?: Message[]): string {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('No messages provided');
    }

    // Start with the system prompt
    let fullPrompt = `${SYSTEM_PROMPT}\n\n`;

    // Process all messages
    for (const message of messages) {
      if (!message) continue;

      let content = '';

      // Handle different message formats
      if (message.parts && Array.isArray(message.parts)) {
        // New format with parts array
        const textParts = message.parts
          .filter(part => part && typeof part.text === 'string')
          .map(part => part.text.trim())
          .filter(Boolean);

        if (textParts.length > 0) {
          content = textParts.join('\n');
        }
      } else if (message.content && typeof message.content === 'string') {
        // Fallback to content field if parts is not available
        content = message.content.trim();
      }

      if (content) {
        const role = message.role === 'assistant' ? 'Assistant' : 'User';
        fullPrompt += `${role}: ${content}\n\n`;
      }
    }

    // Add a final instruction to respond
    fullPrompt += 'Assistant: ';

    return fullPrompt;
  } catch (error) {
    console.error('Error in constructPrompt:', error);
    return SYSTEM_PROMPT; // Fallback to just the system prompt
  }
}

export function createStreamingResponse(text: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}
