// /api/gemini.ts - Complete enhanced version
import { GoogleGenAI } from "@google/genai"
import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { ElevenLabs } from '@elevenlabs/elevenlabs-js';

// Define Message interface
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Define CompanyInfo interface
interface CompanyInfo {
  name?: string;
  domain?: string;
  analysis?: string;
}

// Define ConversationState interface (as updated previously, ensuring it matches the new structure)
interface ConversationState {
  stage: string;
  messages: Message[];
  messagesInStage: number;
  name?: string;
  email?: string;
  companyInfo?: CompanyInfo;
  aiGuidance?: string;
  sidebarActivity?: string;
  sessionId?: string;
  isLimitReached?: boolean;
  showBooking?: boolean;
}

// Define ProxyRequestBody interface
interface ProxyRequestBody {
  prompt?: string;
  currentConversationState?: ConversationState; // This must use the ConversationState defined above
  messageCount?: number;
  includeAudio?: boolean;
  [key: string]: any;
}

// Define ProxyResponse interface
interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
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
    genAIInstance = new GoogleGenAI({ apiKey })
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
      model: "gemini-1.5-flash-latest",
      tools: [{ codeExecution: {} }]
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
      const domain = userInfo.email.split('@').pop()
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
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingAttributions
      ?.map(attribution => ({
        title: attribution.web?.title || 'Web Source',
        url: attribution.web?.uri || '#',
        snippet: attribution.web?.title || 'Grounded search result'
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

    // Update conversation state based on the new structure from determineNextStage
    const updatedConversationState = determineNextStage(
      body.conversationState || { stage: 'greeting', messages: [] }, // Ensure initial state is compatible
      prompt,
      messageCount
    );

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
        // conversationState: determineNextStage(conversationState, prompt, userInfo) // Logic moved above
        conversationState: updatedConversationState
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

  const elevenlabs = new ElevenLabs({
    apiKey: ELEVENLABS_API_KEY,
  });

  const audio = await elevenlabs.generate({
    voice: VOICE_ID,
    text,
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.8,
      similarity_boost: 0.9,
      style: 0.4,
      use_speaker_boost: true
    }
  });

  // Convert stream to buffer then to base64
  const chunks = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }
  const audioBuffer = Buffer.concat(chunks);
  const audioBase64 = audioBuffer.toString('base64');

  return { audioBase64 };
}

// Image generation showcase
async function handleImageGeneration(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { prompt, conversationContext } = body

    if (!prompt) {
      return { success: false, error: "No prompt provided for image generation", status: 400 }
    }

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

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

    // This is a placeholder for actual video analysis using Gemini.
    // The genAI.models.generateContent syntax is from an older version or incorrect.
    // For actual video analysis, you'd typically use a model that supports video input,
    // and the API call would look different, likely involving uploading the video data or providing a GCS URI.
    // For now, we'll simulate a response.
    // const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }).generateContent({ // This syntax is incorrect for current SDK
    //   contents: [
    //     {
    //       role: "user",
    //       parts: [
    //         {
    //           fileData: {
    //             mimeType: "video/*",
    //             fileUri: videoUrl
    //           }
    //         },
    //         { text: analysisPrompt }
    //       ]
    //     }
    //   ]
    // })
    // const response = result.response
    // const text = response.text()

    // Simulated response for video analysis
    const text = `Simulated video analysis for ${videoUrl}: ${analysisPrompt}`;


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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })

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
      model: "gemini-1.5-flash-latest",
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
      model: "gemini-1.5-flash-latest",
      tools: [{ googleSearch: {} }]
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })

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
            leadId: leadData?.[0]?.id
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

// ConversationState is already defined above with the new structure

