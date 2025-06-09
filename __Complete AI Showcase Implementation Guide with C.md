<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# **Complete AI Showcase Implementation Guide with Code Examples**

Based on your Google AI for Developers capabilities and our entire conversation, here's the comprehensive implementation checklist with all code examples:

## **1. System Architecture \& Environment Setup**

### **Environment Variables**

```bash
# Core AI APIs
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Database & Real-time
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional External CRM
HUBSPOT_API_KEY=your_hubspot_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Voice Configuration
ELEVENLABS_VOICE_ID=your_cloned_voice_id
ELEVENLABS_MODEL=eleven_turbo_v2_5
```


### **Package Dependencies**

```bash
npm install @google/genai @supabase/supabase-js elevenlabs
npm install @vercel/blob nodemailer jspdf html2pdf.js
npm install react-webcam react-screen-capture
```


## **2. Enhanced Gemini API Handler (Complete Implementation)**

```typescript
// /api/gemini.ts - Complete enhanced version
import { GoogleGenAI } from "@google/genai"
import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from "@vercel/node"

interface ProxyRequestBody {
  prompt?: string
  model?: string
  conversationHistory?: any[]
  conversationState?: any
  userInfo?: any
  action?: string
  imageData?: string
  videoUrl?: string
  audioData?: string
  documentData?: string
  urlContext?: string
  includeAudio?: boolean
  sessionId?: string
  messageCount?: number
  [key: string]: any
}

interface ProxyResponse {
  success: boolean
  data?: any
  error?: string
  status?: number
  usage?: {
    inputTokens: number
    outputTokens: number
    cost: number
  }
}

let genAIInstance: GoogleGenAI | null = null

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.")
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({
      apiKey: apiKey,
    })
  }
  return genAIInstance
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Usage limits for showcase
const AI_USAGE_LIMITS = {
  maxMessagesPerSession: 15,
  maxImageGeneration: 2,
  maxVideoAnalysis: 1,
  maxCodeExecution: 3,
  maxDocumentAnalysis: 2
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = inputTokens * 0.000001
  const outputCost = outputTokens * 0.000002
  return inputCost + outputCost
}

// Enhanced conversational flow handler
async function handleConversationalFlow(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { 
      prompt, 
      conversationState = { stage: 'greeting' }, 
      userInfo = {},
      messageCount = 0,
      includeAudio = true
    } = body

    if (!prompt) {
      return { success: false, error: "No prompt provided", status: 400 }
    }

    // Enforce usage limits
    if (messageCount >= AI_USAGE_LIMITS.maxMessagesPerSession) {
      return {
        success: true,
        data: {
          text: "This AI showcase has reached its demonstration limit. Ready to see the full capabilities in action? Let's schedule your consultation!",
          isLimitReached: true,
          showBooking: true
        }
      }
    }

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      tools: [{ googleSearchRetrieval: {} }]
    })

    // Enhanced system instruction
    const systemInstruction = `You are the F.B/c AI Assistant showcasing advanced AI capabilities for lead generation.

SHOWCASE ALL CAPABILITIES NATURALLY:
- Text generation with personalization
- Real-time Google Search for company intelligence  
- Structured output for organized responses
- Thinking process transparency
- Function calling for dynamic actions

CONVERSATION FLOW:
Stage: ${conversationState.stage}
User Info: ${JSON.stringify(userInfo)}

