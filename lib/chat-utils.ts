interface Message {
  role: string;
  parts?: { text: string }[];
  content?: string;
}

export function constructPrompt(messages?: Message[]): string {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('No messages provided');
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      throw new Error('Invalid message format');
    }

    // Handle both old and new message formats
    if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
      // New format with parts array
      const textParts = lastMessage.parts
        .filter(part => part && typeof part.text === 'string')
        .map(part => part.text.trim())
        .filter(Boolean);
      
      if (textParts.length > 0) {
        return textParts.join('\n');
      }
    } else if (lastMessage.content && typeof lastMessage.content === 'string') {
      // Fallback to content field if parts is not available
      return lastMessage.content.trim();
    }

    throw new Error('No valid message content found');
  } catch (error) {
    console.error('Error in constructPrompt:', error);
    return ''; // Return empty string as fallback
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
