'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Message, ActivityItem } from '../types/chat';
import { DEFAULT_MESSAGES, INITIAL_ACTIVITIES } from '../constants/chat';

interface ChatContextType {
  messages: Message[];
  activities: ActivityItem[];
  isSidebarOpen: boolean;
  isLoading: boolean;
  input: string;
  setInput: (input: string) => void;
  sendMessage: (content: string) => void;
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  toggleSidebar: () => void;
  startNewChat: () => void;
  handleActivityClick: (activity: ActivityItem) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addActivity = useCallback((activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...activity,
    };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const startNewChat = useCallback(() => {
    setMessages(DEFAULT_MESSAGES);
    addActivity({
      type: 'system_message',
      title: 'New chat started',
      description: 'A new conversation has begun',
    });
  }, [addActivity]);

  const handleActivityClick = useCallback((activity: ActivityItem) => {
    // Handle activity click (e.g., load previous chat)
    console.log('Activity clicked:', activity);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        activities,
        isSidebarOpen,
        isLoading,
        input,
        setInput,
        sendMessage,
        addActivity,
        toggleSidebar,
        startNewChat,
        handleActivityClick,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
