import { GoogleGenAI } from '@google/genai';
import { getSupabase } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';
import { chatRequestSchema, validateRequest, sanitizeString } from '@/lib/validation';
import { logServerActivity } from '@/lib/server-activity-logger';
import { ConversationStateManager } from '@/lib/conversation-state-manager';
import { LeadManager } from '@/lib/lead-manager';
import { checkDevelopmentConfig } from '@/lib/config';
import { withFullSecurity } from '@/lib/api-security';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
}

export const dynamic = 'force-dynamic';

// ============================================================================
// AUTHENTICATION & RATE LIMITING MIDDLEWARE
// ============================================================================

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, limit: number = 20, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

async function authenticateRequest(req: NextRequest): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7);
    const supabase = getSupabase();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { success: false, error: 'Invalid or expired token' };
    }

    return { success: true, userId: user.id };
  } catch (error) {
    return { success: false, error: 'Authentication service unavailable' };
  }
}

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

function logConsoleActivity(level: 'info' | 'error' | 'warn', message: string, metadata: any = {}) {
  const correlationId = Math.random().toString(36).substring(7);
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId,
    ...metadata
  }));
  return correlationId;
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

async function logActivityToDB(activity: {
  type: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'failed';
  metadata?: any;
}) {
  try {
                await logServerActivity({
        type: activity.type as any,
        title: activity.title,
        description: activity.description,
        status: activity.status,
        metadata: activity.metadata
      });
  } catch (error) {
    console.error('Failed to log activity to database:', error);
  }
}

// ============================================================================
// LEAD RESEARCH INTEGRATION
// ============================================================================

async function getLeadResearchData(email: string): Promise<any> {
  try {
    const supabase = getSupabase();
    const { data: leadData, error } = await supabase
      .from("lead_summaries")
      .select("conversation_summary, consultant_brief, lead_score, ai_capabilities_shown")
      .eq("email", email)
      .single();

    if (error || !leadData) {
      console.log("No lead research data found for:", email);
      return null;
    }

    return leadData;
  } catch (error) {
    console.error("Error fetching lead research:", error);
    return null;
  }
}

// ============================================================================
// CONVERSATION STATE MANAGEMENT
// ============================================================================

const conversationManager = new ConversationStateManager();
const leadManager = new LeadManager();

// ============================================================================
// ENHANCED SYSTEM PROMPT BUILDER
// ============================================================================

