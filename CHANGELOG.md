# Changelog

## [2025-01-24] - Admin Dashboard and Chat Context Verification

### Verified
- **AdminDashboard Component**: Comprehensive verification of all component connections
  - All imported components exist with correct export statements
  - All component paths are correctly configured
  - All navigation sections work properly
  - Props are passed correctly to child components
  - Mobile responsiveness with dropdown navigation

- **AdminChatInterface**: Full context and functionality verification
  - ✅ Correct admin-specific context with real-time dashboard data
  - ✅ Connected to `/api/admin/chat` endpoint
  - ✅ Uses `useAdminChat` hook for state management
  - ✅ Admin context builder provides comprehensive data:
    - Overview metrics (leads, meetings, emails, costs, system health)
    - Leads data (recent, stats, top leads, trends)
    - Meetings data (upcoming, completed, calendar)
    - Email campaigns (active, stats, templates)
    - Cost tracking (token usage, budgets, provider costs)
    - Analytics (engagement, user behavior, performance)
    - AI performance metrics (accuracy, response time, satisfaction)
    - Activity logs (recent activities, alerts, errors)
    - System status (health, freshness, API status)
  - ✅ Quick actions for common admin tasks
  - ✅ Suggested prompts for business insights
  - ✅ Real-time message streaming with SSE

### Added
- **AdminDashboard Test Suite**: Comprehensive test coverage
  - Component rendering tests
  - Navigation functionality tests  
  - Props validation tests
  - Mobile responsiveness tests
  - All 19 tests passing successfully
  
- **Admin Integration Tests**: End-to-end testing
  - Authentication flow verification
  - Component integration tests
  - API endpoint connectivity tests
  - All component exports verified
  - All 6 integration tests passing

- **AdminChatInterface Test Suite**: Context verification tests
  - Component rendering tests
  - Quick actions and prompts tests
  - Message handling tests
  - Context integration tests
  - API endpoint verification
  - All 17 tests passing successfully

### Video-to-App Pipeline Unification
- Passed `userPrompt` from UI to API and included in spec prompt shaping
- Added consent + rate limiting via `withFullSecurity` to `/api/video-to-app`
- Consolidated YouTube helpers to `lib/youtube.ts`; removed duplicate
- Removed unused `lib/video2app/textGeneration.ts`
- Improved UI: progress tracker and Copy/Download actions
- Tests updated; video-to-app component tests all green

### Fixed
- ScrollIntoView compatibility issue in test environment

### Confirmed Working
- All admin components properly connected:
  - AdminHeader, AdminSidebar, OverviewSection
  - EmailCampaignManager, LeadsList, InteractionAnalytics
  - AIPerformanceMetrics, RealTimeActivity, AdminChatInterface
  - TokenCostAnalytics, FlyIOCostControls, MeetingCalendar
- Admin page accessible at `/admin` route
- Authentication check with `/api/admin/stats` endpoint
- Admin chat with full business context from dashboard data
- Development server serving admin dashboard correctly (HTTP 200)

## [2025-01-22] - Voice UI Enhancement with F.B/c Orb

### Added
- **FbcVoiceOrb Component**: Custom animated orb using inverted F.B/c logo design
  - Different animation states for AI activities:
    - `idle`: Default state with subtle animations
    - `listening`: Rotating arc with pulsing core (red)
    - `thinking`: Multiple arcs with complex animations (blue)
    - `talking`: Sound wave effects with pulsing (green)
    - `browsing`: Progressive arc animation (purple)
  - Inverted gradient design for modern look
  - Dynamic color transitions based on state
  - Smooth animations using Framer Motion

### Changed
- **VoiceInput Component**: Replaced simple button with FbcVoiceOrb
  - Integrated custom orb for both card and modal modes
  - Better visual feedback for AI states
  - More engaging and interactive design
  - Maintains compact form factor

All notable changes to this project will be documented in this file.

## [2025-01-24] - Collab Page Chat Visibility Fix