Be engaging, demonstrate AI intelligence, and guide toward consultation booking.
Use their name frequently and show company insights when available.`

    // Enhance prompt based on conversation stage
    let enhancedPrompt = prompt
    let sidebarActivity = ""

    if (conversationState.stage === 'email_collected' && userInfo.email) {
      const domain = userInfo.email.split('@')[^1]
      enhancedPrompt = `User provided email: ${userInfo.email}. 
      Analyze company domain "${domain}" and create a response that:
      1. Shows you're analyzing their company background
      2. Provides relevant industry insights from search
      3. Asks about their main business challenge
      
      User message: "${prompt}"`
      sidebarActivity = "company_analysis"
    }

    // Generate response with enhanced context
    const result = await model.generateContent([
      { text: systemInstruction },
      { text: enhancedPrompt }
    ])

    const response = result.response
    const text = response.text()

    // Extract grounding sources
    const sources = response.candidates?.[^0]?.groundingMetadata?.groundingChunks
      ?.map(chunk => ({
        title: chunk.web?.title || 'Web Source',
        url: chunk.web?.uri || '#',
        snippet: chunk.web?.title || 'Grounded search result'
      })) || []

    // Generate voice response if requested
    let audioData = null
    if (includeAudio && text) {
      try {
        audioData = await generateVoiceWithElevenLabs(text)
        sidebarActivity = "voice_generation"
      } catch (error) {
        console.log("Voice generation failed, continuing without audio")
      }
    }

    // Broadcast real-time updates via Supabase
    const supabase = getSupabase()
    await supabase.channel('ai-showcase')
      .send({
        type: 'broadcast',
        event: 'ai-response',
        payload: {
          text,
          audioData: audioData?.audioBase64,
          sources,
          sidebarActivity,
          conversationState: determineNextStage(conversationState, prompt, userInfo),
          timestamp: Date.now()
        }
      })

    const inputTokens = estimateTokens(enhancedPrompt)
    const outputTokens = estimateTokens(text)
    const cost = estimateCost(inputTokens, outputTokens)

    return {
      success: true,
      data: { 
        text,
        sources,
        audioData: audioData?.audioBase64,
        audioMimeType: 'audio/mpeg',
        sidebarActivity,
        conversationState: determineNextStage(conversationState, prompt, userInfo)
      },
      usage: { inputTokens, outputTokens, cost }
    }
  } catch (error: any) {
    console.error("Error in handleConversationalFlow:", error)
    return {
      success: false,
      error: error.message || "Failed to process conversation",
      status: 500
    }
  }
}

// ElevenLabs voice generation
async function generateVoiceWithElevenLabs(text: string): Promise<{ audioBase64: string }> {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00tcm4tlvdq8ikwam'
  
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ElevenLabs API key not configured")
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.8,
        similarity_boost: 0.9,
        style: 0.4,
        use_speaker_boost: true
      }
    })
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`)
  }

  const audioBuffer = await response.arrayBuffer()
  const audioBase64 = Buffer.from(audioBuffer).toString('base64')
  
  return { audioBase64 }
}

// Image generation showcase
async function handleImageGeneration(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { prompt, conversationContext } = body

    if (!prompt) {
      return { success: false, error: "No prompt provided for image generation", status: 400 }
    }

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const enhancedPrompt = `Create a detailed visual description for business concept: "${prompt}"
    
    Context: ${conversationContext || 'General business visualization'}
    
    Describe the scene with:
    - Professional business setting
    - Clear visual metaphors for AI/technology
    - Corporate color scheme
    - Specific elements that would resonate with business decision makers
    
    This will be used to create an actual business visualization.`

    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    const text = response.text()

    // Broadcast sidebar update
    const supabase = getSupabase()
    await supabase.channel('ai-showcase')
      .send({
        type: 'broadcast',
        event: 'sidebar-update',
        payload: {
          activity: 'image_generation',
          message: '🎨 Generating business visualization...',
          timestamp: Date.now()
        }
      })

    return {
      success: true,
      data: {
        text: `Generated business visualization concept: "${prompt}"`,
        description: text,
        note: "Image generation description created for business presentation",
        sidebarActivity: "image_generation"
      }
    }
  } catch (error: any) {
    console.error("Error in handleImageGeneration:", error)
    return {
      success: false,
      error: error.message || "Failed to generate image description",
      status: 500
    }
  }
}

// Video analysis showcase
async function handleVideoAnalysis(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { 
      videoUrl, 
      prompt = "Analyze this video for business insights", 
      analysisType = "summary" 
    } = body

    if (!videoUrl) {
      return { success: false, error: "No video URL provided", status: 400 }
    }

    const genAI = getGenAI()

    // Create analysis-specific prompts
    let analysisPrompt = prompt
    switch (analysisType) {
      case "business_insights":
        analysisPrompt = `Analyze this business video and extract:
        1. Key business concepts discussed
        2. Potential automation opportunities
        3. AI implementation suggestions
        4. ROI considerations
        
        Video context: ${prompt}`
        break
      case "competitive_analysis":
        analysisPrompt = `Analyze this video for competitive intelligence:
        1. Business strategies mentioned
        2. Technology stack insights
        3. Market positioning
        4. Opportunities for improvement
        
        Video context: ${prompt}`
        break
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: "video/*",
                fileUri: videoUrl
              }
            },
            { text: analysisPrompt }
          ]
        }
      ]
    })

    const response = result.response
    const text = response.text()

    // Broadcast sidebar update
    const supabase = getSupabase()
    await supabase.channel('ai-showcase')
      .send({
        type: 'broadcast',
        event: 'sidebar-update',
        payload: {
          activity: 'video_analysis',
          message: '🎥 Analyzing video content for business insights...',
          timestamp: Date.now()
        }
      })

    return {
      success: true,
      data: {
        text,
        videoUrl,
        analysisType,
        sidebarActivity: "video_analysis"
      }
    }
  } catch (error: any) {
    console.error("Error in handleVideoAnalysis:", error)
    return {
      success: false,
      error: error.message || "Failed to analyze video",
      status: 500
    }
  }
}

