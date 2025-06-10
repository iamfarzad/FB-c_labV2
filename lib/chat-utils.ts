interface Message {
  role: string;
  parts: { text: string }[];
}

export function constructPrompt(messages: Message[]): string {
  // Assuming the last message is the user's prompt
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.role === 'user') {
    return lastMessage.parts.map(part => part.text).join('\n');
  }
  return '';
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