### Fixed
- **Chat Area Visibility**: Resolved critical UI issue where chat output was barely visible
  - Added proper background styling with `bg-muted/10` and border for chat container
  - Improved chat area contrast with rounded corners and margin spacing
  - Added empty state for dock mode with clear messaging and icon
  - Fixed ConversationContent padding for dock mode to prevent overflow issues

### Improved
- **Chat UX**: Enhanced chat interface visibility and user experience
  - Chat area now has clear visual boundaries and proper contrast
  - Added "Ready to chat with F.B/c AI" empty state when no messages
  - Improved dock mode styling with better spacing and padding
  - Chat container now properly contained within rounded border

### Technical
- **Component Styling**: Updated AIEChat and collab page styling
  - Added MessageCircle import for empty state icon
  - Improved responsive padding for dock vs full mode
  - Enhanced visual hierarchy with proper background colors

## [2025-08-15] - Collab Page Cleanup (No-op Features Removed)

### Removed
- Header online presence badge ("0 online") pending real presence pipeline
- Sidebar footer actions: Plus and Settings (no functional pipeline yet)

### Changed
- Cleaned up unused icon imports in `app/collab/page.tsx`
- Kept tooltip and accessibility structure intact for existing feature tabs only

## [Unreleased]

### UI Unification & Mobile Canvas - 2025-08-14
- Added global `CanvasProvider` with `useCanvas()` for single-surface tool orchestration
- Added `CanvasOrchestrator` to render `webcam`, `screen`, `video`, `pdf`, and `code` inside `CanvasWorkspace`
- Made `CanvasWorkspace` responsive: stacked layout with Details/Console sheets on mobile; preserved resizable panes on desktop
- Added `ToolLauncher` FAB with bottom sheet for mobile tool entry
- Wired provider in `app/layout.tsx`; replaced all `setCanvas(...)` calls in `AIEChat.tsx` with `openCanvas(...)`
- Removed legacy inline canvas body in `AIEChat`; no duplicated tool mounts
- Introduced `hooks/use-is-mobile.ts`
- Cleanup: eliminated all remaining direct `setCanvas` usages

### API Unification - 2025-08-13
- Canonicalized tool routes under `/api/tools/*` and intelligence under `/api/intelligence/*`
- Removed legacy/duplicate endpoints:
  - Deleted `app/api/calculate-roi/route.ts` (replaced by `/api/tools/roi`)
  - Deleted `app/api/lead-research/route.ts` (use `/api/intelligence/lead-research`)
  - Moved `app/api/translate/route.ts` to `/api/tools/translate/route.ts`
- Standardized tool responses to `ToolRunResult { ok, output, error?, citations? }`
- Added canonical ROI route: `app/api/tools/roi/route.ts`
- Normalized Screen Share output to `ToolRunResult`; will rename path to `/api/tools/screen` in a follow-up commit
  - Completed: removed legacy `app/api/tools/screen-share/route.ts`; canonical path is `/api/tools/screen`
  - Completed: removed legacy `app/api/tools/webcam-capture/route.ts`; canonical path is `/api/tools/webcam`
  - Added `FBC_USE_MOCKS`/`NEXT_PUBLIC_USE_MOCKS` env toggle for mock fallbacks in tools (screen, video-to-app)
- Updated callers:
  - `components/chat/ChatArea.tsx` now calls `/api/tools/translate`
  - `components/chat/tools/ROICalculator/ROICalculator.tsx` now calls `/api/tools/roi`
  - `lib/services/tool-service.ts` routes unified to `/api/tools/{roi,screen,webcam}`
  - `lib/api-router.ts` translate route updated
  - `scripts/function-validation-criteria.ts` endpoints updated
- Middleware cleanup: removed legacy `/api/lead-research` mock mapping
- No functional UI regressions expected; mocks still respected when enabled

