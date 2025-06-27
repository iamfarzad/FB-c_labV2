'use client';

import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface MessageStatusProps {
  status: MessageStatus;
  timestamp: Date | string | number;
  className?: string;
  showTime?: boolean;
}

export const MessageStatus = ({
  status,
  timestamp,
  className,
  showTime = true,
}: MessageStatusProps) => {
  const formatTime = (date: Date | string | number) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <Clock
            className="h-3 w-3 text-muted-foreground"
            aria-label="Sending"
          />
        );
      case 'sent':
        return (
          <Check
            className="h-3 w-3 text-muted-foreground"
            aria-label="Sent"
          />
        );
      case 'delivered':
        return (
          <div className="relative">
            <Check className="h-3 w-3 text-muted-foreground" />
            <Check className="absolute -left-1.5 h-3 w-3 text-muted-foreground" />
          </div>
        );
      case 'read':
        return (
          <div className="relative">
            <CheckCheck
              className="h-3 w-3 text-primary"
              aria-label="Read"
            />
            <CheckCheck
              className="absolute -left-1.5 h-3 w-3 text-primary"
            />
          </div>
        );
      case 'failed':
        return (
          <AlertCircle
            className="h-3 w-3 text-destructive"
            aria-label="Failed to send"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs text-muted-foreground',
        className
      )}
    >
      {showTime && (
        <time dateTime={new Date(timestamp).toISOString()} className="text-[10px]">
          {formatTime(timestamp)}
        </time>
      )}
      <div className="flex items-center">
        {getStatusIcon()}
      </div>
    </div>
  );
};

export default MessageStatus;
