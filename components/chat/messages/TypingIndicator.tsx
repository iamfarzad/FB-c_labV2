'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  className?: string;
}

export const TypingIndicator = ({ users, className }: TypingIndicatorProps) => {
  if (!users.length) return null;

  // Get unique users by ID
  const uniqueUsers = Array.from(
    new Map(users.map(user => [user.id, user])).values()
  );

  const getDisplayText = () => {
    if (uniqueUsers.length === 1) {
      return `${uniqueUsers[0].name} is typing`;
    }
    if (uniqueUsers.length === 2) {
      return `${uniqueUsers[0].name} and ${uniqueUsers[1].name} are typing`;
    }
    if (uniqueUsers.length > 2) {
      return `${uniqueUsers[0].name} and ${uniqueUsers.length - 1} others are typing`;
    }
    return '';
  };

  return (
    <div className={cn('flex items-center gap-2 px-4 py-2', className)}>
      <div className="flex -space-x-2">
        {uniqueUsers.slice(0, 3).map((user, index) => (
          <Avatar key={`${user.id}-${index}`} className="h-6 w-6 border-2 border-background">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs">
              {user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="flex items-center">
        <div className="flex space-x-1 px-3 py-1.5 bg-muted rounded-full">
          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="ml-2 text-sm text-muted-foreground">
          {getDisplayText()}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;
