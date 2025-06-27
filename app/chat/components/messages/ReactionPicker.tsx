'use client';

import { useState, useRef, useEffect } from 'react';
import { SmilePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Common emoji reactions
const DEFAULT_REACTIONS = [
  '👍', '❤️', '😂', '😮', '😢', '🙏', '👎', '🎉', '🤔', '👏', '🔥', '🍻'
];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  alignOffset?: number;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  messageId: string;
  currentReactions?: { [emoji: string]: string[] }; // { '👍': ['user1', 'user2'] }
  currentUserId?: string;
}

export const ReactionPicker = ({
  onSelect,
  className,
  align = 'end',
  side = 'top',
  sideOffset = 8,
  alignOffset = 0,
  children,
  defaultOpen = false,
  onOpenChange,
  messageId,
  currentReactions = {},
  currentUserId,
}: ReactionPickerProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [customEmoji, setCustomEmoji] = useState('');
  const customEmojiInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
    if (!open) {
      setCustomEmoji('');
    }
  };

  const handleReactionSelect = (emoji: string) => {
    onSelect(emoji);
    handleOpenChange(false);
  };

  const handleCustomEmojiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEmoji.trim()) {
      handleReactionSelect(customEmoji.trim());
    }
  };

  const hasReacted = (emoji: string) => {
    return currentUserId ? currentReactions[emoji]?.includes(currentUserId) : false;
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus custom emoji input when custom emoji tab is active
  useEffect(() => {
    if (isOpen && customEmoji !== null) {
      setTimeout(() => customEmojiInputRef.current?.focus(), 0);
    }
  }, [isOpen, customEmoji]);

  return (
    <div className="inline-flex" ref={containerRef}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {children || (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity',
                'text-muted-foreground hover:text-foreground',
                className
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenChange(!isOpen);
              }}
            >
              <SmilePlus className="h-4 w-4" />
              <span className="sr-only">Add reaction</span>
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-1.5"
          align={align}
          side={side}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-1.5">
            {/* Quick reactions */}
            <div className="grid grid-cols-6 gap-1">
              {DEFAULT_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className={cn(
                    'text-xl p-1.5 rounded-md hover:bg-muted transition-colors',
                    'flex items-center justify-center',
                    hasReacted(emoji) && 'bg-muted'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReactionSelect(emoji);
                  }}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Custom emoji input */}
            <div className="pt-1.5 border-t">
              <form onSubmit={handleCustomEmojiSubmit} className="flex gap-1.5">
                <input
                  ref={customEmojiInputRef}
                  type="text"
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  placeholder="Type an emoji..."
                  className="flex-1 min-w-0 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  onClick={(e) => e.stopPropagation()}
                  maxLength={2} // Limit to 1-2 characters for emoji
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  disabled={!customEmoji.trim()}
                  onClick={(e) => e.stopPropagation()}
                >
                  Add
                </Button>
              </form>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface ReactionListProps {
  reactions: { [emoji: string]: string[] };
  currentUserId?: string;
  onReactionClick?: (emoji: string) => void;
  className?: string;
}

export const ReactionList = ({
  reactions,
  currentUserId,
  onReactionClick,
  className,
}: ReactionListProps) => {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5 mt-1.5', className)}>
      {Object.entries(reactions).map(([emoji, userIds]) => (
        <button
          key={emoji}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border',
            'bg-muted/50 hover:bg-muted transition-colors',
            userIds.includes(currentUserId || '') && 'bg-primary/10 border-primary/20'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onReactionClick?.(emoji);
          }}
          title={userIds.join(', ')}
        >
          <span>{emoji}</span>
          <span className="text-muted-foreground">{userIds.length}</span>
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;
