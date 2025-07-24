# Unified Activity System Documentation

## Overview

The FB-c_labV2 project uses a **single, unified activity system** for tracking all user interactions, AI operations, and system events. This system provides real-time activity logging with database persistence and client-side synchronization.

## Architecture

### Single Source of Truth: `useRealTimeActivities`

The entire activity system is built around one core hook:

```typescript
// hooks/use-real-time-activities.ts
export function useRealTimeActivities() {
  // Provides:
  // - activities: ActivityItem[]
  // - addActivity: (activity) => void
  // - updateActivity: (id, updates) => void
  // - clearActivities: () => void
  // - isConnected: boolean
}
```

### Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client-Side   │    │   Server-Side    │    │   Database      │
│                 │    │                  │    │                 │
│ addActivity()   │───▶│ logServerActivity│───▶│ activities      │
│                 │    │                  │    │                 │
│ useRealTime     │◀───│ Supabase         │◀───│ realtime        │
│ Activities      │    │ Realtime         │    │ subscription    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. Client-Side Activity Management

**Location**: `hooks/use-real-time-activities.ts`

**Purpose**: Manages client-side activity state and provides real-time updates

**Key Features**:
- Loads existing activities from database on mount
- Subscribes to real-time database changes
- Provides local activity management functions
- Handles connection status

**Usage**:
```typescript
const { activities, addActivity, updateActivity, isConnected } = useRealTimeActivities()

// Add a new activity
addActivity({
  type: "user_action",
  title: "User Message Sent",
  description: "User sent a message",
  status: "completed"
})
```

### 2. Server-Side Activity Logging

**Location**: `lib/server-activity-logger.ts`

**Purpose**: Logs activities directly to the database from server-side code

**Key Features**:
- Database persistence
- Error handling with fallback to console logging
- Type-safe activity creation
- Integration with real-time system

**Usage**:
```typescript
import { logServerActivity } from '@/lib/server-activity-logger'

await logServerActivity({
  type: "ai_stream",
  title: "AI Response Generated",
  description: "Generated response for user query",
  status: "completed",
  metadata: { responseLength: 1500 }
})
```

### 3. Activity Context Provider

**Location**: `app/chat/context/ChatProvider.tsx`

**Purpose**: Provides activity system to React components

**Usage**:
```typescript
const { activityLog, addActivity } = useChatContext()

// Add activity from any component
addActivity({
  type: "file_upload",
  title: "File Uploaded",
  description: "User uploaded document.pdf",
  status: "completed"
})
```

## Activity Types

All activity types are defined in `app/chat/types/chat.ts`:

```typescript
export interface ActivityItem {
  id: string
  type: 
    | "user_action"           // User interactions
    | "ai_request"           // AI processing requests
    | "ai_stream"            // AI streaming responses
    | "ai_thinking"          // AI analysis/processing
    | "google_search"        // Web search operations
    | "web_scrape"           // Data extraction
    | "doc_analysis"         // Document processing
    | "image_upload"         // Image uploads
    | "voice_input"          // Voice interactions
    | "screen_share"         // Screen sharing
    | "file_upload"          // File uploads
    | "lead_capture"         // Lead generation
    | "conversation_started" // Chat sessions
    | "stage_transition"     // Conversation flow
    | "email_sent"           // Email operations
    | "error"                // Error events
    // ... and more
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "failed"
  timestamp: number
  metadata?: Record<string, any>
}
```

## Database Schema

**Table**: `activities`

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' 
    CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Features**:
- Real-time enabled for live updates
- Row-level security policies
- Indexed for performance
- JSON metadata for flexible data storage

## Usage Patterns

### 1. Client-Side Activity Logging

```typescript
// In React components
const { addActivity } = useChatContext()

// Log user actions
addActivity({
  type: "user_action",
  title: "User Message Sent",
  description: input.substring(0, 100),
  status: "completed"
})

// Log AI responses
addActivity({
  type: "ai_stream",
  title: "AI Response Generated",
  description: `Generated ${response.length} character response`,
  status: "completed"
})
```

### 2. Server-Side Activity Logging

```typescript
// In API routes
import { logServerActivity } from '@/lib/server-activity-logger'

// Log processing steps
await logServerActivity({
  type: "ai_thinking",
  title: "Processing User Request",
  description: "Analyzing user input and generating response",
  status: "in_progress"
})

// Log completion
await logServerActivity({
  type: "ai_stream",
  title: "Response Complete",
  description: "Successfully generated AI response",
  status: "completed"
})
```