async function buildEnhancedSystemPrompt(
  leadContext: any, 
  userMessage: string,
  conversationState?: any
): Promise<string> {
  let systemPrompt = `You are F.B/c, a lead-generation assistant for Farzad Bayat's website. You speak clearly in Norwegian or English based on user preference. You are optimized for real-time interactive chat (text, voice, video), and can:

**CORE CAPABILITIES:**
- Lead qualification and research
- Company intelligence gathering
- Pain point discovery
- AI solution presentation
- Meeting scheduling
- Follow-up sequence management

**CONVERSATION STAGES (7-STAGE FSM):**
1. GREETING - Welcome and establish rapport
2. NAME_COLLECTION - Get contact information
3. EMAIL_CAPTURE - Collect email for follow-up
4. BACKGROUND_RESEARCH - Research company and role
5. PROBLEM_DISCOVERY - Identify pain points and challenges
6. SOLUTION_PRESENTATION - Present AI solutions
7. CALL_TO_ACTION - Schedule meeting or next steps

**SMART CONVERSATION FLOW:**
- If user info is already available, skip asking for it and move directly to value delivery
- If name/email are provided, immediately start with personalized insights
- Focus on business value, not data collection
- Move quickly to problem discovery and solution presentation
- Avoid repetitive questions about information already known
- Use the conversation stage to guide your responses appropriately

**RESPONSE STYLE:**
- Professional yet conversational
- Data-driven insights
- Personalized to company context
- Clear value propositions
- Gentle persuasion without being pushy
- Efficient and direct - don't waste time on information already available

**GDPR COMPLIANCE:**
- Always ask for consent before collecting data
- Explain how data will be used
- Provide opt-out options
- Respect user privacy preferences

**TOOL CALLING:**
- Use internal tools for research when needed
- Integrate with lead management system
- Log all interactions for follow-up
- Trigger appropriate next steps

**AFFECTIVE DIALOG:**
- Show empathy for business challenges
- Demonstrate understanding of industry context
- Build trust through expertise and transparency
- Create emotional connection to AI transformation benefits

**IMPORTANT: If you already have user information, don't ask for it again. Move directly to providing value and discovering their business needs.`;

  // Add conversation context if available
  if (conversationState) {
    systemPrompt += `\n\n**CONVERSATION CONTEXT:**
Current Stage: ${conversationState.currentStage}
Participant: ${conversationState.context.leadData.name || 'Unknown'}
Company: ${conversationState.context.leadData.company || 'Unknown'}
AI Readiness: ${conversationState.context.aiReadiness || 50}/100
Pain Points: ${conversationState.context.painPoints.join(', ') || 'None identified yet'}

**STAGE-SPECIFIC INSTRUCTIONS:**
${getStageSpecificInstructions(conversationState.currentStage)}`;
  }

  // Add lead context if available
  if (leadContext?.name) {
    systemPrompt += `\n\nCURRENT USER CONTEXT:\n- Name: ${sanitizeString(leadContext.name)}`;
    if (leadContext.email) systemPrompt += `\n- Email: ${sanitizeString(leadContext.email)}`;
    if (leadContext.company) systemPrompt += `\n- Company: ${sanitizeString(leadContext.company)}`;
    if (leadContext.role) systemPrompt += `\n- Role: ${sanitizeString(leadContext.role)}`;
  }

  // If we have user info, get existing lead research data
  if (leadContext?.email) {
    console.log('Looking for lead research data for email:', leadContext.email)
    const leadResearch = await getLeadResearchData(leadContext.email);
    
    if (leadResearch) {
      systemPrompt += `\n\nLEAD RESEARCH CONTEXT:\n${leadResearch.conversation_summary}\n\nCONSULTANT BRIEF:\n${leadResearch.consultant_brief || 'No brief available'}\n\nLEAD SCORE: ${leadResearch.lead_score}/100\n\nAI CAPABILITIES IDENTIFIED:\n${leadResearch.ai_capabilities_shown || 'None identified'}`;
      
      // Log that we're using lead research
      await logActivityToDB({
        type: "ai_thinking",
        title: "Using Lead Research Data",
        description: `Incorporating research data for ${leadContext.name}`,
        status: "completed",
        metadata: { 
          name: leadContext.name, 
          email: leadContext.email,
          leadScore: leadResearch.lead_score 
        }
      });
    }
  }

  return systemPrompt;
}

// ============================================================================
// STAGE-SPECIFIC INSTRUCTIONS
// ============================================================================

function getStageSpecificInstructions(stage: string): string {
  switch (stage) {
    case 'greeting':
      return `- Welcome warmly and establish rapport
- Ask about their business and current challenges
- Set expectations for the consultation
- Move to name collection if not already provided`;
    
    case 'name_collection':
      return `- Politely ask for their name if not provided
- Explain why we need this information
- Move to email capture once name is obtained`;
    
    case 'email_capture':
      return `- Request email for follow-up and resources
- Explain GDPR compliance and data usage
- Move to background research once email is captured`;
    
    case 'background_research':
      return `- Research their company and role
- Analyze industry trends and challenges
- Identify potential AI opportunities
- Move to problem discovery`;
    
    case 'problem_discovery':
      return `- Ask targeted questions about their challenges
- Identify pain points and inefficiencies
- Understand their AI readiness and goals
- Move to solution presentation`;
    
    case 'solution_presentation':
      return `- Present relevant AI solutions
- Show specific benefits and ROI
- Address their specific pain points
- Move to call to action`;
    
    case 'call_to_action':
      return `- Propose next steps (meeting, proposal, etc.)
- Create urgency without being pushy
- Provide clear value proposition
- Close with specific action items`;
    
    default:
      return `- Adapt response based on conversation flow
- Focus on providing value and building trust`;
  }
}

// ============================================================================
// ENHANCED GEMINI CLIENT WITH GOOGLE SEARCH
// ============================================================================

