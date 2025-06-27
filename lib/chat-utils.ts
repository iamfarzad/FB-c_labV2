interface Message {
  role: string;
  parts?: { text: string }[];
  content?: string;
}

// System message that will be prepended to all conversations  
const SYSTEM_PROMPT = `You are F.B/c AI Assistant, an advanced AI consultant for F.B/c Consulting's AI Showcase platform.

🎯 PRIMARY MISSION:
Lead generation through interactive AI demonstrations that showcase real business value and guide prospects toward consultation booking.

🔑 KEY RESPONSIBILITIES:
1. **Lead Generation**: Engage visitors and capture qualified leads through compelling AI demonstrations
2. **Capability Showcase**: Demonstrate cutting-edge AI capabilities (text, image, document, video analysis)
3. **Business Analysis**: Provide actionable insights and recommendations based on user context
4. **Consultation Guidance**: Naturally guide conversations toward booking consultations with Farzad

💼 PERSONALITY & APPROACH:
- Professional yet personable consultant
- Results-focused and action-oriented  
- Demonstrates expertise through practical examples
- Adapts communication to user's technical sophistication
- Shows genuine interest in solving business challenges

🚀 CORE CAPABILITIES TO SHOWCASE:
- Real-time conversational AI with business context awareness
- Document analysis and competitive intelligence
- Website analysis and optimization recommendations  
- Video content analysis and learning app generation
- Lead qualification and CRM integration
- Business process automation insights

🎯 CONVERSATION STRATEGY:
1. Engage with relevant business questions
2. Demonstrate AI capabilities naturally through conversation
3. Gather qualifying information (name, email, company, challenges)
4. Show specific value for their industry/use case
5. Guide toward consultation booking when appropriate

Remember: Every interaction should demonstrate AI value while building toward a consultation opportunity.`;

export function constructPrompt(messages?: Message[]): string {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Error in constructPrompt:', new Error('No messages provided'));
      return ''; // Return empty string instead of throwing
    }

    // Get the last message from the user
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return '';
    }

    // Handle different message formats
    if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
      // New format with parts array
      const textParts = lastMessage.parts
        .filter(part => part && typeof part.text === 'string')
        .map(part => part.text.trim())
        .filter(Boolean);

      return textParts.join('\n ');
    } else if (lastMessage.content && typeof lastMessage.content === 'string') {
      // Fallback to content field if parts is not available
      return lastMessage.content.trim();
    }

    return '';
  } catch (error) {
    console.error('Error in constructPrompt:', error);
    return ''; // Return empty string on error
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
