# Changelog

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

## [Unreleased]

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
