# Chat Optimization Implementation Plan

## Executive Summary
This document outlines the implementation strategy to optimize the UnifiedChatInterface based on the analysis findings. The plan addresses critical performance issues, UX enhancements, and architectural improvements.

## Phase 1: Critical Performance Fixes (Immediate)

### 1.1 Optimize Activity Extraction
**Problem**: `extractActivities` runs on every render
**Solution**: Memoize the extraction logic

```typescript
// Before (runs every render)
const contentParts = extractActivities(message.content)

// After (memoized)
const contentParts = useMemo(
  () => extractActivities(message.content),
  [message.content]
)
```

### 1.2 Fix Memory Leak in Auto-scroll
**Problem**: Scroll triggers on every message count change
**Solution**: Implement smart scrolling

```typescript
// Improved implementation
const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
const [lastMessageCount, setLastMessageCount] = useState(0)

useEffect(() => {
  // Only scroll for new messages, not edits
  if (messages.length > lastMessageCount && shouldAutoScroll) {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end' 
    })
  }
  setLastMessageCount(messages.length)
}, [messages.length, lastMessageCount, shouldAutoScroll])

// Detect manual scroll
const handleScroll = useCallback((e: React.UIEvent) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
  setShouldAutoScroll(isAtBottom)
}, [])
```

### 1.3 Implement Virtual Scrolling
**Problem**: Performance degrades with 50+ messages
**Solution**: Add @tanstack/react-virtual

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const MessageListVirtual: React.FC<{ messages: UnifiedMessage[] }> = ({ messages }) => {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // Estimated message height
    overscan: 5, // Render 5 items outside viewport
  })
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={messages[virtualItem.index].id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <MessageComponent 
              message={messages[virtualItem.index]}
              isLast={virtualItem.index === messages.length - 1}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Phase 2: State Management & Persistence

### 2.1 Message Persistence Layer
**Implementation**: Create a persistence hook

```typescript
// hooks/use-message-persistence.ts
export const useMessagePersistence = (sessionId: string) => {
  const STORAGE_KEY = `chat_messages_${sessionId}`
  const MAX_MESSAGES = 100 // Limit stored messages
  
  const saveMessages = useCallback((messages: UnifiedMessage[]) => {
    try {
      const toStore = messages.slice(-MAX_MESSAGES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    } catch (e) {
      console.error('Failed to persist messages:', e)
    }
  }, [STORAGE_KEY])
  
  const loadMessages = useCallback((): UnifiedMessage[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Failed to load messages:', e)
      return []
    }
  }, [STORAGE_KEY])
  
  const clearMessages = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [STORAGE_KEY])
  
  return { saveMessages, loadMessages, clearMessages }
}
```

### 2.2 Optimistic Updates
**Implementation**: Update UI before API response

```typescript
const handleSendMessage = async (content: string) => {
  // Create optimistic message
  const optimisticMessage: UnifiedMessage = {
    id: `temp_${Date.now()}`,
    role: 'user',
    content,
    metadata: { timestamp: new Date() }
  }
  
  // Update UI immediately
  setMessages(prev => [...prev, optimisticMessage])
  
  try {
    const response = await sendMessageAPI(content)
    // Replace optimistic message with real one
    setMessages(prev => 
      prev.map(msg => 
        msg.id === optimisticMessage.id ? response.message : msg
      )
    )
  } catch (error) {
    // Revert on error
    setMessages(prev => 
      prev.filter(msg => msg.id !== optimisticMessage.id)
    )
    showError('Failed to send message')