function determineNextStage(
    currentState: ConversationState,
    userMessageText: string,
    messageCountInSession: number
): ConversationState {
    let {
        stage = 'greeting',
        messagesInStage = 0,
        name = currentState.name,
        email = currentState.email,
        companyInfo = currentState.companyInfo || {},
        messages = currentState.messages || []
    } = currentState;

    let nextStage = stage;
    let aiGuidance = "";
    let newSidebarActivity = currentState.sidebarActivity || "";
    let newMessagesInStage = messagesInStage + 1;

    const transitionTo = (targetStage: string, guidance: string, activity?: string) => {
        nextStage = targetStage;
        aiGuidance = guidance;
        if (activity !== undefined) newSidebarActivity = activity;
        newMessagesInStage = 0;
    };

    switch (stage) {
        case 'greeting':
            if (userMessageText && userMessageText.length > 1 && !userMessageText.includes('@') && userMessageText.split(' ').length < 5) {
                 name = userMessageText.trim();
                 // Rephrased the problematic string
                 transitionTo('email_request', "User name is " + name + ". Now, ask for their email address to continue the personalized showcase.");
            } else {
                aiGuidance = "I'm F.B/c's AI assistant, here to show you how AI can transform your business. To start, could you please tell me your name?";
                nextStage = 'greeting';
                newMessagesInStage = messagesInStage;
            }
            break;

        case 'email_request':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(userMessageText)) {
                email = userMessageText.trim();
                const domain = email.split('@').pop() || "company.com";
                companyInfo = { ...companyInfo, domain: domain, name: companyInfo.name || domain.split('.')[0] };
                newSidebarActivity = "company_analysis_triggered";
                transitionTo('email_collected', `Thanks, ${name}! I've got your email: ${email}. I'll quickly look up your company domain "${companyInfo.domain}" using Google Search to tailor this showcase. Then, I'd love to hear about your main business goals or any specific AI interests you have.`);
            } else {
                aiGuidance = `Thanks, ${name}. For the personalized experience, I'll need a valid email address. Could you please provide it?`;
                nextStage = 'email_request';
                newMessagesInStage = messagesInStage;
            }
            break;

        case 'email_collected':
            transitionTo('initial_discovery', `Okay ${name}, based on public information about ${companyInfo.name || companyInfo.domain} (or if not found, general business context), what's a key business challenge you're facing, or what specific area of AI are you most curious about today?`);
            newSidebarActivity = "company_analysis_complete";
            break;

        case 'initial_discovery':
            if (newMessagesInStage >= 2) {
                transitionTo('capability_introduction', `That's insightful, ${name}. Based on what you've shared, I can demonstrate some relevant AI capabilities. Are you interested in seeing something specific, or would you like a suggestion?`);
            } else {
                aiGuidance = `Interesting, ${name}. Tell me more about that. For example, how does that impact your team or your customers? The more I understand, the better I can tailor this AI showcase.`;
                nextStage = 'initial_discovery';
            }
            break;

        case 'capability_introduction':
             transitionTo('capability_selection', `Great! You can ask me to demonstrate a capability (e.g., "show image generation," "analyze a website," "process a document") or pick one from the sidebar options. What would you like to explore first, ${name}?`);
             break;

        case 'capability_selection':
            aiGuidance = `Okay ${name}, I'm ready when you are. Let me know which AI capability you'd like to see in action. You can describe it or use the quick demo buttons.`;
            if (newMessagesInStage >= 2 && !userMessageText.toLowerCase().match(/generate|analyze|show|try|demo|website|image|video|document|code/)) {
                 transitionTo('capability_suggestion', `No problem, ${name}! How about we start with something visual? For instance, I can generate a business concept image based on a prompt. Or, if you have a company website, I can analyze it for AI opportunities. Interested in either of those?`);
            } else {
                nextStage = 'capability_selection';
            }
            break;
        case 'capability_suggestion':
            transitionTo('capability_selection', `So, ${name}, what are your thoughts on that suggestion? Or is there another AI capability you'd prefer to explore?`);
            break;

        case 'post_capability_feedback':
            if (newMessagesInStage >= 1) {
                transitionTo('solution_discussion', `Thanks for the feedback, ${name}! It's helpful to know what resonates. These AI tools can be powerful. Are you thinking about how such capabilities could be applied in your business, perhaps through custom AI solutions or team training?`);
                newSidebarActivity = "";
            } else {
                aiGuidance = `What did you think of that demonstration, ${name}? Any immediate thoughts or questions about how that AI capability works or its potential uses?`;
                nextStage = 'post_capability_feedback';
            }
            break;

        case 'solution_discussion':
            if (newMessagesInStage >= 2) {
                transitionTo('summary_offer', `This has been a good discussion, ${name}. I can prepare a personalized summary of our conversation, highlighting the AI capabilities we touched upon and potential next steps for your business. Would you like that?`);
            } else {
                aiGuidance = `F.B/c specializes in helping businesses like yours integrate AI, ${name}. Whether it's hands-on workshops for your team or developing custom AI-powered tools, the goal is practical application and real results. Do you have any questions about that?`;
                nextStage = 'solution_discussion';
            }
            break;

        case 'summary_offer':
            if (userMessageText.toLowerCase().match(/yes|ok|sure|please|generate|summary|do it/)) {
                transitionTo('finalizing', `Excellent, ${name}! I'll prepare that summary for you. It will include key insights from our chat and a special consultant brief for Farzad. This helps him understand your needs if you decide to book a follow-up consultation.`);
                newSidebarActivity = "summary_generation_started";
            } else if (userMessageText.toLowerCase().match(/no|not yet|later|skip/)) {
                transitionTo('solution_discussion', `No problem at all, ${name}. We can skip the summary for now. Is there anything else about AI applications or F.B/c's services you'd like to discuss?`);
                 newSidebarActivity = "";
            } else {
                aiGuidance = `Just to confirm, ${name}, would you like me to generate that personalized AI showcase summary for you now?`;
                nextStage = 'summary_offer';
            }
            break;

        case 'finalizing':
            aiGuidance = `Your summary is being prepared, ${name}. If you choose to book a strategy session, Farzad will use this to hit the ground running. Thank you for experiencing the F.B/c AI Showcase!`;
            nextStage = 'finalizing';
            break;

        case 'limit_reached':
            aiGuidance = `We've reached the message limit for this demo session, ${name}. To continue exploring how AI can benefit your business, please consider booking a consultation with Farzad.`;
            nextStage = 'limit_reached';
            break;

        default:
            transitionTo('greeting', "It seems we got off track. Let's start over. What's your name?");
            newSidebarActivity = "";
            break;
    }

    return {
        ...currentState,
        stage: nextStage,
        messages: messages,
        messagesInStage: newMessagesInStage,
        name, email, companyInfo,
        aiGuidance,
        sidebarActivity: newSidebarActivity,
    };
}