### Browser Tools MCP Integration - 2025-08-14
- Added pnpm scripts to streamline AgentDeskAI Browser Tools setup:
  - `pnpm mcp:bridge` → runs `@agentdeskai/browser-tools-server@latest` (bridge on port 3025)
  - `pnpm mcp:server` → runs `@agentdeskai/browser-tools-mcp@1.2.0`
  - `pnpm mcp:dev` → runs both concurrently
- Usage notes:
  - Load the Chrome extension (unpacked) from the repo's `chrome-extension` folder
  - In Cursor Settings → MCP Servers, configure:
    `{ "mcpServers": { "browser-tools": { "command": "pnpm", "args": ["mcp:server"] } } }`
  - Ensure the bridge is running before starting the MCP server

### Gamified Workshop Education - 2025-08-13
- Converted `/workshop` into an interactive, gamified education page
  - Added `components/workshop/education-modules.ts` with module/step config and XP
  - Added `components/workshop/GamifiedSection.tsx` client island (progress, mark-done, Ask AI)
  - Updated `app/workshop/page.tsx` to render modules, use our tokens, a11y fix on icons
  - Kept `ROICalculator` (card mode) under AI Integration
- AI context integration
  - New route `POST /api/intelligence/education` with guard+rate limit to persist progress into `conversation_contexts.tool_outputs.education`
  - Suggestion engine: nudge ROI first for workshop when unused
- Telemetry hook: triggers `chat-capability-used` refresh so suggestions update

### Security and DB Policies - 2025-08-11
- Synced Supabase RLS with production:
  - conversation_contexts, intent_classifications, capability_usage: authenticated users can only read their own by email/session mapping
  - conversation_insights, follow_up_tasks, voice_sessions: authenticated users restricted via `leads.user_id = auth.uid()` for SELECT/INSERT
- Replaced permissive public policies on conversation tables with strict ownership checks
- Hardened DB functions:
  - Added `public.secure_function_template` with SECURITY DEFINER and empty search_path
  - Replaced `get_slow_queries` with SECURITY DEFINER and revoked PUBLIC EXECUTE
- Index maintenance:
  - Added missing `idx_leads_user_id`
  - Dropped a set of unused/duplicate indexes to cut bloat and planner noise

### Phase 1–2 Stabilization - 2025-08-10
### Voice Overlay Modernization - 2025-08-11
- Replaced legacy `VoiceOverlay` implementation with wrapper around `components/chat/tools/VoiceInput` (FbcVoiceOrb UI)
- Removed deprecated `hooks/useLiveSession.ts`; unified on WebSocket pipeline with VAD and TURN handling
- Ensures 16kHz PCM chunking, 500ms VAD silence threshold, and TURN_COMPLETE routing server-side

### Realtime Voice WS Handshake Stabilization - 2025-08-12
- Client: send `{ type: "start" }` immediately on WebSocket `onopen` to satisfy server handshake expectations; avoid duplicates via `sentStartRef`
- Client: keep `startSession` as fallback; skip duplicate start if already sent on open; improved state logs
- Server: attach `WebSocketServer` directly to HTTP(S) server instead of manual `handleUpgrade`
- Server: emit `{ type: 'connected' }` ack on connect, add keepalive pings and process-level error handlers
- Result: fixes immediate 1005/no-status closes and stabilizes session start → `session_started` → audio flow

### Voice Hook de-duplication + session gating - 2025-08-12
- Client hook `useWebSocketVoice`:
  - Log mount/unmount only once via `useEffect` (removed render-time spam)
  - Added `sessionActiveRef` to gate audio sending until after `'session_started'`
  - Queue audio frames while WS is open but session not yet ready; flush on `'session_started'`
  - Reset `sessionActiveRef` on socket recreate/close and on `session_ended`
  - Prevents repeated `session_started` cascades from early audio frames

