'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Message } from '@/app/chat/types/chat';
import { Copy, User, Bot } from 'lucide-react';
import { formatTimestamp } from '@/app/chat/utils/chat-utils';

interface ChatMessageProps {
  message: Message;
  onCopy?: (content: string) => void;
}

export const ChatMessage = ({ message, onCopy }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const avatarFallback = isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />;

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      {!isUser && (
        <div className="relative h-8 w-8">
          <Avatar className="h-full w-full">
            <AvatarImage 
              src="/placeholder-user.jpg" 
              alt="AI Assistant" 
              onError={(e) => {
                // If image fails to load, show fallback
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <AvatarFallback className="bg-orange-500 text-white flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      <div className={cn(
        'flex flex-col max-w-[80%]',
        isUser ? 'items-end' : 'items-start',
      )}>
        <div
          className={cn(
            'rounded-lg px-4 py-2',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-muted rounded-tl-none',
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {message.imageUrl && (
            <div className="mt-2">
              <img
                src={message.imageUrl}
                alt="Message content"
                className="max-w-full h-auto rounded-md border"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{formatTimestamp(message.timestamp)}</span>
          {onCopy && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onCopy(message.content)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/user-avatar.png" alt="You" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