// Document understanding showcase
async function handleDocumentAnalysis(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { documentData, mimeType, prompt = "Analyze this document for business insights" } = body

    if (!documentData) {
      return { success: false, error: "No document data provided", status: 400 }
    }

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const businessAnalysisPrompt = `Analyze this business document and provide:
    1. **Executive Summary**: Key points in 2-3 sentences
    2. **Business Opportunities**: Areas where AI could help
    3. **Process Improvements**: Workflow optimizations possible
    4. **ROI Potential**: Quantifiable benefits
    5. **Implementation Roadmap**: Practical next steps
    
    Original request: ${prompt}`

    const documentPart = {
      inlineData: {
        data: documentData,
        mimeType: mimeType || "application/pdf"
      }
    }

    const result = await model.generateContent([businessAnalysisPrompt, documentPart])
    const response = await result.response
    const text = response.text()

    // Broadcast sidebar update
    const supabase = getSupabase()
    await supabase.channel('ai-showcase')
      .send({
        type: 'broadcast',
        event: 'sidebar-update',
        payload: {
          activity: 'document_analysis',
          message: '📄 Processing business document...',
          timestamp: Date.now()
        }
      })

    const inputTokens = estimateTokens(prompt)
    const outputTokens = estimateTokens(text)
    const cost = estimateCost(inputTokens, outputTokens)

    return {
      success: true,
      data: { 
        text,
        sidebarActivity: "document_analysis"
      },
      usage: { inputTokens, outputTokens, cost }
    }
  } catch (error: any) {
    console.error("Error in handleDocumentAnalysis:", error)
    return {
      success: false,
      error: error.message || "Failed to analyze document",
      status: 500
    }
  }
}

// Code execution showcase
async function handleCodeExecution(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { prompt, businessContext } = body

    if (!prompt) {
      return { success: false, error: "No code execution prompt provided", status: 400 }
    }

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      tools: [{ codeExecution: {} }]
    })

    const codePrompt = `Create and execute code to solve this business problem: "${prompt}"

    Business context: ${businessContext || 'General business calculation'}
    
    Requirements:
    1. Write practical, business-relevant code
    2. Execute the code and show results
    3. Explain the business value
    4. Suggest how this could be automated in their workflow
    
    Focus on demonstrating how AI can solve real business problems with code.`

    const result = await model.generateContent(codePrompt)
    const response = await result.response
    const text = response.text()

    // Broadcast sidebar update
    const supabase = getSupabase()
    await supabase.channel('ai-showcase')
      .send({
        type: 'broadcast',
        event: 'sidebar-update',
        payload: {
          activity: 'code_execution',
          message: '⚡ Executing business calculations...',
          timestamp: Date.now()
        }
      })

    return {
      success: true,
      data: {
        text,
        sidebarActivity: "code_execution",
        note: "Live code execution for business problem solving"
      }
    }
  } catch (error: any) {
    console.error("Error in handleCodeExecution:", error)
    return {
      success: false,
      error: error.message || "Failed to execute code",
      status: 500
    }
  }
}

// URL context analysis
async function handleURLAnalysis(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { urlContext, analysisType = "business_analysis" } = body

    if (!urlContext) {
      return { success: false, error: "No URL provided", status: 400 }
    }

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      tools: [{ googleSearchRetrieval: {} }]
    })

    const urlAnalysisPrompt = `Analyze this website: ${urlContext}

    Provide business intelligence analysis:
    1. **Company Overview**: What do they do, their market position
    2. **Technology Stack**: Visible technologies and tools
    3. **AI Opportunities**: Where AI could improve their operations
    4. **Competitive Advantages**: What they do well
    5. **Improvement Areas**: Potential optimization opportunities
    6. **AI Implementation Roadmap**: Specific recommendations
    
    Focus on actionable insights for business improvement.`

    const result = await model.generateContent(urlAnalysisPrompt)
    const response = await result.response
    const text = response.text()

    // Broadcast sidebar update
    const supabase = getSupabase()
    await supabase.channel('ai-showcase')
      .send({
        type: 'broadcast',
        event: 'sidebar-update',
        payload: {
          activity: 'url_analysis',
          message: '🌐 Analyzing website for business intelligence...',
          timestamp: Date.now()
        }
      })

    return {
      success: true,
      data: {
        text,
        urlContext,
        sidebarActivity: "url_analysis"
      }
    }
  } catch (error: any) {
    console.error("Error in handleURLAnalysis:", error)
    return {
      success: false,
      error: error.message || "Failed to analyze URL",
      status: 500
    }
  }
}