### Unified “Book a Call” UX - 2025-08-12
- Added `MeetingOverlay` (`components/meeting/MeetingOverlay.tsx`) using a modal with Cal.com inline widget and lazy-loaded script
- Added `MeetingProvider` + `useMeeting()` (`components/providers/meeting-provider.tsx`), wrapped app in provider (`app/layout.tsx`)
- Wired CTAs to open the overlay:
  - Home (`app/page.tsx`): hero and “Schedule Free Consultation”
  - Consulting (`app/consulting/page.tsx`): primary buttons
  - Contact (`app/contact/page.tsx`): replaced inline embed with a clean button to open overlay
  - Chat (`components/chat/AIEChat.tsx`): SuggestedActions `meeting` opens overlay
  - Chat tool card (`components/chat/ChatArea.tsx`): meeting tool shows button to open overlay (no iframe inline)

- Conversational Intelligence Phase 1: session persistence hardened, idempotent `session-init`, stable `context` with ETag/304 and rate limits, unified `intelligence-session-id`.
- Conversational Intelligence Phase 2: added `POST /api/intelligence/intent` and `POST /api/intelligence/suggestions`, UI `SuggestedActions` and wiring in `AIEChat` (first user message → intent; suggestions rendered and actionable).
- Capability tracking: server-side recording for `translate` and `exportPdf`; progress chip and suggestions now reflect server snapshot.
- Suggestion engine: simple role/industry ranking.
- Tests: unit (intent detector, suggestion engine) and Playwright e2e for Phase 2 acceptance.
- Dev: fixed `scripts/check-dev-processes.js` (ESM→CJS) to allow `pnpm dev:safe` with port/process guard.

### UI Motion Polish - 2025-08-09
- Added reusable micro-animation components: `components/ui/fade-in.tsx`, `components/ui/motion-card.tsx`, `components/ui/stat-counter.tsx`
- Home (`app/page.tsx`):
  - Hero: added conic orbit ring and refined ambient glow behind F.B/c icon
  - Features grid: staggered fade-in and magnetic hover glow via `MotionCard`
- Consulting (`app/consulting/page.tsx`):
  - Animated service/workshop cards using `FadeIn` + `MotionCard`
  - Embedded `ROICalculator` (card mode) inline to enable immediate interaction

### Progressive Discovery Additions - 2025-08-09
- Global progress tracker chip to visualize explored capabilities: `components/experience/progress-tracker.tsx`
- Citations trust microtile to preview grounded answers: `components/experience/citations-demo.tsx`
- Wired into Home and Consulting pages; ready to reuse across About/Workshop/Contact

### Chat UX Polish - 2025-08-08
- LeadProgressIndicator: removed wrapper/background for a floating look; added soft ambient behind the rail; mobile dropdown summary with expandable vertical steps; kept hover details opening to the left; shows stage index and percent
- Chat avatars: user avatar now shows a small brand-accent status dot; assistant messages display a compact brand icon while streaming/thinking
- Prompt/Input: increased textarea min-height on mobile for better usability
- Quick actions: ensured Screen Share and Webcam quick icons with tooltips; progress chip tooltip lists explored capabilities
- ROI: inline Guided ROI form scaffolded when suggested by coach; auto-open ROI canvas deferred per product decision

### Added - 2025-08-08
- AI Elements: Synced full component set via `shadcn add https://ai-sdk.dev/elements.json` (updated `code-block`, `inline-citation`, `response`, `ui/carousel`)
- Gallery page to preview all AI Elements at `app/test/ai-elements/page.tsx` (route: `/test/ai-elements`)
- Branded AI chat demo at `app/test/ai-chat/page.tsx` using AI Elements with `FbcIcon` for reasoning indicator and AI avatar styling

### UI Polish - 2025-08-07
- Unified focus rings across inputs, selects, textareas, buttons, and cards using brand accent with background offset
- Added tactile active press state to `Button` (slight translate-y)
- Increased disabled state contrast for better accessibility
- Aligned `Select`, `Input`, `Textarea` to use rounded-xl radii and glassy backgrounds with `backdrop-blur`
- Enhanced `Card` with focus-within ring for keyboard navigation

