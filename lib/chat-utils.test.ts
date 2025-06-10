import { describe, it, expect } from 'vitest';
import { constructPrompt } from './chat-utils';

// Define the Message interface, mirroring the one in chat-utils.ts
interface Message {
  role: string;
  parts: { text: string }[];
}

describe('constructPrompt', () => {
  it('should return the text of the last message if it is from the user', () => {
    const messages: Message[] = [
      { role: 'model', parts: [{ text: 'Hello there!' }] },
      { role: 'user', parts: [{ text: 'How are you?' }] },
    ];
    expect(constructPrompt(messages)).toBe('How are you?');
  });

  it('should concatenate parts of the last user message', () => {
    const messages: Message[] = [
      { role: 'model', parts: [{ text: 'Previous model response.' }] },
      { role: 'user', parts: [{ text: 'First part.' }, { text: ' Second part.' }] },
    ];
    expect(constructPrompt(messages)).toBe('First part.\n Second part.');
  });

  it('should return an empty string if the last message is not from the user', () => {
    const messages: Message[] = [
      { role: 'user', parts: [{ text: 'User prompt' }] },
      { role: 'model', parts: [{ text: 'Model response' }] },
    ];
    expect(constructPrompt(messages)).toBe('');
  });

  it('should return an empty string if the messages array is empty', () => {
    const messages: Message[] = [];
    expect(constructPrompt(messages)).toBe('');
  });

  it('should return an empty string if the last message is from user but has no parts', () => {
    const messages: Message[] = [
        { role: 'model', parts: [{ text: 'Hello!'}]},
        { role: 'user', parts: [] },
    ];
    expect(constructPrompt(messages)).toBe('');
  });

  it('should handle a single user message correctly', () => {
    const messages: Message[] = [
      { role: 'user', parts: [{ text: 'This is the only message.' }] },
    ];
    expect(constructPrompt(messages)).toBe('This is the only message.');
  });

  it('should handle a single model message by returning empty string', () => {
    const messages: Message[] = [
      { role: 'model', parts: [{ text: 'This is a single model message.' }] },
    ];
    expect(constructPrompt(messages)).toBe('');
  });
});
