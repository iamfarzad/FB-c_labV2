import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '@/hooks/chat/useChat';

// Mock the API calls
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));

// Mock the AI API
jest.mock('@/lib/ai', () => ({
  generateResponse: jest.fn(() => Promise.resolve('AI response')),
}));

describe('useChat Hook', () => {
  const mockData = {
    leadContext: { engagementType: 'chat' },
    sessionId: 'test-session',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with default state', () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    expect(result.current.messages).toEqual([]);
    expect(result.current.input).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('handles input changes', () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    act(() => {
      result.current.handleInputChange({
        target: { value: 'Hello world' },
      } as React.ChangeEvent<HTMLTextAreaElement>);
    });

    expect(result.current.input).toBe('Hello world');
  });

  test('handles form submission', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    // Set input value
    act(() => {
      result.current.setInput('Test message');
    });

    // Submit form
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as React.FormEvent<HTMLFormElement>);
    });

    // Check that message was added
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Test message');
    expect(result.current.messages[0].role).toBe('user');
  });

  test('handles message sending via sendMessage', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    await act(async () => {
      await result.current.sendMessage('Hello from sendMessage');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Hello from sendMessage');
  });

  test('handles append message', () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    act(() => {
      result.current.append({
        role: 'user',
        content: 'Appended message',
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Appended message');
  });

  test('clears messages', () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    // Add a message first
    act(() => {
      result.current.append({
        role: 'user',
        content: 'Test message',
      });
    });

    expect(result.current.messages).toHaveLength(1);

    // Clear messages
    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toHaveLength(0);
  });

  test('handles loading state during message sending', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    // Mock a slow API response
    const { generateResponse } = require('@/lib/ai');
    generateResponse.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('Response'), 100)));

    // Start sending message
    const sendPromise = act(async () => {
      await result.current.sendMessage('Test message');
    });

    // Check loading state
    expect(result.current.isLoading).toBe(true);

    // Wait for completion
    await sendPromise;

    // Check loading state is false
    expect(result.current.isLoading).toBe(false);
  });

  test('handles errors during message sending', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    // Mock API error
    const { generateResponse } = require('@/lib/ai');
    generateResponse.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(result.current.error).toBe('API Error');
  });

  test('handles empty message submission', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as React.FormEvent<HTMLFormElement>);
    });

    // Should not add empty message
    expect(result.current.messages).toHaveLength(0);
  });

  test('handles whitespace-only message submission', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    act(() => {
      result.current.setInput('   ');
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as React.FormEvent<HTMLFormElement>);
    });

    // Should not add whitespace-only message
    expect(result.current.messages).toHaveLength(0);
  });

  test('generates AI response after user message', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    const { generateResponse } = require('@/lib/ai');
    generateResponse.mockResolvedValue('AI response message');

    await act(async () => {
      await result.current.sendMessage('Hello AI');
    });

    // Should have user message and AI response
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('Hello AI');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('AI response message');
  });

  test('handles message with attachments', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    const messageWithAttachment = {
      role: 'user' as const,
      content: 'Message with file',
      attachments: [{ name: 'test.pdf', url: '/files/test.pdf' }],
    };

    await act(async () => {
      await result.current.append(messageWithAttachment);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].attachments).toEqual([
      { name: 'test.pdf', url: '/files/test.pdf' },
    ]);
  });

  test('handles message with metadata', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    const messageWithMetadata = {
      role: 'user' as const,
      content: 'Message with metadata',
      metadata: { source: 'web', timestamp: new Date().toISOString() },
    };

    await act(async () => {
      await result.current.append(messageWithMetadata);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].metadata).toEqual({
      source: 'web',
      timestamp: expect.any(String),
    });
  });

  test('handles concurrent message sending', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    // Mock slow API response
    const { generateResponse } = require('@/lib/ai');
    generateResponse.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('Response'), 200)));

    // Send multiple messages concurrently
    const promises = [
      result.current.sendMessage('Message 1'),
      result.current.sendMessage('Message 2'),
      result.current.sendMessage('Message 3'),
    ];

    await act(async () => {
      await Promise.all(promises);
    });

    // Should have all messages
    expect(result.current.messages).toHaveLength(6); // 3 user + 3 AI responses
  });

  test('handles message retry', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    // Mock API to fail first, then succeed
    const { generateResponse } = require('@/lib/ai');
    generateResponse
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce('Retry successful');

    // First attempt fails
    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(result.current.error).toBe('First attempt failed');

    // Retry
    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.messages).toHaveLength(2); // User message + AI response
  });

  test('handles session persistence', () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    // Add some messages
    act(() => {
      result.current.append({ role: 'user', content: 'Message 1' });
      result.current.append({ role: 'assistant', content: 'Response 1' });
    });

    // Check that messages are associated with session
    expect(result.current.messages[0].sessionId).toBe('test-session');
    expect(result.current.messages[1].sessionId).toBe('test-session');
  });

  test('handles lead context in messages', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    // Check that lead context is included in the message
    expect(result.current.messages[0].leadContext).toEqual({
      engagementType: 'chat',
    });
  });

  test('handles message timestamps', async () => {
    const { result } = renderHook(() => useChat({ data: mockData }));

    const beforeSend = new Date();

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    const afterSend = new Date();

    expect(result.current.messages[0].timestamp).toBeInstanceOf(Date);
    expect(result.current.messages[0].timestamp.getTime()).toBeGreaterThanOrEqual(beforeSend.getTime());
    expect(result.current.messages[0].timestamp.getTime()).toBeLessThanOrEqual(afterSend.getTime());
  });
});