### Fixed - 2025-08-07 (Part 2)
- **🎯 COMPLETE FIX**: Restored audio chunk streaming to server
  - Reverted to Web Audio API-based voice recorder that sends continuous audio chunks
  - Audio chunks are now properly sent to server for buffering
  - Simple VAD detects 500ms of silence and sends TURN_COMPLETE signal
  - Server can now receive audio and forward to Gemini when turn is complete
- **🔊 Maintained PCM audio playback fix**
  - Raw PCM from Gemini is correctly decoded as Float32Array
  - AudioBuffer is manually created from PCM data
  - Supports both 16kHz and 24kHz sample rates

### Fixed - 2025-08-07
### Conversational Improvements - 2025-08-07
- Added `ActivityChip` and parsing in `ChatArea` to render inline activity markers without card wrappers
  - Use `[ACTIVITY_IN:Label]` and `[ACTIVITY_OUT:Label]` in assistant text; UI renders small chips
- Expanded assistant system prompts (text and voice) with F.B/c profile, services, workshop, abilities, and fun persona
  - `app/api/chat/route.ts` base prompt updated
  - `server/live-server.ts` systemInstruction updated

### Translation Feature - 2025-08-07
- Backend: Added `POST /api/translate` using Gemini for text translation with validation and activity logging
- Frontend: Added per-message translate action in `components/chat/ChatArea.tsx`
  - Quick translate to Spanish (ES) button on assistant messages
  - Renders translated text inline beneath the message

- **🎯 CRITICAL FIX**: Fixed PCM audio decoding in WebSocket voice functionality
  - Replaced incorrect `decodeAudioData` usage with manual PCM to Float32Array conversion
  - Now properly handles 16-bit little-endian PCM audio from Gemini Live API
  - Audio playback now works correctly with both 16kHz and 24kHz sample rates
- **🔊 Fixed audio response handling**: Removed incorrect audio/mpeg MIME type
  - All Gemini audio responses are now correctly treated as PCM, not MPEG
  - Unified audio queue handling for both 'audio' and 'gemini_response' messages
- **🎤 Improved VAD (Voice Activity Detection)**:
  - Lowered voice detection threshold from 0.01 to 0.005 for better sensitivity
  - Added comprehensive logging for VAD state debugging
  - Fixed TURN_COMPLETE signal triggering after silence detection
- **📝 Added debugging improvements**:
  - Enhanced logging throughout the voice pipeline
  - Added volume level logging for VAD debugging
  - Better error messages for audio playback failures

### Secure WebSocket Implementation - 2025-01-15

#### Security
- **HTTPS/WSS Protocol Upgrade**: Implemented secure WebSocket connections to resolve Mixed Content security errors
- Added SSL certificate support for local development using mkcert-generated certificates
- Upgraded server/live-server.ts to support both HTTP (production) and HTTPS (local development) protocols
- Updated client WebSocket URLs to use secure `wss://localhost:3001` connections
- Enhanced security compliance for HTTPS contexts preventing browser blocking of insecure connections

