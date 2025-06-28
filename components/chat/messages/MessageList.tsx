'use client';

import { Message } from '@/app/chat/types/chat';
import { MessageItem } from './MessageItem';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

interface MessageListProps {
  messages: Message[];
  className?: string;
  onMessageAction?: (messageId: string, action: string) => void;
}

export const MessageList = ({
  messages,
  className,
  onMessageAction,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto p-4 space-y-4',
        className
      )}
    >
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onAction={onMessageAction}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
