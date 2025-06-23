'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Message } from '@/app/chat/types/chat';
import { ChatMessage } from './ChatMessage';
import { scrollToBottom } from '@/app/chat/utils/chat-utils';

interface ChatMessagesProps {
  messages: Message[];
  onCopy?: (content: string) => void;
  className?: string;
}

export const ChatMessages = ({
  messages,
  onCopy,
  className,
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom(messagesEndRef.current);
  }, [messages]);

  const handleCopy = (content: string) => {
    if (onCopy) {
      onCopy(content);
    } else {
      navigator.clipboard.writeText(content);
    }
  };

  return (
    <div className={cn('flex-1 overflow-y-auto', className)}>
      <div className="flex flex-col gap-2 p-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onCopy={handleCopy}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
