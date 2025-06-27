# Video to Learning App Integration

## Overview
The Video2App feature allows users to generate interactive learning applications from YouTube videos directly within the chat interface.

## User Flow

1. **YouTube URL Detection**
   - User pastes a YouTube URL in the chat
   - System automatically detects the URL
   - VideoToApp component appears below the chat

2. **Video Analysis**
   - Click "Generate app" to start
   - System validates the YouTube URL
   - Shows video preview using YouTube embed

3. **App Generation Process**
   - **Step 1: Generate Spec** - AI analyzes video content and creates a detailed specification
   - **Step 2: Generate Code** - AI converts the spec into a working HTML application
   - Progress indicators show current status

4. **Interactive Results**
   - **Render Tab**: Live preview of the generated app
   - **Code Tab**: Full HTML source code
   - **Spec Tab**: Editable specification

5. **Customization**
   - Edit the spec and regenerate code
   - Modify code directly (changes reflect immediately)
   - Copy code for external use

## Technical Implementation

### Components
- `VideoToApp.tsx` - Main component with full video2app functionality
- Integrated with chat context for activity logging
- Uses Gemini AI for content generation

### API Endpoints
- `/api/gemini?action=generateSpec` - Generates learning app specification from video
- `/api/gemini?action=generateCode` - Converts spec to HTML code

### Features
- Real-time progress tracking
- Error handling and validation
- Responsive design
- Activity logging integration
- Seamless chat integration

## Example Use Cases
1. Educational content transformation
2. Tutorial enhancement
3. Interactive documentation
4. Training material generation
5. Concept demonstration apps

## Configuration
The feature works out of the box with:
- Gemini API key configured
- YouTube URL validation
- Automatic detection in chat messages 