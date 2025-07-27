import { GoogleGenAI } from '@google/genai';
import { getSupabase } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';
import { chatRequestSchema, validateRequest, sanitizeString } from '@/lib/validation';
import { logServerActivity } from '@/lib/server-activity-logger';
import { ConversationStateManager } from '@/lib/conversation-state-manager';
import { LeadManager } from '@/lib/lead-manager';
import { checkDevelopmentConfig } from '@/lib/config';
import { withFullSecurity } from '@/lib/api-security';
import { selectModelForFeature, estimateTokensForMessages } from '@/lib/model-selector';
import { enforceBudgetAndLog } from '@/lib/token-usage-logger';
import { checkDemoAccess, recordDemoUsage, getDemoSession, DemoFeature } from '@/lib/demo-budget-manager';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const key = ip;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
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

function logConsoleActivity(level: 'info' | 'warn' | 'error', message: string, metadata?: any): string {
  const correlationId = Math.random().toString(36).substring(7);
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId,
    ...metadata
  };
  
  console.log(JSON.stringify(logEntry));
  return correlationId;
}

async function buildEnhancedSystemPrompt(leadContext: any, currentMessage: string, sessionId: string | null): Promise<string> {
  const basePrompt = `You are F.B/c AI, a professional business consulting assistant specializing in AI automation and digital transformation.

Your capabilities include:
- Business process analysis and optimization
- AI implementation strategy and ROI assessment
- Digital transformation consulting
- Technical solution architecture
- Industry-specific insights and best practices

Core Principles:
1. Provide actionable, business-focused advice
2. Ask clarifying questions to understand specific needs
3. Offer concrete next steps and implementation guidance
4. Consider cost-benefit analysis and ROI
5. Stay professional yet approachable

Response Style:
- Be concise but comprehensive
- Use bullet points for clarity when appropriate
- Provide specific examples and recommendations
- Ask follow-up questions to gather more context
- Focus on business value and practical implementation`

  // Add lead context if available and valid
  console.log('🔍 Lead context received:', { leadContext, sessionId });
  
  if (leadContext && leadContext.name && leadContext.name.trim() !== '') {
    let enhancedContext = `${basePrompt}

Current Client Context:
- Name: ${leadContext.name}
- Company: ${leadContext.company || 'Not specified'}
- Role: ${leadContext.role || 'Not specified'}
- Industry: ${leadContext.industry || 'Not specified'}
- Email: ${leadContext.email || 'Not specified'}`

    // Try to fetch grounded search results for this lead
    try {
      const { LeadManagementService } = await import('@/lib/lead-management');
      const leadManager = new LeadManagementService();
      
      // For demo sessions, try to find the lead by email without user authentication
      let lead = null;
      
      if (sessionId) {
        // In demo mode, try to find lead by email in the current session
        try {
          const { getSupabase } = await import('@/lib/supabase/server');
          const supabase = getSupabase();
          
          // Query lead_summaries table directly for demo sessions
          const { data: leads, error } = await supabase
            .from('lead_summaries')
            .select('*')
            .eq('email', leadContext.email)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (!error && leads && leads.length > 0) {
            lead = leads[0];
            console.log('✅ Found lead in database:', { leadId: lead.id, email: lead.email });
          } else {
            console.log('❌ No lead found for email:', leadContext.email);
          }
        } catch (dbError) {
          console.error('Failed to fetch lead from database:', dbError);
        }
      } else {
        // For authenticated users, use the existing method
        const leads = await leadManager.getUserLeads();
        lead = leads.find(l => l.email === leadContext.email);
      }
      
      if (lead) {
        console.log('🔍 Fetching search results for lead:', lead.id);
        const searchResults = await leadManager.getLeadSearchResults(lead.id);
        
        console.log('📊 Search results found:', searchResults?.length || 0);
        
        if (searchResults && searchResults.length > 0) {
          enhancedContext += `

Background Research (from online sources):
${searchResults.map((result, index) => `
${index + 1}. ${result.title || 'Untitled'}
   Source: ${result.url}
   Summary: ${result.snippet || 'No description available'}
`).join('')}

Use this background research to personalize your responses for ${leadContext.name}. Reference specific details from their online presence when relevant to provide more targeted and valuable advice.`
        }
      }
    } catch (error) {
      console.error('Failed to fetch lead search results:', error);
      // Continue without search results if there's an error
    }

    enhancedContext += `

Personalize your responses for ${leadContext.name} and their specific business context.`

    return enhancedContext;
  }

  // If no valid lead context, use a generic greeting
  return `${basePrompt}

Welcome! I'm here to help you with your business consulting needs. Please tell me about your company and what you'd like to achieve with AI automation or digital transformation.`
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

    // Estimate tokens and select model
    const estimatedTokens = estimateTokensForMessages(sanitizedMessages);
    const modelSelection = selectModelForFeature('chat', estimatedTokens, !!sessionId);

    // Log AI processing start activity
    const processingActivityId = await logServerActivity({
      type: 'ai_thinking',
      title: 'Processing User Message',
      description: `Analyzing ${sanitizedMessages.length} messages (${estimatedTokens} tokens)`,
      status: 'in_progress',
      metadata: {
        correlationId,
        sessionId,
        model: modelSelection.model,
        estimatedTokens,
        hasWebGrounding
      }
    });

    // Check demo budget for chat feature
    if (sessionId) {
      const accessCheck = await checkDemoAccess(sessionId, 'chat' as DemoFeature, estimatedTokens);
      
      if (!accessCheck.allowed) {
        // Log failed activity
        await logServerActivity({
          type: 'error',
          title: 'Demo Limit Reached',
          description: accessCheck.reason,
          status: 'failed',
          metadata: { correlationId, sessionId, remainingTokens: accessCheck.remainingTokens }
        });

        return new Response(JSON.stringify({
          error: 'Demo limit reached',
          message: accessCheck.reason,
          remainingTokens: accessCheck.remainingTokens,
          remainingRequests: accessCheck.remainingRequests
        }), { status: 429 });
      }
    }

    // Check user budget if authenticated
    if (isAuthenticated && auth.userId) {
      const budgetCheck = await enforceBudgetAndLog(
        auth.userId,
        sessionId,
        'chat',
        modelSelection.model,
        estimatedTokens,
        estimatedTokens * 0.5, // Estimate output tokens
        true
      );

      if (!budgetCheck.allowed) {
        // Log failed activity
        await logServerActivity({
          type: 'error',
          title: 'Budget Limit Reached',
          description: budgetCheck.reason,
          status: 'failed',
          metadata: { correlationId, userId: auth.userId, suggestedModel: budgetCheck.suggestedModel }
        });

        return new Response(JSON.stringify({
          error: 'Budget limit reached',
          message: budgetCheck.reason,
          suggestedModel: budgetCheck.suggestedModel
        }), { status: 429 });
      }
    }

    // Build system prompt
    const systemPrompt = await buildEnhancedSystemPrompt(leadContext, messages[messages.length - 1]?.content || '', sessionId || null);

    // Initialize Gemini client
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = genAI.models.generateContentStream;

    // Prepare content for Gemini
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...sanitizedMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    ];

    // Generate response
    let responseStream;
    let actualInputTokens = 0;
    let actualOutputTokens = 0;
    
    try {
      responseStream = await model({
        model: modelSelection.model,
        config: { responseMimeType: 'text/plain' },
        contents
      });

      // Estimate actual token counts (Gemini doesn't provide usageMetadata in streaming)
      actualInputTokens = estimatedTokens;
      actualOutputTokens = estimatedTokens * 0.5;
    } catch (error: any) {
      // Log failed activity
      await logServerActivity({
        type: 'error',
        title: 'AI Response Generation Failed',
        description: error.message || 'Unknown error during AI processing',
        status: 'failed',
        metadata: { correlationId, sessionId, model: modelSelection.model, error: error.message }
      });

      logConsoleActivity('error', 'Failed to generate response', {
        correlationId,
        error: error.message || 'Unknown error',
        sessionId,
        model: modelSelection.model
      });
      throw error;
    }

    // Record usage
    if (sessionId) {
      await recordDemoUsage(sessionId, 'chat' as DemoFeature, actualInputTokens + actualOutputTokens, 1);
    }

    if (isAuthenticated && auth.userId) {
      await enforceBudgetAndLog(
        auth.userId,
        sessionId,
        'chat',
        modelSelection.model,
        actualInputTokens,
        actualOutputTokens,
        true,
        undefined,
        { correlationId, modelSelection: modelSelection.reason }
      );
    }

    // Log successful completion
    await logServerActivity({
      type: 'ai_stream',
      title: 'AI Response Generated',
      description: `Generated response using ${modelSelection.model} (${actualInputTokens + actualOutputTokens} tokens)`,
      status: 'completed',
      metadata: {
        correlationId,
        sessionId,
        model: modelSelection.model,
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        processingTime: Date.now() - startTime
      }
    });

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
          // Log stream error
          await logServerActivity({
            type: 'error',
            title: 'Stream Error',
            description: 'Error during response streaming',
            status: 'failed',
            metadata: { correlationId, error: error.message || 'Unknown error' }
          });

          logConsoleActivity('error', 'Stream error', { correlationId, error: error.message || 'Unknown error' });
          controller.error(error);
        }
      },
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
    // Log general error
    await logServerActivity({
      type: 'error',
      title: 'Chat Request Failed',
      description: error.message || 'Unknown error processing chat request',
      status: 'failed',
      metadata: { correlationId, error: error.message || 'Unknown error' }
    });

    logConsoleActivity('error', 'Chat request failed', { 
      correlationId, 
      error: error.message || 'Unknown error',
      processingTime: Date.now() - startTime
    });

    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    }), { status: 500 });
  }
}
