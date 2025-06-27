'use client';

import { useState, useRef, useEffect } from 'react';
import { SmilePlus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Emoji data - in a real app, you might want to use a library like `emoji-picker-react`
const EMOJI_CATEGORIES = [
  {
    name: 'Frequently Used',
    emojis: ['😊', '😂', '❤️', '👍', '🙏', '🎉', '😍', '🤔', '👏', '🔥']
  },
  {
    name: 'Smileys & Emotion',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊']
  },
  {
    name: 'People & Body',
    emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘']
  },
  {
    name: 'Animals & Nature',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮']
  },
  {
    name: 'Food & Drink',
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍']
  },
  {
    name: 'Travel & Places',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛵', '🚲']
  },
  {
    name: 'Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓']
  },
  {
    name: 'Objects',
    emojis: ['⌚', '📱', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '💽', '💾', '💿', '📀']
  },
  {
    name: 'Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕']
  },
  {
    name: 'Flags',
    emojis: ['🏳️', '🏴', '🏴‍☠️', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇺🇳', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿']
  }
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  alignOffset?: number;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const EmojiPicker = ({
  onSelect,
  className,
  align = 'start',
  side = 'top',
  sideOffset = 8,
  alignOffset = 0,
  children,
  defaultOpen = false,
  onOpenChange,
}: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [frequentlyUsed, setFrequentlyUsed] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load frequently used emojis from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('frequentlyUsedEmojis');
      if (saved) {
        setFrequentlyUsed(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load frequently used emojis', error);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
    if (open) {
      // Focus search input when popover opens
      setTimeout(() => searchInputRef.current?.focus(), 0);
    } else {
      setSearchQuery('');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    
    // Update frequently used emojis
    const newFrequentlyUsed = [
      emoji,
      ...frequentlyUsed.filter(e => e !== emoji)
    ].slice(0, 12); // Keep only the 12 most recent
    
    setFrequentlyUsed(newFrequentlyUsed);
    
    // Save to localStorage
    try {
      localStorage.setItem('frequentlyUsedEmojis', JSON.stringify(newFrequentlyUsed));
    } catch (error) {
      console.error('Failed to save frequently used emojis', error);
    }
    
    handleOpenChange(false);
  };

  // Filter emojis based on search query
  const filteredEmojis = searchQuery
    ? EMOJI_CATEGORIES.flatMap(category => 
        category.emojis.filter(emoji => 
          emoji.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : [];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('h-9 w-9', className)}
            onClick={() => handleOpenChange(!isOpen)}
          >
            <SmilePlus className="h-5 w-5" />
            <span className="sr-only">Open emoji picker</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[320px] p-0"
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-[360px] overflow-hidden">
          {/* Search bar */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search emojis..."
                className="pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>

          {/* Emoji grid */}
          <div className="flex-1 overflow-y-auto p-2">
            {searchQuery ? (
              // Search results
              <div className="grid grid-cols-8 gap-1">
                {filteredEmojis.length > 0 ? (
                  filteredEmojis.map((emoji, index) => (
                    <button
                      key={`search-${index}`}
                      className="text-2xl p-1.5 rounded-md hover:bg-muted transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmojiSelect(emoji);
                      }}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    No emojis found
                  </div>
                )}
              </div>
            ) : (
              // Categorized emojis
              <div className="space-y-4">
                {/* Frequently used */}
                {frequentlyUsed.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">
                      Frequently used
                    </h3>
                    <div className="grid grid-cols-8 gap-1">
                      {frequentlyUsed.map((emoji, index) => (
                        <button
                          key={`frequent-${index}`}
                          className="text-2xl p-1.5 rounded-md hover:bg-muted transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmojiSelect(emoji);
                          }}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {EMOJI_CATEGORIES.filter(cat => cat.name !== 'Frequently Used').map((category) => (
                  <div key={category.name}>
                    <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-8 gap-1">
                      {category.emojis.map((emoji, index) => (
                        <button
                          key={`${category.name}-${index}`}
                          className="text-2xl p-1.5 rounded-md hover:bg-muted transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmojiSelect(emoji);
                          }}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