class EnhancedGeminiClient {
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  async generateResponse(messages: Message[], systemPrompt: string, hasWebGrounding: boolean = false, leadContext?: any) {
    // Log search activity if we have lead context
    if (leadContext?.name && hasWebGrounding) {
      await logActivityToDB({
        type: "ai_thinking",
        title: "Searching LinkedIn",
        description: "Finding relevant profiles and information",
        status: "in_progress",
        metadata: { 
          name: leadContext.name, 
          email: leadContext.email,
          searchType: "linkedin"
        }
      });
    }

    // Use live API for grounded search, regular API for normal chat
    logConsoleActivity('info', `Debug: hasWebGrounding: ${hasWebGrounding}, leadContext?.name: ${leadContext?.name}`);
    if (hasWebGrounding && leadContext?.name) {
      console.log(`🔍 GROUNDED SEARCH TRIGGERED for: ${leadContext.name}`);
      logConsoleActivity('info', `Using grounded search for: ${leadContext.name}`);
      return this.generateGroundedResponse(messages, systemPrompt, leadContext);
    } else {
      console.log(`❌ NO GROUNDED SEARCH - hasWebGrounding: ${hasWebGrounding}, leadContext?.name: ${leadContext?.name}`);
      logConsoleActivity('info', 'Using regular response - no grounded search');
      return this.generateRegularResponse(messages, systemPrompt);
    }
  }

  private async generateGroundedResponse(messages: Message[], systemPrompt: string, leadContext: any) {
    try {
      // Import and use the Gemini Live API service
      const { GeminiLiveAPI } = await import('@/lib/gemini-live-api');
      const geminiLiveAPI = new GeminiLiveAPI();
      
      // Get the user's message
      const userMessage = messages[messages.length - 1]?.content || '';
      
      // Perform grounded search using the live API - this returns a complete AI response
      const aiResponse = await geminiLiveAPI.performGroundedSearch(leadContext, userMessage);

      // Convert the response to an async generator to match the expected return type
      return (async function* () {
        // Split the response into chunks for streaming
        const chunks = aiResponse.match(/.{1,100}/g) || [aiResponse];
        
        for (const chunk of chunks) {
          yield { text: chunk };
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      })();
    } catch (error) {
      console.error('Grounded search failed, falling back to regular response:', error);
      return this.generateRegularResponse(messages, systemPrompt);
    }
  }

  private async generateRegularResponse(messages: Message[], systemPrompt: string) {
    // Combine system prompt with messages
    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))
    ];

    const config = {
      responseMimeType: "text/plain",
    };

    return this.genAI.models.generateContentStream({
      model: 'gemini-2.5-flash',
      config,
      contents,
    });
  }

  async countTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================

