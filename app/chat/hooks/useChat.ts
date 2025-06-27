import { useState, useCallback } from 'react';
import { Message } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

interface UseChatProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => Promise<void> | void;
}

export const useChat = ({ 
  initialMessages = [],
  onSendMessage 
}: UseChatProps = {}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    const userMessage = addMessage({
      role: 'user',
      content: content.trim(),
    });

    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      if (onSendMessage) {
        await onSendMessage(content.trim());
      } else {
        // Default behavior if no onSendMessage provided
        await new Promise(resolve => setTimeout(resolve, 500));
        addMessage({
          role: 'assistant',
          content: `Echo: ${content}`,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, onSendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  return {
    // State
    messages,
    input,
    setInput,
    isLoading,
    error,
    
    // Actions
    sendMessage,
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
  };
};

export default useChat;