### 3. Activity Display

```typescript
// In UI components
const { activityLog } = useChatContext()

// Display activities in timeline
<TimelineActivityLog 
  activities={activityLog} 
  onActivityClick={handleActivityClick}
/>
```

## Activity Icons

Each activity type has a corresponding icon defined in `components/chat/sidebar/ActivityIcon.tsx`:

```typescript
const getIcon = () => {
  switch (type) {
    case "user_action": return <MessageSquare />
    case "ai_request": return <Bot />
    case "google_search": return <Search />
    case "ai_thinking": return <Brain />
    case "error": return <AlertTriangle />
    // ... etc
  }
}
```

## Real-Time Features

### Live Updates
- Activities appear instantly across all connected clients
- Database changes trigger real-time UI updates
- Connection status indicators

### Activity States
- **Pending**: Activity queued but not started
- **In Progress**: Activity currently being processed
- **Completed**: Activity finished successfully
- **Failed**: Activity encountered an error

## Error Handling

### Database Connection Issues
- Falls back to console logging when database unavailable
- Graceful degradation of real-time features
- Connection status monitoring

### Activity Validation
- Type-safe activity creation
- Required field validation
- Metadata schema validation

## Performance Considerations

### Activity Limits
- Maximum 50 activities kept in memory
- Automatic cleanup of old activities
- Efficient real-time subscriptions

### Database Optimization
- Indexed queries for fast retrieval
- JSONB metadata for flexible storage
- Efficient real-time change detection

## Migration from Old Systems

### Removed Components
- ❌ `lib/activity-logger.ts` - Replaced by unified system
- ❌ `hooks/chat/useActivities.ts` - Redundant functionality
- ❌ `sampleTimelineData.ts` - No longer needed

### Migration Steps
1. Replace `activityLogger.log()` with `addActivity()`
2. Replace `logActivity()` with `logServerActivity()`
3. Update imports to use new unified system
4. Remove references to old activity systems

## Best Practices

### 1. Use Appropriate Activity Types
```typescript
// ✅ Good - Specific activity type
addActivity({
  type: "ai_thinking",
  title: "Analyzing Document",
  description: "Processing uploaded PDF for insights"
})

// ❌ Bad - Generic type
addActivity({
  type: "generic",
  title: "Something happened",
  description: "User did something"
})
```

### 2. Provide Meaningful Descriptions
```typescript
// ✅ Good - Descriptive
addActivity({
  type: "file_upload",
  title: "Document Uploaded",
  description: "Uploaded 'Q4_Report.pdf' (2.3MB)"
})

// ❌ Bad - Vague
addActivity({
  type: "file_upload",
  title: "File Uploaded",
  description: "File uploaded"
})
```

### 3. Use Metadata for Additional Context
```typescript
addActivity({
  type: "ai_stream",
  title: "AI Response Generated",
  description: "Generated personalized response",
  metadata: {
    responseLength: 1500,
    processingTime: 2.3,
    tokensUsed: 450
  }
})
```

### 4. Handle Activity States Properly
```typescript
// Start activity
const activityId = addActivity({
  type: "doc_analysis",
  title: "Analyzing Document",
  status: "in_progress"
})

// Update progress
updateActivity(activityId, { 
  status: "completed",
  description: "Analysis complete - found 5 key insights"
})
```

## Troubleshooting

### Common Issues

1. **Activities not appearing**
   - Check database connection
   - Verify real-time subscription status
   - Check activity type is valid

2. **Real-time not working**
   - Verify Supabase configuration
   - Check network connectivity
   - Review real-time subscription setup

3. **Database errors**
   - Check activities table exists
   - Verify RLS policies
   - Check database permissions

### Debug Tools

```typescript
// Check connection status
const { isConnected } = useRealTimeActivities()
console.log('Real-time connected:', isConnected)

// Monitor activity updates
useEffect(() => {
  console.log('Activities updated:', activities)
}, [activities])
```

## Future Enhancements

### Planned Features
- Activity filtering and search
- Activity export functionality
- Activity analytics and insights
- Custom activity types for plugins
- Activity retention policies

### Performance Improvements
- Activity batching for high-volume scenarios
- Optimistic updates for better UX
- Activity caching strategies
- Background activity processing

---

**Note**: This unified activity system replaces all previous activity logging implementations. All new features should use this system exclusively. 