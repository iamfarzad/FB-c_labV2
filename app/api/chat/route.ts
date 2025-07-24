import { GoogleGenAI } from '@google/genai';
import { getSupabase } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';
import { chatRequestSchema, validateRequest, sanitizeString } from '@/lib/validation';
import { logServerActivity } from '@/lib/server-activity-logger';
import { ConversationStateManager } from '@/lib/conversation-state-manager';
import { LeadManager } from '@/lib/lead-manager';
import { checkDevelopmentConfig } from '@/lib/config';
import { withFullSecurity } from '@/lib/api-security';
import { selectModel, estimateTokens, estimateCost } from '@/lib/model-selector';
import { logTokenUsage, checkBudget } from '@/lib/token-usage-logger';
import { checkDemoAccess, recordDemoUsage, getDemoSession, DemoFeature } from '@/lib/demo-budget-manager';

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
    console.error('Failed to log activity:', error);
  }
}

// ============================================================================
// LEAD RESEARCH DATA
// ============================================================================

async function getLeadResearchData(email: string): Promise<any> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('lead_summaries')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      name: data.name,
      email: data.email,
      company: data.company_name,
      summary: data.conversation_summary,
      brief: data.consultant_brief,
      leadScore: data.lead_score,
      aiCapabilities: data.ai_capabilities_shown
    };
  } catch (error) {
    console.error('Failed to get lead research data:', error);
    return null;
  }
}

// ============================================================================
// SYSTEM PROMPT BUILDER
// ============================================================================

async function buildEnhancedSystemPrompt(
  leadContext: any, 
  userMessage: string,
  conversationState?: any
): Promise<string> {
  const basePrompt = `You are F.B/c AI, a specialized business consulting AI assistant. Your role is to help businesses identify AI automation opportunities and provide strategic guidance.

Key Capabilities:
- Lead research and analysis
- AI automation strategy
- Business process optimization
- Technology recommendations
- ROI analysis

Always be professional, concise, and actionable. Focus on practical business value.`;

  if (!leadContext) {
    return basePrompt;
  }

  const leadInfo = `
LEAD CONTEXT:
- Name: ${leadContext.name || 'Unknown'}
- Email: ${leadContext.email || 'Unknown'}
- Company: ${leadContext.company || 'Unknown'}
- Lead Score: ${leadContext.leadScore || 'Not scored'}
- Previous Research: ${leadContext.summary ? 'Available' : 'None'}

${leadContext.brief ? `CONSULTANT BRIEF: ${leadContext.brief}` : ''}
${leadContext.aiCapabilities ? `AI CAPABILITIES SHOWN: ${leadContext.aiCapabilities.join(', ')}` : ''}
`;

  const stageInstructions = conversationState?.stage ? getStageSpecificInstructions(conversationState.stage) : '';

  return `${basePrompt}

${leadInfo}

${stageInstructions}

Current user message: "${userMessage}"

Provide a helpful, professional response that leverages the lead context when relevant.`;
}

// ============================================================================
// STAGE-SPECIFIC INSTRUCTIONS
// ============================================================================

function getStageSpecificInstructions(stage: string): string {
  switch (stage) {
    case 'initial_contact':
      return 'Focus on building rapport and understanding their business needs. Ask open-ended questions about their current challenges.';
    
    case 'needs_assessment':
      return 'Dive deeper into their specific pain points and processes. Identify areas where AI could provide value.';
    
    case 'solution_presentation':
      return 'Present specific AI solutions tailored to their needs. Include ROI estimates and implementation timelines.';
    
    case 'objection_handling':
      return 'Address concerns professionally. Provide data and case studies to support your recommendations.';
    
    case 'closing':
      return 'Focus on next steps and commitment. Be clear about what happens next in the process.';
    
    default:
      return 'Maintain a professional, consultative approach. Focus on understanding their needs and providing value.';
  }
}

// ============================================================================
// CONVERSATION STATE MANAGEMENT
// ============================================================================

const conversationManager = new ConversationStateManager();
const leadManager = new LeadManager();

// ============================================================================
// ENHANCED GEMINI CLIENT WITH DEMO BUDGET SYSTEM
// ============================================================================

