'use client';

import { Message } from '@/app/chat/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  onAction?: (messageId: string, action: string) => void;
  className?: string;
}

export const MessageItem = ({
  message,
  onAction,
  className,
}: MessageItemProps) => {
  const isUser = message.role === 'user';
  const avatarFallback = isUser ? 'U' : 'AI';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onAction?.(message.id, 'copied');
  };

  return (
    <div
      className={cn(
        'group flex gap-3 p-4',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/bot-avatar.png" alt="AI Assistant" />
          <AvatarFallback className="bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted',
          'relative'
        )}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        
        <div className="mt-1 flex items-center justify-end gap-1 text-xs opacity-0 group-hover:opacity-100">
          <span className="text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:bg-transparent"
            onClick={handleCopy}
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="sr-only">Copy message</span>
          </Button>
          {!isUser && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:bg-transparent"
                onClick={() => onAction?.(message.id, 'thumbs_up')}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span className="sr-only">Like</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:bg-transparent"
                onClick={() => onAction?.(message.id, 'thumbs_down')}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                <span className="sr-only">Dislike</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/user-avatar.png" alt="You" />
          <AvatarFallback className="bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageItem;