#### Changed
- **BREAKING**: Local development now requires SSL certificates (localhost.pem, localhost-key.pem)
- WebSocket server automatically detects environment and uses appropriate protocol (HTTP/HTTPS)
- All client WebSocket connections now default to secure protocols (wss://)
- Port configuration: Production uses port 8080 (Fly.io), Local development uses port 3001
- Improved connection logging with protocol detection and security status

#### Fixed
- Resolved Mixed Content security errors in browsers when connecting to WebSocket server
- Fixed WebSocket connection failures in secure HTTPS contexts
- Enhanced cross-browser compatibility for secure WebSocket connections
- **🎯 CRITICAL FIX**: Added missing `responseModalities: ['AUDIO', 'TEXT']` parameter to Gemini Live API configuration
  - This enables Gemini to respond with both audio (Puck's voice) and text (transcript)
  - Completes the full two-way voice conversation functionality
  - Resolves issue where audio was sent to Gemini but no responses were received

### Silero VAD Integration - 2025-08-06

#### Added
- **Advanced Silero VAD Integration**: Replaced custom voice recorder with professional-grade Silero Voice Activity Detection
- Neural network-based speech detection with configurable thresholds
- Automatic speech start/end detection using machine learning models
- Enhanced audio processing with 16kHz sample rate optimization
- Real-time volume visualization with Silero VAD feedback
- Comprehensive error handling for VAD initialization and operation

#### Changed
- **BREAKING**: Migrated VoiceInput component from `useVoiceRecorder` to `useSileroVAD`
- Improved voice detection accuracy and responsiveness
- Enhanced user interface with Silero VAD status indicators
- Updated toast notifications to reflect advanced VAD capabilities
- Better integration with WebSocket voice system

#### Technical Improvements
- Added `@ricky0123/vad-web` dependency for Silero VAD functionality
- Created `useSileroVAD` hook with configurable parameters:
  - `positiveSpeechThreshold`: Threshold for detecting speech (default: 0.5)
  - `negativeSpeechThreshold`: Threshold for detecting silence (default: 0.3)
  - `minSpeechFrames`: Minimum frames to consider as speech (default: 3)
  - `preSpeechPadFrames`: Frames to include before speech starts (default: 8)
- Proper cleanup and resource management for VAD instances
- TypeScript support with proper error handling

### Voice System Refactoring - 2025-08-06

#### Changed
- **useWebSocketVoice Hook Refactoring**:
  - Removed legacy `sendAudioChunk` function (was redundant wrapper)
  - Renamed `handleAudioChunk` to `onAudioChunk` for consistency
  - Renamed `handleTurnComplete` to `onTurnComplete` for consistency
  - Simplified public interface to only export necessary functions and state
  - Clean API now provides:
    - State: `session`, `isConnected`, `isProcessing`, `error`, `transcript`, `audioQueue`
    - Control Functions: `startSession`, `stopSession`, `sendMessage`, `playNextAudio`
    - Voice Recorder Callbacks: `onAudioChunk`, `onTurnComplete`

#### Voice Activity Detection (VAD) Improvements
- **Optimized silence detection parameters**:
  - Lowered silence threshold from 700ms to 500ms for better responsiveness
  - Reduced voice detection threshold from 0.005 to 0.002 for improved sensitivity
  - Added comprehensive debug logging for VAD decisions
  - Now properly sends TURN_COMPLETE signal when user stops speaking

#### Voice Recorder Integration Contract
- Established clear contract between `useVoiceRecorder` and `useWebSocketVoice`:
  - `onAudioChunk`: Called when voice recorder has audio data to send
  - `onTurnComplete`: Called when silence is detected (user finished speaking)
  - Ready for seamless integration in VoiceInput component

### Previous Updates

#### Admin Dashboard Enhancements
- Added comprehensive admin dashboard with analytics and controls
- Implemented Fly.io cost monitoring and controls
- Added WebSocket server management interface
- Created admin authentication system

#### Voice Communication System
- Implemented real-time voice communication with Gemini
- Added WebSocket-based audio streaming
- Created voice recorder hook with VAD (Voice Activity Detection)
- Integrated audio playback system for AI responses

#### Database Optimizations
- Comprehensive Supabase database optimization
- Added performance monitoring and indexes
- Implemented RLS policies for security
- Created migration scripts for deployment

#### Security Improvements
- Enhanced environment variable management
- Added security headers and CSP policies
- Implemented proper authentication flows
- Secured API endpoints with validation

#### UI/UX Improvements
- Redesigned chat interface with modern aesthetics
- Added AI thinking indicators and animations
- Improved mobile responsiveness
- Enhanced accessibility features

#### Brand Migration
- Updated all branding elements to FB-c Lab
- Migrated icons and logos throughout the application
- Updated PDF generation with new branding
- Consistent brand colors and typography

## [1.0.0] - Initial Release

### Added
- Core chat functionality with AI integration
- Lead generation and management system
- Document and image analysis capabilities
- Multi-modal AI interactions
- Real-time activity tracking
- Educational content system
- Workshop and consulting pages
- Comprehensive testing suite