class EnhancedGeminiClient {
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  async generateResponse(messages: Message[], systemPrompt: string, hasWebGrounding: boolean = false, leadContext?: any, sessionId?: string) {
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
      return this.generateGroundedResponse(messages, systemPrompt, leadContext, sessionId);
    } else {
      console.log(`❌ NO GROUNDED SEARCH - hasWebGrounding: ${hasWebGrounding}, leadContext?.name: ${leadContext?.name}`);
      logConsoleActivity('info', 'Using regular response - no grounded search');
      return this.generateRegularResponse(messages, systemPrompt, sessionId);
    }
  }

  private async generateGroundedResponse(messages: Message[], systemPrompt: string, leadContext: any, sessionId?: string) {
    try {
      // Import and use the Gemini Live API service
      const { GeminiLiveAPI } = await import('@/lib/gemini-live-api');
      const geminiLiveAPI = new GeminiLiveAPI();
      
      // Get the user's message
      const userMessage = messages[messages.length - 1]?.content || '';
      
      // Perform grounded search using the live API - this returns a complete AI response
      const aiResponse = await geminiLiveAPI.performGroundedSearch(leadContext, userMessage);

      // Log token usage for grounded search
      if (sessionId) {
        const inputTokens = estimateTokens(systemPrompt + userMessage);
        const outputTokens = estimateTokens(aiResponse);
        const totalTokens = inputTokens + outputTokens;
        
        await recordDemoUsage(sessionId, 'lead_research' as DemoFeature, totalTokens, true);
      }

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
      return this.generateRegularResponse(messages, systemPrompt, sessionId);
    }
  }

  private async generateRegularResponse(messages: Message[], systemPrompt: string, sessionId?: string) {
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

    // Use demo budget system for model selection
    const fullPrompt = systemPrompt + messages.map(m => m.content).join('\n');
    const estimatedTokens = estimateTokens(fullPrompt);
    
    // Check demo access for chat feature
    if (sessionId) {
      const accessCheck = await checkDemoAccess(sessionId, 'chat' as DemoFeature, estimatedTokens);
      
      if (!accessCheck.allowed) {
        throw new Error(accessCheck.reason || 'Demo budget exceeded');
      }
    }

    // Select model based on demo budget system
    const model = sessionId ? 'gemini-2.5-flash-lite' : 'gemini-2.5-flash';

    const config = {
      responseMimeType: "text/plain",
    };

    const stream = this.genAI.models.generateContentStream({
      model,
      config,
      contents,
    });

    // Log token usage for demo tracking
    if (sessionId) {
      const estimatedOutputTokens = estimatedTokens * 0.5;
      const totalTokens = estimatedTokens + estimatedOutputTokens;
      
      await recordDemoUsage(sessionId, 'chat' as DemoFeature, totalTokens, true);
    }

    return stream;
  }

  async countTokens(text: string): Promise<number> {
    return estimateTokens(text);
  }
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const correlationId = logConsoleActivity('info', 'Chat request started');
  
  try {
    // Get client IP for rate limiting and demo session tracking
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Rate limiting check
    if (!checkRateLimit(ip, 20, 60000)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
    }

    // Get session ID from headers or cookies
    const sessionId = req.headers.get('x-demo-session-id') || req.cookies.get('demo-session-id')?.value;

    // Authentication check (optional for demo)
    const auth = await authenticateRequest(req);
    const isAuthenticated = auth.success;

    // Parse and validate request
    const rawData = await req.json();
    const validation = validateRequest(chatRequestSchema, rawData);
    
    if (!validation.success) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.errors
      }), { status: 400 });
    }

    const { messages, data = {} } = validation.data;
    const { hasWebGrounding = false, leadContext } = data;

    // Sanitize messages
    const sanitizedMessages = messages.map((message: Message) => ({
      ...message,
      content: sanitizeString(message.content)
    }));

    // Check demo budget for chat feature
    if (sessionId) {
      const fullPrompt = messages.map(m => m.content).join('\n');
      const estimatedTokens = estimateTokens(fullPrompt);
      
      const accessCheck = await checkDemoAccess(sessionId, 'chat' as DemoFeature, estimatedTokens);
      
      if (!accessCheck.allowed) {
        return new Response(JSON.stringify({
          error: 'Demo limit reached',
          message: accessCheck.reason,
          remainingTokens: accessCheck.remainingTokens,
          remainingRequests: accessCheck.remainingRequests
        }), { status: 429 });
      }
    }

    // Build system prompt
    const systemPrompt = await buildEnhancedSystemPrompt(leadContext, messages[messages.length - 1]?.content || '', null);

    // Initialize Gemini client
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const geminiClient = new EnhancedGeminiClient(process.env.GEMINI_API_KEY);

    // Generate response
    let responseStream;
    try {
      responseStream = await geminiClient.generateResponse(sanitizedMessages, systemPrompt, hasWebGrounding, leadContext, sessionId);
    } catch (error: any) {
      logConsoleActivity('error', 'Failed to generate enhanced response', {
        correlationId,
        error: error.message || 'Unknown error',
        sessionId
      });
      throw error;
    }

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text || '';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
          }
          controller.close();
        } catch (error: any) {
          logConsoleActivity('error', 'Stream error', { correlationId, error: error.message || 'Unknown error' });
          controller.error(error);
        }
      },
    });

    // Log successful completion
    logConsoleActivity('info', 'Chat request completed', {
      correlationId,
      responseTime: Date.now() - startTime,
      sessionId,
      isAuthenticated
    });

    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Correlation-ID': correlationId,
        'X-Response-Time': `${Date.now() - startTime}ms`
      },
    });

  } catch (error: any) {
    logConsoleActivity('error', 'Chat API error', { 
      correlationId, 
      error: error.message,
      stack: error.stack 
    });
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'X-Correlation-ID': correlationId }
    });
  }
}
