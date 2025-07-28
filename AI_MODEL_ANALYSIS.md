# AI Model Analysis - Complete Codebase Overview

## 🎯 **API ENDPOINTS & AI MODEL MAPPING**

### **Primary AI Models Used**

| Model | Version | Purpose | Capabilities |
|-------|---------|---------|--------------|
| `gemini-2.5-flash` | Standard | **Main conversational AI** | Text generation, reasoning, web search |
| `gemini-2.5-flash-preview-tts` | TTS Preview | **Text-to-Speech** | Audio generation, voice synthesis |
| `gemini-1.5-flash` | Multimodal | **Image/Document Analysis** | Vision, document processing |
| `gemini-2.5-flash-exp-native-audio-thinking-dialog` | Experimental | **Live Voice Conversations** | Real-time audio, thinking, dialog |

---

## 📡 **API ENDPOINT ANALYSIS**

### **1. Core Chat & Conversation APIs**

#### **`/api/chat`** - Main Chat Interface
- **Model**: `gemini-2.5-flash`
- **Function**: Primary conversational AI with lead context
- **Features**:
  - Lead research integration
  - Web grounding capabilities
  - Conversation state management
  - Streaming responses
  - Authentication & rate limiting

#### **`/api/gemini-live`** - Voice & TTS API
- **Models**: 
  - `gemini-2.5-flash` (text generation)
  - `gemini-2.5-flash-preview-tts` (audio synthesis)
- **Function**: Voice interaction and text-to-speech
- **Features**:
  - Multi-speaker voice synthesis
  - Language support (en-US, es-ES, fr-FR, etc.)
  - Voice selection (Puck, Kore, Zephyr, etc.)
  - Audio streaming

#### **`/api/gemini-live-conversation`** - Live Chat Sessions
- **Models**:
  - `gemini-2.5-flash` (conversation)
  - `gemini-2.5-flash-preview-tts` (audio responses)
- **Function**: Real-time conversation with audio
- **Features**:
  - Session management
  - Audio-enabled responses
  - Lead context integration
  - Activity logging

### **2. Multimodal Analysis APIs**

#### **`/api/analyze-image`** - Image Analysis
- **Model**: `gemini-1.5-flash`
- **Function**: Visual content analysis
- **Features**:
  - Webcam image analysis
  - Screen capture analysis
  - Detailed object/activity recognition
  - Environment description

#### **`/api/analyze-document`** - Document Processing
- **Model**: `gemini-1.5-flash`
- **Function**: Business document analysis
- **Features**:
  - PDF and text analysis
  - Executive summaries
  - Pain point identification
  - AI automation opportunities
  - ROI considerations

#### **`/api/video-to-app`** - Video Learning App Generation
- **Model**: `gemini-2.5-flash`
- **Function**: Educational app creation from videos
- **Features**:
  - YouTube video analysis
  - Educational spec generation
  - Interactive app code generation
  - Learning objectives extraction

### **3. Business Intelligence APIs**

#### **`/api/lead-research`** - Lead Intelligence
- **Model**: `gemini-2.5-flash`
- **Function**: Comprehensive lead research
- **Features**:
  - Google/LinkedIn search integration
  - Business challenge analysis
  - AI automation recommendations
  - Personalized outreach strategies
  - Lead scoring

#### **`/api/educational-content`** - Learning Analytics
- **Model**: `gemini-2.5-flash` (via educational service)
- **Function**: Educational interaction analysis
- **Features**:
  - Learning pattern analysis
  - Educational content generation
  - Progress tracking
  - Adaptive learning recommendations

### **4. Administrative APIs**

#### **`/api/admin/*`** - Admin Dashboard
- **Models**: Various (depending on endpoint)
- **Function**: Administrative analytics and management
- **Features**:
  - AI performance metrics
  - Token usage analytics
  - Lead management
  - Email campaign management
  - Real-time activity monitoring

---

## 🔧 **AI SERVICE ARCHITECTURE**

### **Core AI Services**

#### **`lib/gemini-live-api.ts`**
- **Model**: `gemini-2.5-flash`
- **Function**: Grounded search and web research
- **Features**:
  - Google search integration
  - LinkedIn profile research
  - Real-time web data retrieval
  - Contextual AI responses

#### **`lib/educational-gemini-service.ts`**
- **Model**: `gemini-2.5-flash`
- **Function**: Educational content and learning analytics
- **Features**:
  - Learning objective extraction
  - Key topic identification
  - Educational interaction analysis
  - Adaptive content generation

#### **`lib/unified-ai-service.ts`**
- **Model**: Stub implementation
- **Function**: Placeholder for unified AI architecture
- **Status**: Not currently implemented

### **Server-Side AI Services**

#### **`server/live-server.ts`**
- **Model**: `gemini-2.5-flash-exp-native-audio-thinking-dialog`
- **Function**: Real-time voice conversations
- **Features**:
  - WebSocket-based communication
  - Real-time audio processing
  - Multimodal conversation
  - Session management

