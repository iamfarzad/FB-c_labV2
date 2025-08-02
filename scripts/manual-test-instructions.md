# Manual Testing Instructions for Lead Generation System

## Test Overview
The lead generation system has been implemented with the following features:
- 7-stage conversation flow
- Real-time progress tracking
- Enhanced NLP extraction
- Automatic lead research

## How to Test

### 1. Start the Development Server
```bash
pnpm dev
```

### 2. Open the Chat Interface
Navigate to: http://localhost:3000/chat

### 3. Test the Conversation Flow

#### Stage 1: Greeting
- Send: "Hello"
- Expected: Welcome message asking for your name
- Progress: Should show Stage 1/7 in the progress indicator

#### Stage 2: Name Collection  
- Send: "My name is John Smith"
- Expected: Greeting with name, asking for email
- Progress: Should advance to Stage 2/7

#### Stage 3: Email Capture
- Send: "john.smith@techcorp.com"
- Expected: Thank you message, mentioning company research
- Progress: Should advance to Stage 3/7

#### Stage 4: Background Research
- The system should automatically trigger research
- Expected: Message about researching your company

#### Stage 5: Problem Discovery
- Send: "We struggle with manual data processing and repetitive tasks"
- Expected: Acknowledgment of pain points, solution suggestions
- Progress: Should advance to Stage 5/7

#### Stage 6: Solution Presentation
- The AI should present relevant solutions
- Progress: Should advance to Stage 6/7

#### Stage 7: Call to Action
- The AI should offer next steps (workshop/consulting)
- Progress: Should reach Stage 7/7

### 4. Verify UI Features

#### Desktop View
- LeadProgressIndicator should appear on the right sidebar
- Shows current stage with visual progress
- Displays collected lead data (name, email, company)

#### Mobile View
- Click the "Progress" button at bottom right
- Should open a sheet with the progress indicator

### 5. Check API Responses

Open browser DevTools Network tab:
- Chat API calls should return streaming responses
- Look for `conversationStage` and `leadData` in the response

## Known Issues

1. **Supabase Dependency**: The full conversation state management requires Supabase environment variables
2. **Google Search API**: Lead research requires Google API configuration
3. **Email Follow-up**: Not yet connected to email service

## What's Working

✅ Chat API responds to messages
✅ UI components are integrated
✅ Progress tracking UI updates
✅ NLP extraction for names/emails
✅ Stage validation logic

## What Needs Environment Setup

⚠️ Full conversation state persistence (needs Supabase)
⚠️ Company research data (needs Google Search API)
⚠️ Email automation (needs email service)

## Summary

The core functionality is implemented and the UI is ready. The system needs proper environment configuration for full functionality.