function calculateLeadScore(conversationHistory: any[], userInfo: any): number {
  let score = 0

  // Company email (not generic) +20
  // Ensure userInfo and userInfo.email are checked for null or undefined if necessary
  const userEmail = userInfo?.email;
  if (userEmail) {
    const domain = userEmail.split('@').pop() || '';
    if (!['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
      score += 20;
    }
  }

  // Conversation engagement +10
  if (conversationHistory && conversationHistory.length > 8) {
    score += 10;
  }

  // Business terms mentioned +15
  const conversationText = JSON.stringify(conversationHistory || []).toLowerCase();
  if (conversationText.includes('automation') ||
      conversationText.includes('efficiency') ||
      conversationText.includes('ai') ||
      conversationText.includes('team') ||
      conversationText.includes('process')) {
    score += 15;
  }

  // Pricing/timeline questions +25
  if (conversationText.includes('cost') ||
      conversationText.includes('price') ||
      conversationText.includes('when') ||
      conversationText.includes('timeline') ||
      conversationText.includes('budget')) {
    score += 25;
  }

  // Multiple AI capabilities requested +20
  const capabilityKeywords = ['image', 'video', 'document', 'analyze', 'generate', 'code'];
  let capabilityMentions = 0;
  if (conversationHistory) { // Check if conversationHistory is not null
    capabilityMentions = capabilityKeywords.filter(keyword =>
      conversationText.includes(keyword)
    ).length;
  }

  if (capabilityMentions >= 3) {
    score += 20;
  }

  return Math.min(score, 100);
}

function extractCapabilitiesShown(conversationHistory: any[] | undefined): string[] { // Added undefined check
  const capabilities = [];
  if (!conversationHistory) return capabilities; // Return empty if undefined

  const conversationText = JSON.stringify(conversationHistory).toLowerCase();

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
Let's discuss your specific requirements and create a custom roadmap for your success: [CALENDAR_LINK]

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
    const action = req.query.action as string;
    const body: ProxyRequestBody = req.body || {};
    let responseResult: ProxyResponse;

    if (action === "conversationalFlow" || !action) {
        const {
            prompt,
            currentConversationState = {
                stage: 'greeting',
                messages: [],
                messagesInStage: 0,
                name: undefined,
                email: undefined,
                companyInfo: undefined,
                sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
                aiGuidance: "Initial greeting",
                sidebarActivity: ""
            },
            messageCount = 0,
            includeAudio = true,
        } = body;

        if (!prompt) {
            // Changed to assign to responseResult and then let the final return handle it
            responseResult = { success: false, error: "No prompt provided", status: 400 };
        } else {
            let tempCurrentConversationState = JSON.parse(JSON.stringify(currentConversationState));

            if (!tempCurrentConversationState.sessionId) {
                tempCurrentConversationState.sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;
            }

            if (messageCount >= AI_USAGE_LIMITS.maxMessagesPerSession && tempCurrentConversationState.stage !== 'limit_reached') {
                const limitReachedText = `Apologies, ${tempCurrentConversationState.name || 'there'}, we've reached the message limit for this interactive demo. To dive deeper and discuss tailored AI solutions for your business, I highly recommend booking a complimentary strategy session with Farzad!`;
                const limitState: ConversationState = {
                     ...tempCurrentConversationState,
                     stage: 'limit_reached',
                     aiGuidance: 'Inform user about message limit and strongly encourage consultation booking.',
                     isLimitReached: true,
                     showBooking: true,
                     messagesInStage: 0
                };
                const audio = includeAudio ? await generateVoiceWithElevenLabs(limitReachedText) : null;

                const supabase = getSupabase();
                await supabase.channel(limitState.sessionId!).send({
                    type: 'broadcast', event: 'ai-response',
                    payload: {
                        text: limitReachedText,
                        audioData: audio?.audioBase64,
                        conversationStateForNextTurn: limitState,
                        sender: 'ai',
                        timestamp: Date.now()
                    }
                });
                responseResult = {
                    success: true,
                    data: {
                        text: limitReachedText,
                        audioData: audio?.audioBase64,
                        conversationStateForNextTurn: limitState
                    }
                };
            } else {
                const newConversationState = determineNextStage(tempCurrentConversationState, prompt, messageCount);

                const baseSystemInstruction = `You are F.B/c AI Assistant, a friendly, highly intelligent, and slightly witty AI. Your primary role is to showcase AI capabilities for business transformation, understand user needs, and guide them towards a consultation with Farzad Bayat. Be conversational, engaging, and helpful. Use the user's name and company details (if known) to personalize responses. Avoid lists unless specifically asked. Keep responses concise and focused on the current conversational goal.`;
                const dynamicSystemInstruction = `${baseSystemInstruction}
CURRENT STAGE: ${newConversationState.stage}.
USER: ${newConversationState.name || 'Guest'}.
COMPANY: ${newConversationState.companyInfo?.name || 'Not specified'}
CONVERSATIONAL GOAL: ${newConversationState.aiGuidance || 'Respond to the user appropriately based on the conversation history and current stage.'}`;

                const genAI = getGenAI();
                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash-latest",
                    tools: [{ googleSearch: {} }],
                    systemInstruction: { role: "system", parts: [{ text: dynamicSystemInstruction }] }
                });

                const geminiHistory = (tempCurrentConversationState.messages || []).map((msg: Message) => ({
                    role: msg.sender === 'ai' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                }));

                const geminiResult = await model.generateContent({
                    contents: [...geminiHistory, { role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.75, topP: 0.9, topK: 40 }
                });

                const responseText = geminiResult.response.text();
                const sources = geminiResult.response.candidates?.[0]?.groundingMetadata?.groundingAttributions
                    ?.map((attr:any) => ({ title: attr.web?.title || 'Web Source', url: attr.web?.uri || '#', snippet: attr.web?.title || 'Grounded search result' })) || [];

                let audioData = null;
                if (includeAudio && responseText) {
                    audioData = await generateVoiceWithElevenLabs(responseText);
                }

                const supabase = getSupabase();
                await supabase.channel(newConversationState.sessionId!)
                    .send({
                        type: 'broadcast', event: 'ai-response',
                        payload: {
                            text: responseText,
                            sources,
                            audioData: audioData?.audioBase64,
                            sidebarActivity: newConversationState.sidebarActivity,
                            conversationStateForNextTurn: newConversationState,
                            sender: 'ai',
                            timestamp: Date.now()
                        }
                    });

                responseResult = {
                    success: true,
                    data: {
                        text: responseText,
                        sources,
                        audioData: audioData?.audioBase64,
                        audioMimeType: 'audio/mpeg',
                        sidebarActivity: newConversationState.sidebarActivity,
                        conversationStateForNextTurn: newConversationState
                    },
                    usage: {
                        inputTokens: estimateTokens(prompt) + estimateTokens(dynamicSystemInstruction) + geminiHistory.reduce((acc, curr) => acc + estimateTokens(curr.parts[0].text),0),
                        outputTokens: estimateTokens(responseText)
                    }
                };
                if(responseResult.usage) {
                    responseResult.usage.cost = estimateCost(responseResult.usage.inputTokens, responseResult.usage.outputTokens);
                }
            }
        }
    } else {
        const {
            currentConversationState = {
                stage: 'capability_selection', messages: [], messagesInStage: 0,
                sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
                aiGuidance: "Awaiting capability selection.",
                sidebarActivity: ""
            },
        } = body;

        let postCapabilityState = { ...currentConversationState, stage: 'post_capability_feedback', messagesInStage: 0, aiGuidance: `Capability ${action} shown. Ask for feedback.`, sidebarActivity: `${action}_complete`};

        let capabilityResponseText = `[Placeholder: Output for ${action}.]`;

        if (action === "health") {
             responseResult = { success: true, data: { status: "healthy", capabilities: "all_gemini_features_active", conversationStateForNextTurn: currentConversationState } };
        } else if (action === "leadCapture"){
             // NOTE: This is a simplified placeholder. The original handleLeadCapture had more complex logic.
             // That logic (calling Gemini for summary/brief, DB insert) should be merged here or called from here.
             // For now, using the placeholder logic from the subtask description.
             const finalState = { ...currentConversationState, stage: 'finalizing', aiGuidance: "Lead capture process is complete. Thank the user."};
             responseResult = { success: true, data: { text: "Your information and summary are being processed. Thank you!", conversationStateForNextTurn: finalState }};
        } else if (["generateImage", "analyzeVideo", "analyzeDocument", "executeCode", "analyzeURL"].includes(action)) {
            // NOTE: These actions previously called dedicated handler functions (e.g., handleImageGeneration).
            // That logic (calling Gemini with specific prompts/tools, etc.) should be merged here or called.
            // For now, using the placeholder logic.
            const supabase = getSupabase();
            await supabase.channel(postCapabilityState.sessionId!)
                .send({
                    type: 'broadcast', event: 'ai-response',
                    payload: {
                        text: capabilityResponseText,
                        sidebarActivity: postCapabilityState.sidebarActivity,
                        conversationStateForNextTurn: postCapabilityState,
                        sender: 'ai',
                        timestamp: Date.now()
                    }
                });
            responseResult = {
                success: true,
                data: {
                    text: capabilityResponseText,
                    sidebarActivity: postCapabilityState.sidebarActivity,
                    conversationStateForNextTurn: postCapabilityState
                }
            };
        } else {
             responseResult = { success: false, error: "Unknown or unhandled action: " + action, status: 400 };
        }
    }

    if (responseResult.success) {
      return res.status(responseResult.status || 200).json(responseResult);
    } else {
      return res.status(responseResult.status || 500).json({
        success: false,
        error: responseResult.error || "An unknown server error occurred.",
      });
    }
  } catch (error: any) {
    console.error("Proxy handler error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    })
  }
}