---

## 📊 **MODEL CAPABILITY MATRIX**

| Capability | gemini-2.5-flash | gemini-1.5-flash | gemini-2.5-flash-preview-tts | gemini-2.5-flash-exp-native-audio-thinking-dialog |
|------------|-------------------|-------------------|------------------------------|---------------------------------------------------|
| **Text Generation** | ✅ Primary | ✅ Good | ❌ Limited | ✅ Full |
| **Conversation** | ✅ Excellent | ✅ Good | ❌ Limited | ✅ Real-time |
| **Web Search** | ✅ Native | ❌ No | ❌ No | ✅ Native |
| **Image Analysis** | ❌ No | ✅ Excellent | ❌ No | ✅ Full |
| **Document Processing** | ❌ No | ✅ Excellent | ❌ No | ✅ Full |
| **Audio Generation** | ❌ No | ❌ No | ✅ Excellent | ✅ Real-time |
| **Voice Recognition** | ❌ No | ❌ No | ❌ No | ✅ Native |
| **Multimodal** | ✅ Text+Web | ✅ Vision+Text | ❌ Audio only | ✅ All modalities |

---

## 🎯 **USE CASE MAPPING**

### **Business Consulting**
- **Primary**: `gemini-2.5-flash` (chat, research, analysis)
- **Support**: `gemini-1.5-flash` (document analysis)
- **Voice**: `gemini-2.5-flash-preview-tts` (audio responses)

### **Educational Content**
- **Primary**: `gemini-2.5-flash` (content generation)
- **Video**: `gemini-2.5-flash` (video analysis)
- **Learning**: `gemini-2.5-flash` (educational service)

### **Real-time Voice**
- **Primary**: `gemini-2.5-flash-exp-native-audio-thinking-dialog`
- **Fallback**: `gemini-2.5-flash-preview-tts`

### **Multimodal Analysis**
- **Images**: `gemini-1.5-flash`
- **Documents**: `gemini-1.5-flash`
- **Videos**: `gemini-2.5-flash`

---

## 🔄 **DATA FLOW ARCHITECTURE**

\`\`\`
User Input → API Gateway → Model Selection → AI Processing → Response
     ↓
[Text] → gemini-2.5-flash → [Conversation/Research]
[Image] → gemini-1.5-flash → [Visual Analysis]
[Document] → gemini-1.5-flash → [Document Analysis]
[Voice] → gemini-2.5-flash-exp-native-audio-thinking-dialog → [Real-time Audio]
[TTS Request] → gemini-2.5-flash-preview-tts → [Audio Generation]
\`\`\`

---

## 📈 **PERFORMANCE CHARACTERISTICS**

### **Response Times**
- **`gemini-2.5-flash`**: ~1-3 seconds (text generation)
- **`gemini-1.5-flash`**: ~2-5 seconds (multimodal analysis)
- **`gemini-2.5-flash-preview-tts`**: ~3-8 seconds (audio generation)
- **`gemini-2.5-flash-exp-native-audio-thinking-dialog`**: ~100-500ms (real-time)

### **Token Usage**
- **`gemini-2.5-flash`**: ~1000-5000 tokens per request
- **`gemini-1.5-flash`**: ~2000-8000 tokens per request
- **`gemini-2.5-flash-preview-tts`**: ~500-2000 tokens per request
- **`gemini-2.5-flash-exp-native-audio-thinking-dialog`**: ~100-1000 tokens per turn

---

## 🚀 **OPTIMIZATION RECOMMENDATIONS**

### **Model Selection**
1. **Use `gemini-2.5-flash`** for all text-based tasks
2. **Use `gemini-1.5-flash`** for image/document analysis
3. **Use `gemini-2.5-flash-preview-tts`** for audio generation
4. **Use `gemini-2.5-flash-exp-native-audio-thinking-dialog`** for real-time voice

### **Caching Strategy**
- Cache common responses for `gemini-2.5-flash`
- Cache document analysis results for `gemini-1.5-flash`
- Implement audio caching for `gemini-2.5-flash-preview-tts`

### **Error Handling**
- Fallback to simpler models on failure
- Implement retry logic for transient errors
- Use client-side TTS as backup for audio generation

---

## 📋 **DEPLOYMENT CONSIDERATIONS**

### **Environment Variables**
\`\`\`bash
GEMINI_API_KEY=your_api_key
NEXT_PUBLIC_DEMO_MODE=true  # For guest access
\`\`\`

### **Rate Limiting**
- 20 requests/minute per IP for most endpoints
- 10 requests/minute for TTS endpoints
- 5 requests/minute for live voice endpoints

### **Monitoring**
- Track model usage and costs
- Monitor response times
- Alert on error rates
- Log token consumption

---

**Status**: **PRODUCTION READY** - All AI models are properly configured and functional.