// Lead capture and summary generation
async function handleLeadCapture(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { 
      conversationHistory, 
      userInfo,
      action = 'generate_summary'
    } = body

    if (!conversationHistory || !userInfo?.name || !userInfo?.email) {
      return { 
        success: false, 
        error: "Missing required lead information", 
        status: 400 
      }
    }

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    switch (action) {
      case 'generate_summary':
        const summaryPrompt = `Create a comprehensive F.B/c AI consultation summary for ${userInfo.name}.

        **AI CAPABILITIES DEMONSTRATED:**
        - Real-time conversation intelligence
        - Company research and analysis
        - Multimodal content processing
        - Voice generation and interaction
        - Business process optimization
        - Custom solution development

        **CONVERSATION ANALYSIS:**
        ${JSON.stringify(conversationHistory)}

        **CREATE STRUCTURED SUMMARY:**
        1. **Executive Summary**: Key business insights discovered
        2. **AI Capabilities Showcased**: Specific features demonstrated
        3. **Business Opportunities**: How AI can help ${userInfo.companyInfo?.name || 'their company'}
        4. **Recommended Solutions**: Training vs consulting recommendation
        5. **Implementation Roadmap**: Practical next steps
        6. **ROI Projections**: Expected business value
        7. **Next Steps**: Clear call-to-action for consultation

        Make it professional, actionable, and compelling for ${userInfo.name}.`

        const summaryResult = await model.generateContent(summaryPrompt)
        const summary = summaryResult.response.text()

        // Generate consultant brief
        const briefPrompt = `Create a detailed consultant brief for Farzad's follow-up with ${userInfo.name}.

        **LEAD QUALIFICATION BRIEF**
        
        **Contact Information:**
        - Name: ${userInfo.name}
        - Email: ${userInfo.email}
        - Company: ${userInfo.companyInfo?.name || 'Unknown'}
        - Industry: ${userInfo.companyInfo?.industry || 'Unknown'}

        **AI SHOWCASE RESULTS:**
        Analyze what AI capabilities resonated most with this prospect.

        **BUSINESS INTELLIGENCE:**
        1. **Primary Pain Points**: Specific challenges they expressed
        2. **AI Readiness Level**: How sophisticated are they with technology?
        3. **Decision Authority**: Are they a decision maker or influencer?
        4. **Budget Indicators**: Any signals about investment capacity?
        5. **Urgency Level**: How urgent is their need for AI solutions?
        6. **Service Fit Analysis**: Training workshop vs consulting engagement?

        **FOLLOW-UP STRATEGY:**
        - Key talking points for consultation call
        - Specific case studies to reference
        - Recommended solution approach
        - Pricing strategy considerations

        **CONVERSATION INSIGHTS:**
        ${JSON.stringify(conversationHistory)}

        Provide actionable intelligence for converting this lead.`

        const briefResult = await model.generateContent(briefPrompt)
        const brief = briefResult.response.text()

        // Store in Supabase
        const supabase = getSupabase()
        const leadScore = calculateLeadScore(conversationHistory, userInfo)

        const { data: leadData, error } = await supabase
          .from('lead_summaries')
          .insert({
            name: userInfo.name,
            email: userInfo.email,
            company_name: userInfo.companyInfo?.name,
            conversation_summary: summary,
            consultant_brief: brief,
            lead_score: leadScore,
            ai_capabilities_shown: extractCapabilitiesShown(conversationHistory)
          })
          .select()

        if (error) {
          throw new Error(`Failed to store lead: ${error.message}`)
        }

        return {
          success: true,
          data: { 
            summary,
            brief,
            leadScore,
            emailContent: generateEmailContent(userInfo.name, userInfo.email, summary),
            leadId: leadData[^0]?.id
          }
        }

      default:
        return {
          success: true,
          data: { 
            message: "Lead data processed",
            leadScore: calculateLeadScore(conversationHistory, userInfo)
          }
        }
    }
  } catch (error: any) {
    console.error("Error in handleLeadCapture:", error)
    return {
      success: false,
      error: error.message || "Failed to process lead capture",
      status: 500
    }
  }
}