async function chatHandler(req: NextRequest) {
  // Check for missing environment variables in development
  checkDevelopmentConfig();
  
  const startTime = Date.now();
  const correlationId = logConsoleActivity('info', 'Enhanced chat request started');
  
  try {
    // Rate limiting check
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    if (!checkRateLimit(ip, 20, 60000)) {
      logConsoleActivity('warn', 'Rate limit exceeded', { ip, correlationId });
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: 60
      }), { 
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Window': '60000'
        }
      });
    }

    // Authentication check (bypass in development or demo mode)
    let auth: { success: boolean; userId?: string; error?: string };
    
    if (process.env.NODE_ENV === 'development') {
      auth = { success: true, userId: 'dev-user', error: undefined };
      logConsoleActivity('info', 'Development mode - authentication bypassed', { ip, correlationId });
    } else if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      auth = { success: true, userId: 'demo' };
      logConsoleActivity('info', 'Demo mode – authentication bypassed', { ip, correlationId });
    } else {
      auth = await authenticateRequest(req);
      if (!auth.success) {
        logConsoleActivity('warn', 'Authentication failed', { ip, correlationId, error: auth.error });
        return new Response(JSON.stringify({
          error: 'Authentication required',
          details: auth.error
        }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Input validation
    const rawData = await req.json();
    const validation = validateRequest(chatRequestSchema, rawData);
    if (!validation.success) {
      logConsoleActivity('warn', 'Validation failed', { 
        ip, 
        correlationId, 
        userId: auth.userId,
        errors: validation.errors 
      });
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.errors
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { messages, data = {} } = validation.data;
    const { leadContext = {}, sessionId = null } = data;
    
    // Log the lead context for debugging
    if (leadContext && Object.keys(leadContext).length > 0) {
      console.log('Lead context received:', {
        name: leadContext.name,
        email: leadContext.email,
        company: leadContext.company
      })
    } else {
      console.log('No lead context provided')
    }
    
    // Sanitize messages
    const sanitizedMessages = messages.map((message: Message) => ({
      ...message,
      content: sanitizeString(message.content)
    }));

    // Get the latest user message for context
    const lastUserMessage = sanitizedMessages.filter(m => m.role === 'user').pop()?.content || '';

    // Initialize or get conversation state
    let conversationState;
    if (sessionId && typeof sessionId === 'string') {
      conversationState = conversationManager.getConversationState(sessionId);
      if (!conversationState) {
        conversationState = await conversationManager.initializeConversation(sessionId);
      }
    }

    // Process message through conversation state management (with timeout)
    let stageResult: any;
    if (conversationState && lastUserMessage && sessionId && typeof sessionId === 'string') {
      try {
        // Add timeout to prevent long processing
        const stagePromise = conversationManager.processMessage(sessionId, lastUserMessage, leadContext.leadId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stage processing timeout')), 5000)
        );
        
        stageResult = await Promise.race([stagePromise, timeoutPromise]);
        
        // Process through the advanced conversation state machine
        
        // Update conversation state
        conversationState = stageResult.updatedState;
        
        // Handle stage-specific actions
        if (stageResult.shouldTriggerResearch && leadContext?.email) {
          // Trigger background research for the lead
          setTimeout(async () => {
            try {
              const domainAnalysis = await leadManager.analyzeEmailDomain(leadContext.email);
              await conversationManager.integrateResearchData(sessionId, {
                companySize: domainAnalysis.companySize,
                industry: domainAnalysis.industry,
                decisionMaker: domainAnalysis.decisionMaker,
                aiReadiness: domainAnalysis.aiReadiness
              });
              
              await logActivityToDB({
                type: "ai_thinking",
                title: "Company Research Complete",
                description: `Analyzed ${leadContext.email} - ${domainAnalysis.companySize} company in ${domainAnalysis.industry}`,
                status: "completed",
                metadata: { 
                  name: leadContext.name, 
                  email: leadContext.email,
                  companySize: domainAnalysis.companySize,
                  industry: domainAnalysis.industry,
                  aiReadiness: domainAnalysis.aiReadiness
                }
              });
            } catch (error) {
              console.error('Error in background research:', error);
            }
          }, 1000);
        }
        
        // Handle follow-up sequence creation
        if (stageResult.shouldSendFollowUp && leadContext?.email) {
          setTimeout(async () => {
            try {
              const followUpSequence = await leadManager.createFollowUpSequence(leadContext.id || 'temp');
              await logActivityToDB({
                type: "follow_up_created",
                title: "Follow-up Sequence Created",
                description: `Created ${followUpSequence.emails.length} follow-up emails for ${leadContext.name}`,
                status: "completed",
                metadata: { 
                  name: leadContext.name, 
                  email: leadContext.email,
                  sequenceId: followUpSequence.id,
                  emailCount: followUpSequence.emails.length
                }
              });
            } catch (error) {
              console.error('Error creating follow-up sequence:', error);
            }
          }, 2000);
        }
        
        // Log stage transition with enhanced details
        await logActivityToDB({
          type: "stage_transition",
          title: "Conversation Stage Advanced",
          description: `Advanced from ${stageResult.updatedState.currentStage} to ${stageResult.newStage} for ${leadContext?.name || 'user'}`,
          status: "completed",
          metadata: { 
            name: leadContext?.name, 
            email: leadContext?.email,
            fromStage: stageResult.updatedState.currentStage,
            toStage: stageResult.newStage,
            shouldTriggerResearch: stageResult.shouldTriggerResearch,
            shouldSendFollowUp: stageResult.shouldSendFollowUp,
            totalMessages: stageResult.updatedState.metadata.totalMessages
          }
        });
        
        // Update lead data if we have new information
        if (leadContext?.email && stageResult.updatedState.context.leadData) {
          try {
            await leadManager.updateLead(leadContext.id || 'temp', {
              ...stageResult.updatedState.context.leadData,
              conversationStage: stageResult.newStage,
              lastInteraction: new Date(),
              totalInteractions: stageResult.updatedState.metadata.totalMessages
            });
          } catch (error) {
            console.error('Error updating lead:', error);
          }
        }
        
      } catch (error) {
        console.error('Error processing conversation state:', error);
        // Continue with basic chat if state management fails
      }
    }

    // Log chat activity if we have lead context
    if (leadContext?.name) {
      await logActivityToDB({
        type: "ai_request",
        title: "Enhanced Chat Request",
        description: `Chat with ${leadContext.name}${leadContext.company ? ` from ${leadContext.company}` : ''}`,
        status: "in_progress",
        metadata: { 
          name: leadContext.name, 
          email: leadContext.email,
          company: leadContext.company,
          messageCount: sanitizedMessages.length,
          currentStage: conversationState?.currentStage || 'unknown'
        }
      });
    }

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      logConsoleActivity('error', 'Missing API key configuration', { correlationId });
      return new Response(JSON.stringify({
        error: 'Service configuration error'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize enhanced Gemini client
    const geminiClient = new EnhancedGeminiClient(apiKey);
    const systemPrompt = await buildEnhancedSystemPrompt(leadContext, lastUserMessage, conversationState);

    logConsoleActivity('info', 'Processing enhanced chat request', { 
      correlationId,
      userId: auth.userId,
      sessionId,
      messageCount: sanitizedMessages.length,
      model: 'gemini-2.5-flash',
      leadContext: !!leadContext?.name
    });

    // Generate response using the enhanced client with web grounding
    const hasWebGrounding = !!leadContext?.name;
    logConsoleActivity('info', `Lead context debug: ${JSON.stringify(leadContext)}`);
    logConsoleActivity('info', `hasWebGrounding: ${hasWebGrounding}`);
    logConsoleActivity('info', `Will use grounded search: ${hasWebGrounding && leadContext?.name ? 'YES' : 'NO'}`);
    let responseStream;
    try {
      responseStream = await geminiClient.generateResponse(sanitizedMessages, systemPrompt, hasWebGrounding, leadContext);
    } catch (error) {
      logConsoleActivity('error', 'Failed to generate enhanced response', {
        correlationId,
        userId: auth.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return new Response(JSON.stringify({
        error: 'Failed to generate response'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';
          
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
              );
            }
          }
          
          // Log successful response completion
          if (leadContext?.name) {
            await logActivityToDB({
              type: "ai_stream",
              title: "Enhanced Response Complete",
              description: `Generated ${fullResponse.length} character response for ${leadContext.name} with lead research context`,
              status: "completed",
              metadata: { 
                name: leadContext.name, 
                responseLength: fullResponse.length
              }
            });

            // Log summary creation step
            setTimeout(async () => {
              await logActivityToDB({
                type: "ai_thinking",
                title: "Creating Summary",
                description: "Finalizing the analysis report",
                status: "in_progress",
                metadata: { 
                  name: leadContext.name, 
                  email: leadContext.email,
                  summaryType: "conversation"
                }
              });
            }, 1000);

            setTimeout(async () => {
              await logActivityToDB({
                type: "ai_thinking",
                title: "Summary Ready",
                description: "PDF summary available for download",
                status: "completed",
                metadata: { 
                  name: leadContext.name, 
                  email: leadContext.email,
                  summaryType: "pdf",
                  downloadReady: true
                }
              });
            }, 3000);
          }
          
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Calculate token usage (approximate)
    const inputTokens = lastUserMessage ? await geminiClient.countTokens(lastUserMessage) : 0;
    
    logConsoleActivity('info', 'Enhanced chat response streaming started', {
      correlationId,
      userId: auth.userId,
      inputTokens,
      responseTime: Date.now() - startTime,
      leadContext: !!leadContext?.name
    });

    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Correlation-ID': correlationId.toString(),
        'X-Response-Time': `${Date.now() - startTime}ms`,
        'X-Lead-Research': leadContext?.email ? 'enabled' : 'disabled'
      },
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logConsoleActivity('error', 'Enhanced chat API error', { 
      correlationId,
      error: error.message || 'Unknown error',
      responseTime,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      correlationId
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId
      }
    });
  }
}

export const POST = withFullSecurity(chatHandler, {
  payloadLimit: '100kb'
})
