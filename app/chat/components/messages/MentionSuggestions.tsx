'use client';

import { useEffect, useRef, useState } from 'react';
import { User, Search, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  email?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

interface MentionSuggestionsProps {
  /**
   * The current search query (text after @ symbol)
   */
  query: string;
  /**
   * List of users that can be mentioned
   */
  users: User[];
  /**
   * Callback when a user is selected
   */
  onSelect: (user: User) => void;
  /**
   * Callback when the suggestions should be closed
   */
  onClose: () => void;
  /**
   * Position of the mention popover
   */
  position?: { top: number; left: number } | null;
  /**
   * Optional class name for the container
   */
  className?: string;
  /**
   * Maximum height of the suggestions popover
   * @default 300
   */
  maxHeight?: number;
  /**
   * Whether to show loading state
   */
  isLoading?: boolean;
  /**
   * Optional loading component
   */
  loadingComponent?: React.ReactNode;
  /**
   * Optional empty state component
   */
  emptyComponent?: React.ReactNode;
  /**
   * Optional header component
   */
  headerComponent?: React.ReactNode;
  /**
   * Optional footer component
   */
  footerComponent?: React.ReactNode;
  /**
   * Whether to show the search input
   * @default true
   */
  showSearch?: boolean;
  /**
   * Placeholder text for the search input
   * @default 'Search users...'
   */
  searchPlaceholder?: string;
  /**
   * Whether to highlight the query in the user's name and username
   * @default true
   */
  highlightQuery?: boolean;
  /**
   * Custom render function for each user item
   */
  renderUser?: (user: User, query: string) => React.ReactNode;
}

export const MentionSuggestions = ({
  query,
  users = [],
  onSelect,
  onClose,
  position,
  className,
  maxHeight = 300,
  isLoading = false,
  loadingComponent,
  emptyComponent,
  headerComponent,
  footerComponent,
  showSearch = true,
  searchPlaceholder = 'Search users...',
  highlightQuery = true,
  renderUser,
}: MentionSuggestionsProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter users based on query
  const filteredUsers = query
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.email?.toLowerCase().includes(query.toLowerCase())
      )
    : users;

  // Handle keyboard navigation
  useEffect(() => {
    if (!containerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredUsers[selectedIndex]) {
          onSelect(filteredUsers[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredUsers, selectedIndex, onSelect, onClose]);

  // Reset selected index when users change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredUsers]);

  // Focus search input when component mounts
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Highlight query in text
  const highlightText = (text: string, highlight: string) => {
    if (!highlightQuery || !highlight) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="font-semibold text-primary">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Default user render function
  const defaultRenderUser = (user: User) => (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">
          {highlightText(user.name, query)}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          @{highlightText(user.username, query)}
        </div>
      </div>
      {user.status && (
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            user.status === 'online' && 'bg-green-500',
            user.status === 'offline' && 'bg-gray-400',
            user.status === 'away' && 'bg-yellow-500',
            user.status === 'busy' && 'bg-red-500'
          )}
        />
      )}
    </div>
  );

  if (!position) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute z-50 w-64 rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {showSearch && (
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder={searchPlaceholder}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-8 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={query}
              onChange={(e) => {
                // The actual search is handled by the parent component
                e.stopPropagation();
              }}
            />
          </div>
        </div>
      )}

      {headerComponent}

      {isLoading ? (
        loadingComponent || (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        )
      ) : filteredUsers.length === 0 ? (
        emptyComponent || (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No users found
          </div>
        )
      ) : (
        <ScrollArea className="max-h-[300px] overflow-y-auto">
          <div className="p-1">
            {filteredUsers.map((user, index) => (
              <button
                key={user.id}
                type="button"
                className={cn(
                  'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  selectedIndex === index && 'bg-accent text-accent-foreground',
                  'focus:bg-accent focus:text-accent-foreground',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(user);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {renderUser ? renderUser(user, query) : defaultRenderUser(user)}
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {footerComponent}
    </div>
  );
};

export default MentionSuggestions;