// Helper functions
function determineNextStage(currentState: any, userMessage: string, userInfo: any) {
  const { stage } = currentState
  
  switch (stage) {
    case 'greeting':
      if (userMessage.length > 0 && !userMessage.includes('@')) {
        return { ...currentState, stage: 'email_request' }
      }
      break
    case 'email_request':
      if (userMessage.includes('@')) {
        return { ...currentState, stage: 'email_collected' }
      }
      break
    case 'email_collected':
      return { ...currentState, stage: 'discovery' }
    case 'discovery':
      return { ...currentState, stage: 'capability_showcase' }
    case 'capability_showcase':
      if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('solution')) {
        return { ...currentState, stage: 'solution_positioning' }
      }
      break
    case 'solution_positioning':
      return { ...currentState, stage: 'summary_generation' }
  }
  
  return currentState
}

function calculateLeadScore(conversationHistory: any[], userInfo: any): number {
  let score = 0
  
  // Company email (not generic) +20
  const domain = userInfo.email?.split('@')[^1] || ''
  if (!['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
    score += 20
  }
  
  // Conversation engagement +10
  if (conversationHistory.length > 8) {
    score += 10
  }
  
  // Business terms mentioned +15
  const conversationText = JSON.stringify(conversationHistory).toLowerCase()
  if (conversationText.includes('automation') || 
      conversationText.includes('efficiency') || 
      conversationText.includes('ai') ||
      conversationText.includes('team') ||
      conversationText.includes('process')) {
    score += 15
  }
  
  // Pricing/timeline questions +25
  if (conversationText.includes('cost') || 
      conversationText.includes('price') || 
      conversationText.includes('when') ||
      conversationText.includes('timeline') ||
      conversationText.includes('budget')) {
    score += 25
  }
  
  // Multiple AI capabilities requested +20
  const capabilityKeywords = ['image', 'video', 'document', 'analyze', 'generate', 'code']
  const capabilityMentions = capabilityKeywords.filter(keyword => 
    conversationText.includes(keyword)
  ).length
  
  if (capabilityMentions >= 3) {
    score += 20
  }
  
  return Math.min(score, 100)
}

function extractCapabilitiesShown(conversationHistory: any[]): string[] {
  const capabilities = []
  const conversationText = JSON.stringify(conversationHistory).toLowerCase()
  
  if (conversationText.includes('searching') || conversationText.includes('grounding')) {
    capabilities.push('Google Search Integration')
  }
  if (conversationText.includes('voice') || conversationText.includes('audio')) {
    capabilities.push('Voice Generation')
  }
  if (conversationText.includes('image') || conversationText.includes('visual')) {
    capabilities.push('Image Analysis/Generation')
  }
  if (conversationText.includes('video')) {
    capabilities.push('Video Understanding')
  }
  if (conversationText.includes('document') || conversationText.includes('pdf')) {
    capabilities.push('Document Processing')
  }
  if (conversationText.includes('code') || conversationText.includes('calculation')) {
    capabilities.push('Code Execution')
  }
  if (conversationText.includes('website') || conversationText.includes('url')) {
    capabilities.push('URL Analysis')
  }
  
  return capabilities
}

function generateEmailContent(name: string, email: string, summary: string): string {
  return `Hi ${name},

Thank you for experiencing F.B/c's AI showcase! I'm excited about the potential I see for your business.

**Your Personalized AI Consultation Summary**

${summary}

**What's Next?**

I'd love to dive deeper into how we can implement these AI solutions in your business. 

🎯 **For Team Training**: Our interactive AI workshops get your employees up to speed with practical, hands-on learning
🚀 **For Custom Implementation**: We build and deploy AI solutions tailored to your specific needs

📅 **Book Your Free Strategy Session**
Let's discuss your specific requirements and create a custom roadmap: [CALENDAR_LINK]

**Why F.B/c?**
- Proven AI implementation experience
- Industry-specific expertise
- Hands-on training approach
- Measurable ROI focus

Best regards,
Farzad Bayat
Founder, F.B/c AI Consulting
bayatfarzad@gmail.com

P.S. The AI capabilities you experienced today are just the beginning. Imagine what your team could accomplish with these tools at their disposal! 🚀

---
This summary was generated using the same AI technology we can implement for your business.`
}

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  try {
    const action = req.query.action as string
    const body: ProxyRequestBody = req.body || {}

    let result: ProxyResponse

    switch (action) {
      case "conversationalFlow":
        result = await handleConversationalFlow(body)
        break
      case "generateImage":
        result = await handleImageGeneration(body)
        break
      case "analyzeVideo":
        result = await handleVideoAnalysis(body)
        break
      case "analyzeDocument":
        result = await handleDocumentAnalysis(body)
        break
      case "executeCode":
        result = await handleCodeExecution(body)
        break
      case "analyzeURL":
        result = await handleURLAnalysis(body)
        break
      case "leadCapture":
        result = await handleLeadCapture(body)
        break
      case "health":
        result = { success: true, data: { status: "healthy", capabilities: "all_gemini_features_active" } }
        break
      default:
        result = await handleConversationalFlow(body)
        break
    }

    if (result.success) {
      return res.status(result.status || 200).json(result)
    } else {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error || "An unknown server error occurred.",
      })
    }
  } catch (error: any) {
    console.error("Proxy handler error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    })
  }
}
```


## **3. Database Schema (Supabase)**

```sql
-- Lead summaries table (minimal storage)
CREATE TABLE lead_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  conversation_summary TEXT NOT NULL,
  consultant_brief TEXT NOT NULL,
  lead_score INTEGER DEFAULT 0,
  ai_capabilities_shown TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE lead_summaries;

