'use client';

import { useState, useEffect, useRef } from 'react';
import { Smile, Search, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

// Emoji data - in a real app, you might want to import this from a package
const EMOJI_CATEGORIES = [
  { id: 'smileys', name: 'Smileys & Emotion', icon: '😀' },
  { id: 'people', name: 'People & Body', icon: '👋' },
  { id: 'animals', name: 'Animals & Nature', icon: '🐻' },
  { id: 'food', name: 'Food & Drink', icon: '🍎' },
  { id: 'travel', name: 'Travel & Places', icon: '✈️' },
  { id: 'activities', name: 'Activities', icon: '⚽' },
  { id: 'objects', name: 'Objects', icon: '💡' },
  { id: 'symbols', name: 'Symbols', icon: '❤️' },
  { id: 'flags', name: 'Flags', icon: '🚩' },
];

// Sample emojis - in a real app, you'd have a more comprehensive list
const EMOJIS: Record<string, { emoji: string; name: string }[]> = {
  smileys: [
    { emoji: '😀', name: 'grinning face' },
    { emoji: '😃', name: 'grinning face with big eyes' },
    { emoji: '😄', name: 'grinning face with smiling eyes' },
    { emoji: '😁', name: 'beaming face with smiling eyes' },
    { emoji: '😆', name: 'grinning squinting face' },
  ],
  people: [
    { emoji: '👋', name: 'waving hand' },
    { emoji: '🤚', name: 'raised back of hand' },
    { emoji: '🖐️', name: 'hand with fingers splayed' },
    { emoji: '✋', name: 'raised hand' },
    { emoji: '🖖', name: 'vulcan salute' },
  ],
  // Add more emojis as needed
};

// Recent emojis storage key
const RECENT_EMOJIS_KEY = 'recent-emojis';

interface EmojiPickerProps {
  /**
   * Callback when an emoji is selected
   */
  onSelect: (emoji: string) => void;
  /**
   * Additional class name for the trigger button
   */
  className?: string;
  /**
   * Whether to show the search input
   * @default true
   */
  showSearch?: boolean;
  /**
   * Whether to show the recent emojis section
   * @default true
   */
  showRecent?: boolean;
  /**
   * Maximum number of recent emojis to show
   * @default 12
   */
  maxRecentEmojis?: number;
  /**
   * Custom emoji categories
   */
  customCategories?: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  /**
   * Custom emojis
   */
  customEmojis?: Record<string, { emoji: string; name: string }[]>;
  /**
   * Whether the picker is open (controlled)
   */
  open?: boolean;
  /**
   * Callback when the open state changes
   */
  onOpenChange?: (open: boolean) => void;
}

export const EmojiPicker = ({
  onSelect,
  className,
  showSearch = true,
  showRecent = true,
  maxRecentEmojis = 12,
  customCategories,
  customEmojis,
  open: controlledOpen,
  onOpenChange,
}: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('smileys');
  const popoverRef = useRef<HTMLDivElement>(null);
  const isControlled = typeof controlledOpen !== 'undefined';
  const open = isControlled ? controlledOpen : isOpen;

  // Load recent emojis from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(RECENT_EMOJIS_KEY);
      if (saved) {
        setRecentEmojis(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent emojis:', error);
    }
  }, []);

  // Save recent emojis to localStorage when they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(recentEmojis));
    } catch (error) {
      console.error('Failed to save recent emojis:', error);
    }
  }, [recentEmojis]);

  // Handle emoji selection
  const handleSelect = (emoji: string) => {
    // Add to recent emojis
    setRecentEmojis(prev => {
      const newRecents = [emoji, ...prev.filter(e => e !== emoji)];
      return newRecents.slice(0, maxRecentEmojis);
    });
    
    // Call the onSelect callback
    onSelect(emoji);
    
    // Close the picker if controlled
    if (!isControlled) {
      setIsOpen(false);
    } else {
      onOpenChange?.(false);
    }
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Get emojis based on search query
  const getFilteredEmojis = () => {
    const categories = customCategories || EMOJI_CATEGORIES;
    const emojis = customEmojis || EMOJIS;
    
    if (!searchQuery.trim()) {
      return { categories, emojis };
    }
    
    const query = searchQuery.toLowerCase();
    const filteredEmojis: Record<string, { emoji: string; name: string }[]> = {};
    
    Object.entries(emojis).forEach(([category, items]) => {
      const filtered = items.filter(
        item => item.name.toLowerCase().includes(query) || item.emoji.includes(query)
      );
      
      if (filtered.length > 0) {
        filteredEmojis[category] = filtered;
      }
    });
    
    // Only show categories that have matching emojis
    const filteredCategories = categories.filter(
      cat => filteredEmojis[cat.id]?.length > 0
    );
    
    return { 
      categories: filteredCategories, 
      emojis: filteredEmojis 
    };
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        if (!isControlled) {
          setIsOpen(false);
        } else {
          onOpenChange?.(false);
        }
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, isControlled, onOpenChange]);

  const { categories, emojis } = getFilteredEmojis();
  const hasSearchResults = Object.keys(emojis).length > 0;

  return (
    <div className="relative" ref={popoverRef}>
      <Popover 
        open={open}
        onOpenChange={(newOpen) => {
          if (!isControlled) {
            setIsOpen(newOpen);
          }
          onOpenChange?.(newOpen);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 p-0 text-muted-foreground hover:text-foreground',
              className
            )}
            onClick={() => {
              if (!isControlled) {
                setIsOpen(!open);
              } else {
                onOpenChange?.(!open);
              }
            }}
          >
            <Smile className="h-4 w-4" />
            <span className="sr-only">Open emoji picker</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[300px] p-0" 
          align="start"
          side="top"
          sideOffset={8}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="flex flex-col">
            {showSearch && (
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search emojis..."
                    className="pl-8 h-9"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7 p-0 text-muted-foreground"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear search</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex flex-col h-[300px] overflow-hidden">
              {showRecent && recentEmojis.length > 0 && !searchQuery && (
                <div className="px-3 pt-3">
                  <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Recently used</span>
                  </h3>
                  <div className="grid grid-cols-8 gap-1 mb-3">
                    {recentEmojis.map((emoji, i) => (
                      <button
                        key={`recent-${i}`}
                        className="text-2xl p-1 rounded-md hover:bg-muted transition-colors"
                        onClick={() => handleSelect(emoji)}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <Tabs 
                defaultValue={activeCategory} 
                onValueChange={setActiveCategory}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="px-3 border-t">
                  <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 rounded-none">
                    {categories.map((category) => (
                      <TabsTrigger 
                        key={category.id}
                        value={category.id}
                        className="px-2 py-2 text-lg data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                        title={category.name}
                      >
                        {category.icon}
                        <span className="sr-only">{category.name}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                <ScrollArea className="flex-1 px-3 py-2">
                  {hasSearchResults ? (
                    categories.map((category) => (
                      <TabsContent 
                        key={category.id} 
                        value={category.id}
                        className="mt-0"
                      >
                        <h3 className="text-xs font-medium text-muted-foreground mb-2">
                          {category.name}
                        </h3>
                        <div className="grid grid-cols-8 gap-1">
                          {(emojis[category.id] || []).map((item, i) => (
                            <button
                              key={`${category.id}-${i}`}
                              className="text-2xl p-1 rounded-md hover:bg-muted transition-colors"
                              onClick={() => handleSelect(item.emoji)}
                              title={item.name}
                            >
                              {item.emoji}
                            </button>
                          ))}
                        </div>
                        <div className="h-4" />
                      </TabsContent>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                      <Smile className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No emojis found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try another search term</p>
                    </div>
                  )}
                </ScrollArea>
              </Tabs>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;