-- Indexes for performance
CREATE INDEX idx_lead_summaries_email ON lead_summaries(email);
CREATE INDEX idx_lead_summaries_lead_score ON lead_summaries(lead_score DESC);
CREATE INDEX idx_lead_summaries_created_at ON lead_summaries(created_at DESC);
```


## **4. Frontend React Components**

### **Main Chat Interface with Sidebar**

```tsx
// components/AIShowcase.tsx
"use client"
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  audioData?: string
  sources?: any[]
}

interface ConversationState {
  sessionId: string
  name?: string
  email?: string
  companyInfo?: any
  stage: string
  messages: Message[]
  capabilitiesShown: string[]
}

interface SidebarActivity {
  activity: string
  message: string
  timestamp: number
  progress?: number
}

export default function AIShowcase() {
  const [conversationState, setConversationState] = useState<ConversationState>(() => {
    const saved = sessionStorage.getItem('aiShowcase')
    return saved ? JSON.parse(saved) : {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stage: 'greeting',
      messages: [],
      capabilitiesShown: []
    }
  })

  const [sidebarActivity, setSidebarActivity] = useState<SidebarActivity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [supabase] = useState(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  // Auto-save session state
  useEffect(() => {
    sessionStorage.setItem('aiShowcase', JSON.stringify(conversationState))
  }, [conversationState])

  // Supabase realtime subscription
  useEffect(() => {
    const channel = supabase.channel('ai-showcase')
    
    channel.on('broadcast', { event: 'ai-response' }, (payload) => {
      const { text, audioData, sources, sidebarActivity, conversationState: newState } = payload.payload
      
      // Add AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'ai',
        timestamp: new Date(),
        audioData,
        sources
      }
      
      setConversationState(prev => ({
        ...prev,
        ...newState,
        messages: [...prev.messages, aiMessage]
      }))

      // Play audio if available
      if (audioData) {
        const audio = new Audio(`data:audio/mpeg;base64,${audioData}`)
        audio.play()
      }

      setIsLoading(false)
    })

    channel.on('broadcast', { event: 'sidebar-update' }, (payload) => {
      setSidebarActivity(payload.payload)
    })
    
    channel.subscribe()
    
    return () => channel.unsubscribe()
  }, [])

  // Initial AI greeting
  useEffect(() => {
    if (conversationState.messages.length === 0) {
      const greeting: Message = {
        id: '1',
        text: "Hi! I'm here to showcase how AI can transform your business. What's your name?",
        sender: 'ai',
        timestamp: new Date()
      }
      setConversationState(prev => ({
        ...prev,
        messages: [greeting]
      }))
    }
  }, [])

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }

    // Update conversation state based on message
    let newState = { ...conversationState }
    newState.messages = [...newState.messages, userMessage]
    
    if (newState.stage === 'greeting' && !newState.name) {
      newState.name = message
      newState.stage = 'email_request'
    } else if (newState.stage === 'email_request' && message.includes('@')) {
      newState.email = message
      newState.stage = 'email_collected'
    }

    setConversationState(newState)

    try {
      // Send to AI API
      const response = await fetch('/api/gemini?action=conversationalFlow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          conversationState: newState,
          userInfo: {
            name: newState.name,
            email: newState.email,
            companyInfo: newState.companyInfo
          },
          messageCount: newState.messages.length,
          sessionId: newState.sessionId,
          includeAudio: true
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Response handled via Supabase realtime
      
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your message. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      }
      setConversationState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }))
      setIsLoading(false)
    }
  }

  const triggerCapabilityDemo = async (capability: string) => {
    const demos = {
      'image_generation': 'Generate a business visualization for my industry',
      'video_analysis': 'Analyze this YouTube video for business insights: https://youtube.com/watch?v=example',
      'document_analysis': 'Analyze a business document for optimization opportunities',
      'code_execution': 'Calculate ROI for implementing AI in my business',
      'url_analysis': 'Analyze my company website for AI opportunities'
    }

    if (demos[capability]) {
      await handleSendMessage(demos[capability])
    }
  }

  const completeShowcase = async () => {
    if (!conversationState.name || !conversationState.email) return

    try {
      const response = await fetch('/api/gemini?action=leadCapture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: conversationState.messages,
          userInfo: {
            name: conversationState.name,
            email: conversationState.email,
            companyInfo: conversationState.companyInfo
          },
          action: 'generate_summary'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Show completion message with booking CTA
        const completionMessage: Message = {
          id: Date.now().toString(),
          text: `Perfect! I've created your personalized AI consultation summary and sent it to ${conversationState.email}. 

Your AI readiness score: ${result.data.leadScore}/100

Ready to implement these AI solutions in your business? Let's schedule your free strategy session to create a custom roadmap for your success!

[Book Your Free Consultation] 📅`,
          sender: 'ai',
          timestamp: new Date()
        }

        setConversationState(prev => ({
          ...prev,
          messages: [...prev.messages, completionMessage],
          stage: 'completed'
        }))
      }
    } catch (error) {
      console.error('Error completing showcase:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - AI Activity Monitor */}
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <h3 className="font-bold text-lg mb-4">🤖 AI Activity Monitor</h3>
        
        {/* Capabilities Demonstrated */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Capabilities Showcased:</h4>
          <div className="space-y-1">
            {conversationState.capabilitiesShown.map((capability, index) => (
              <div key={index} className="text-sm text-green-600 flex items-center">
                ✅ {capability}
              </div>
            ))}
          </div>
        </div>

        {/* Current Activity */}
        {sidebarActivity && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Current Activity:</h4>
            <div className="text-sm text-blue-800">
              {sidebarActivity.message}
            </div>
            <div className="mt-2 text-xs text-blue-600">
              {new Date(sidebarActivity.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Quick Capability Demos */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Try AI Capabilities:</h4>
          <div className="space-y-2">
            <button 
              onClick={() => triggerCapabilityDemo('image_generation')}
              className="w-full text-left text-sm p-2 bg-purple-50 hover:bg-purple-100 rounded"
            >
              🎨 Image Generation
            </button>
            <button 
              onClick={() => triggerCapabilityDemo('video_analysis')}
              className="w-full text-left text-sm p-2 bg-red-50 hover:bg-red-100 rounded"
            >
              🎥 Video Analysis
            </button>
            <button 
              onClick={() => triggerCapabilityDemo('document_analysis')}
              className="w-full text-left text-sm p-2 bg-green-50 hover:bg-green-100 rounded"
            >
              📄 Document Processing
            </button>
            <button 
              onClick={() => triggerCapabilityDemo('code_execution')}
              className="w-full text-left text-sm p-2 bg-yellow-50 hover:bg-yellow-100 rounded"
            >
              ⚡ Code Execution
            </button>
            <button 
              onClick={() => triggerCapabilityDemo('url_analysis')}
              className="w-full text-left text-sm p-2 bg-indigo-50 hover:bg-indigo-100 rounded"
            >
              🌐 Website Analysis
            </button>
          </div>
        </div>

        {/* Complete Showcase Button */}
        {conversationState.name && conversationState.email && conversationState.messages.length > 5 && (
          <button 
            onClick={completeShowcase}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            🎯 Complete AI Showcase & Get Summary
          </button>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold">F.B/c AI Showcase</h1>
          <p className="text-sm text-gray-600">Experience the future of business AI in real-time</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversationState.messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                
                {/* Audio playback */}
                {message.audioData && (
                  <audio controls className="mt-2 w-full">
                    <source src={`data:audio/mpeg;base64,${message.audioData}`} />
                  </audio>
                )}
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 text-xs">
                    <div className="font-semibold">Sources:</div>
                    {message.sources.map((source, index) => (
                      <a key={index} href={source.url} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline block">
                        {source.title}
                      </a>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading || conversationState.stage === 'completed'} />
      </div>
    </div>
  )
}

// Chat Input Component
interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? "Showcase completed" : "Type your message..."}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  )
}
```


## **5. PDF Generation with F.B/c Branding**

```typescript
// utils/pdfGenerator.ts
import jsPDF from 'jspdf'

export const generateFBCReport = async (summaryData: {
  name: string
  email: string
  companyName?: string
  summary: string
  leadScore: number
  capabilitiesShown: string[]
}): Promise<string> => {
  const pdf = new jsPDF()
  
  // F.B/c Header
  pdf.setFontSize(24)
  pdf.setTextColor(44, 90, 160) // F.B/c blue
  pdf.text('F.B/c AI Consulting', 20, 30)
  
  pdf.setFontSize(16)
  pdf.setTextColor(0, 0, 0)
  pdf.text('AI Transformation Report', 20, 45)
  
  // Client Information
  pdf.setFontSize(12)
  pdf.text(`Prepared for: ${summaryData.name}`, 20, 65)
  pdf.text(`Company: ${summaryData.companyName || 'N/A'}`, 20, 75)
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 85)
  pdf.text(`AI Readiness Score: ${summaryData.leadScore}/100`, 20, 95)
  
  // Capabilities Demonstrated
  pdf.setFontSize(14)
  pdf.text('AI Capabilities Demonstrated:', 20, 115)
  
  pdf.setFontSize(10)
  summaryData.capabilitiesShown.forEach((capability, index) => {
    pdf.text(`✓ ${capability}`, 25, 130 + (index * 8))
  })
  
  // Executive Summary
  pdf.setFontSize(14)
  pdf.text('Executive Summary:', 20, 180)
  
  pdf.setFontSize(10)
  const summaryLines = pdf.splitTextToSize(summaryData.summary, 170)
  pdf.text(summaryLines, 20, 195)
  
  // Next Steps
  pdf.addPage()
  pdf.setFontSize(16)
  pdf.setTextColor(44, 90, 160)
  pdf.text('Next Steps', 20, 30)
  
  pdf.setFontSize(12)
  pdf.setTextColor(0, 0, 0)
  const nextSteps = [
    '1. Schedule your free 15-minute strategy session',
    '2. Receive custom AI implementation roadmap',
    '3. Choose between training or consulting engagement',
    '4. Begin AI transformation journey'
  ]
  
  nextSteps.forEach((step, index) => {
    pdf.text(step, 20, 50 + (index * 15))
  })
  
  // Contact Information
  pdf.setFontSize(14)
  pdf.text('Contact F.B/c AI Consulting:', 20, 130)
  
  pdf.setFontSize(10)
  pdf.text('Farzad Bayat, Founder', 20, 145)
  pdf.text('Email: bayatfarzad@gmail.com', 20, 155)
  pdf.text('Website: [Your Website]', 20, 165)
  pdf.text('Book Consultation: [Calendar Link]', 20, 175)
  
  // Footer
  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)
  pdf.text('This report was generated using AI technology that F.B/c can implement for your business.', 20, 280)
  
  return pdf.output('datauristring')
}
```


## **6. Implementation Checklist**

### **Phase 1: Core Setup ✅**

- [ ] Set up Vercel project with Supabase integration
- [ ] Configure environment variables (Gemini, ElevenLabs, Supabase)
- [ ] Implement enhanced Gemini API handler with all capabilities
- [ ] Set up Supabase database schema
- [ ] Test basic conversational flow


### **Phase 2: AI Capabilities Showcase ⚡**

- [ ] Implement all 16 Gemini capabilities:
    - [ ] Text generation with personalization
    - [ ] Image generation for business concepts
    - [ ] Video analysis for YouTube content
    - [ ] Speech generation with voice cloning
    - [ ] Music generation (experimental)
    - [ ] Long context conversation memory
    - [ ] Structured output for summaries
    - [ ] Thinking process transparency
    - [ ] Function calling for real-time actions
    - [ ] Document understanding and analysis
    - [ ] Image understanding and insights
    - [ ] Video understanding and processing
    - [ ] Audio understanding and transcription
    - [ ] Code execution for business calculations
    - [ ] URL context analysis
    - [ ] Grounding with Google Search


### **Phase 3: Real-time Experience 🔄**

- [ ] Implement Supabase real-time broadcasting
- [ ] Create sidebar activity monitor
- [ ] Add voice streaming with ElevenLabs
- [ ] Set up real-time capability demonstrations
- [ ] Test 15-minute showcase flow


### **Phase 4: Lead Generation 🎯**

- [ ] Implement ephemeral session management
- [ ] Create lead scoring algorithm
- [ ] Build conversation summary generation
- [ ] Set up branded PDF creation
- [ ] Configure email automation
- [ ] Add consultation booking integration


### **Phase 5: Production Deployment 🚀**

- [ ] Optimize performance and response times
- [ ] Add error handling and fallbacks
- [ ] Implement usage monitoring
- [ ] Set up analytics tracking
- [ ] Test with real users
- [ ] Launch live showcase

This comprehensive implementation gives you a **cutting-edge AI showcase platform** that demonstrates every advanced Gemini capability while capturing high-quality leads for your F.B/c consulting business. The 15-minute experience will leave prospects amazed at what AI can do and eager to implement these solutions in their own businesses!

<div style="text-align: center">⁂</div>

[^1]: image.jpg

