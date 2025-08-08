import { GoogleGenAI } from '@google/genai';
import { getSupabase } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';
import { chatRequestSchema, validateRequest, sanitizeString } from '@/lib/validation';
import { logServerActivity } from '@/lib/server-activity-logger';
import { ConversationStateManager } from '@/lib/conversation-state-manager';
import { LeadManager, ConversationStage } from '@/lib/lead-manager';
import { checkDevelopmentConfig } from '@/lib/config';
import { withFullSecurity } from '@/lib/api-security';
import { selectModelForFeature, estimateTokensForMessages } from '@/lib/model-selector';
import { enforceBudgetAndLog } from '@/lib/token-usage-logger';
import URLContextService from '@/lib/services/url-context-service';
import GoogleSearchService from '@/lib/services/google-search-service';
import { createOptimizedConfig, optimizeConversation, type ConversationMessage } from '@/lib/gemini-config-enhanced';
import { shouldUseMockForRequest, createMockRedirectResponse, logApiRouting } from '@/lib/api-router';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
}

interface EnhancedChatData {
  hasWebGrounding?: boolean;
  leadContext?: any;
  enableUrlContext?: boolean;
  enableGoogleSearch?: boolean;
  thinkingBudget?: number;
  tools?: Array<{
    urlContext?: {};
    googleSearch?: {};
  }>;
  conversationSessionId?: string;
  enableLeadGeneration?: boolean;
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

async function processUrlContext(message: string, correlationId: string): Promise<string> {
  try {
    // Extract URLs from the message
    const urls = URLContextService.extractURLsFromText(message);
    
    if (urls.length === 0) {
      return '';
    }

    console.log(`🔗 Found ${urls.length} URLs to analyze:`, urls);

    // Analyze URLs (limit to first 3 for performance)
    const urlsToAnalyze = urls.slice(0, 3);
    const urlAnalyses = await URLContextService.analyzeMultipleURLs(urlsToAnalyze);

    let contextInfo = '\n\n**URL Context Analysis:**\n';
    
    urlAnalyses.forEach((analysis, index) => {
      if (analysis.error) {
        contextInfo += `\n${index + 1}. **${analysis.url}** - Error: ${analysis.error}\n`;
      } else {
        contextInfo += `\n${index + 1}. **${analysis.title || 'Untitled'}**\n`;
        contextInfo += `   URL: ${analysis.url}\n`;
        contextInfo += `   Description: ${analysis.description || 'No description available'}\n`;
        contextInfo += `   Word Count: ${analysis.wordCount} words (${analysis.readingTime} min read)\n`;
        
        if (analysis.metadata.author) {
          contextInfo += `   Author: ${analysis.metadata.author}\n`;
        }
        
        if (analysis.metadata.publishDate) {
          contextInfo += `   Published: ${analysis.metadata.publishDate}\n`;
        }
        
        // Include a snippet of the content
        const contentSnippet = analysis.extractedText.substring(0, 300);
        contextInfo += `   Content Preview: ${contentSnippet}${analysis.extractedText.length > 300 ? '...' : ''}\n`;
      }
    });

    return contextInfo;
  } catch (error: any) {
    console.error('URL Context Processing Error:', error);
    return `\n\n**URL Context Analysis Error:** ${error.message}`;
  }
}

async function processGoogleSearch(message: string, leadContext: any, correlationId: string): Promise<string> {
  try {
    if (!GoogleSearchService.isConfigured()) {
      console.log('Google Search API not configured, skipping search');
      return '';
    }

    // Determine search strategy based on message content and lead context
    let searchResults = '';
    
    // Check if message contains specific search intent
    const searchIntentKeywords = ['search', 'find', 'look up', 'research', 'what is', 'who is', 'tell me about'];
    const hasSearchIntent = searchIntentKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (hasSearchIntent) {
      // Extract search query from message
      let searchQuery = message;
      
      // Clean up the query
      searchIntentKeywords.forEach(keyword => {
        searchQuery = searchQuery.replace(new RegExp(keyword, 'gi'), '').trim();
      });
      
      // Remove common question words
      searchQuery = searchQuery.replace(/^(what|who|when|where|why|how)\s+/gi, '').trim();
      
      if (searchQuery.length > 0) {
        console.log(`🔍 Performing Google search for: "${searchQuery}"`);
        
        const response = await GoogleSearchService.search(searchQuery, {
          num: 5,
          safe: 'active',
        });
        
        if (response.items && response.items.length > 0) {
          searchResults += '\n\n**Google Search Results:**\n';
          searchResults += GoogleSearchService.formatResultsForAI(response);
        }
      }
    }

    // If we have lead context, search for additional information about the person/company
    if (leadContext && leadContext.name && leadContext.name.trim() !== '') {
      console.log(`🔍 Searching for lead information: ${leadContext.name}`);
      
      const personSearch = await GoogleSearchService.searchPerson(
        leadContext.name,
        leadContext.company,
        ['LinkedIn', 'profile', 'biography']
      );
      
      if (personSearch.items && personSearch.items.length > 0) {
        searchResults += '\n\n**Lead Research Results:**\n';
        searchResults += `Research for ${leadContext.name}${leadContext.company ? ` at ${leadContext.company}` : ''}:\n\n`;
        
        personSearch.items.slice(0, 3).forEach((item, index) => {
          searchResults += `${index + 1}. **${item.title}**\n`;
          searchResults += `   ${item.snippet}\n`;
          searchResults += `   Source: ${item.link}\n\n`;
        });
      }
      
      // Also search for company information if available
      if (leadContext.company && leadContext.company.trim() !== '') {
        console.log(`🔍 Searching for company information: ${leadContext.company}`);
        
        const companySearch = await GoogleSearchService.searchCompany(
          leadContext.company,
          ['about', 'business', 'services']
        );
        
        if (companySearch.items && companySearch.items.length > 0) {
          searchResults += `\n**Company Research Results:**\n`;
          searchResults += `Research for ${leadContext.company}:\n\n`;
          
          companySearch.items.slice(0, 2).forEach((item, index) => {
            searchResults += `${index + 1}. **${item.title}**\n`;
            searchResults += `   ${item.snippet}\n`;
            searchResults += `   Source: ${item.link}\n\n`;
          });
        }
      }
    }

    return searchResults;
  } catch (error: any) {
    console.error('Google Search Processing Error:', error);
    return `\n\n**Google Search Error:** ${error.message}`;
  }
}

function getStageInstructions(stage: ConversationStage): string {
  const instructions = {
    [ConversationStage.GREETING]: "Welcome the user warmly and ask for their name in a natural, conversational way.",
    [ConversationStage.NAME_COLLECTION]: "Acknowledge their name and ask for their work email to provide personalized insights.",
    [ConversationStage.EMAIL_CAPTURE]: "Thank them for the email and explain you'll research their company for context.",
    [ConversationStage.BACKGROUND_RESEARCH]: "Share insights about their company and transition to understanding their challenges.",
    [ConversationStage.PROBLEM_DISCOVERY]: "Ask specific questions about their pain points and business challenges.",
    [ConversationStage.SOLUTION_PRESENTATION]: "Present tailored AI solutions based on their specific challenges.",
    [ConversationStage.CALL_TO_ACTION]: "Offer next steps like scheduling a consultation or getting a custom proposal."
  };
  
  return instructions[stage] || "Continue the conversation naturally.";
}

async function buildEnhancedSystemPrompt(leadContext: any, currentMessage: string, sessionId: string | null): Promise<string> {
  const basePrompt = `You are F.B/c AI (codename: Puck in voice), a sharp, friendly consulting assistant.

About F.B/c:
- Small senior team that helps teams ship AI that actually moves the business.
- Focus: discovery workshops, ROI/feasibility, rapid prototyping, productionization, enablement.

Services to reference when asked:
- Discovery Workshop (1–2 days): map high-ROI automations, align KPIs, leave with a plan + prototype scope.
- ROI & Feasibility: quantify time/cost savings, risk, and path-to-prod.
- Rapid Prototyping: get a working demo in days.
- Integration & Launch: wire into tools, auth, data, and monitoring.
- Team Enablement: teach prompt/agent patterns, guardrails, and ops.

Abilities:
- Research, draft plans, estimate ROI, outline architectures, create prompts/docs/next steps.

Core Principles:
1. Actionable, business-focused advice
2. Clarify context; ask targeted follow-ups
3. Concrete next steps and implementation guidance
4. Cost-benefit and ROI thinking by default
5. Professional but approachable; light wit

Response Style:
- Be concise but complete; prefer bullets for options/plans
- Provide specific examples and recommendations
- Ask follow-ups only when it unblocks value
- Use activity markers where helpful: [ACTIVITY_IN:User does X], [ACTIVITY_OUT:We deliver Y] (UI renders chips)
`

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
  
  // Check if we should redirect to mock endpoint
  if (process.env.NODE_ENV === 'development') {
    logApiRouting(); // Log current routing configuration
    
    const mockRedirect = createMockRedirectResponse(req);
    if (mockRedirect) {
      return mockRedirect;
    }
  }
  
  try {
    // Get client IP for rate limiting and demo session tracking
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Rate limiting check
    if (!checkRateLimit(ip, 20, 60000)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
    }

    // Authentication check (allow anonymous access for public chat)
    let auth: { success: boolean; userId?: string; error?: string };
    
    // Try authentication first, but allow anonymous access if it fails
    auth = await authenticateRequest(req);
    if (!auth.success) {
      // Allow anonymous access for public chat functionality
      auth = { success: true, userId: `anon-${Date.now()}-${Math.random().toString(36).substring(7)}`, error: undefined };
      logConsoleActivity('info', 'Anonymous user accessing chat', { ip, correlationId, userId: auth.userId });
    } else {
      logConsoleActivity('info', 'Authenticated user accessing chat', { ip, correlationId, userId: auth.userId });
    }

    // Get session ID from headers or cookies
    const sessionId = req.headers.get('x-demo-session-id') || req.cookies.get('demo-session-id')?.value;

    // Authentication check (optional for demo)
    const isAuthenticated = auth.success;

    // Parse and validate request
    const rawData = await req.json();
    console.log('📥 Chat API Request:', {
      messageCount: rawData.messages?.length,
      sessionId: rawData.sessionId,
      conversationSessionId: rawData.conversationSessionId,
      enableLeadGeneration: rawData.enableLeadGeneration,
      hasMessages: !!rawData.messages
    });
    
    const validation = validateRequest(chatRequestSchema, rawData);
    
    if (!validation.success) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.errors
      }), { status: 400 });
    }

    const { messages, data = {} } = validation.data;
    const enhancedData = data as EnhancedChatData;
    const { 
      hasWebGrounding = false, 
      leadContext,
      enableUrlContext = true,
      enableGoogleSearch = true,
      thinkingBudget = -1,
      tools = [{ urlContext: {} }, { googleSearch: {} }],
      conversationSessionId,
      enableLeadGeneration = true
    } = enhancedData;

    // Sanitize messages
    const sanitizedMessages = messages.map((message: Message) => ({
      ...message,
      content: sanitizeString(message.content)
    }));

    const currentMessage = sanitizedMessages[sanitizedMessages.length - 1]?.content || '';

    // Initialize conversation state management if lead generation is enabled
    let conversationResult = null;
    let leadData = leadContext;
    
    console.log('🔍 Lead generation check:', {
      enableLeadGeneration,
      conversationSessionId,
      sessionId,
      condition: enableLeadGeneration && (conversationSessionId || sessionId)
    });
    
    if (enableLeadGeneration && (conversationSessionId || sessionId)) {
      try {
        const conversationManager = ConversationStateManager.getInstance();
        const effectiveSessionId = conversationSessionId || sessionId || `session-${Date.now()}`;
        
        console.log('🎯 Initializing conversation manager with session:', effectiveSessionId);
        
        // Initialize conversation state if it doesn't exist
        let conversationState = conversationManager.getConversationState(effectiveSessionId);
        if (!conversationState) {
          conversationState = await conversationManager.initializeConversation(effectiveSessionId);
        }
        
        // Process message through conversation state manager
        conversationResult = await conversationManager.processMessage(
          effectiveSessionId,
          currentMessage,
          leadData?.id || null
        );
        
        // Update lead data with any new information extracted
        if (conversationResult.updatedState.context.leadData) {
          leadData = { ...leadData, ...conversationResult.updatedState.context.leadData };
        }
        
        console.log('🎯 Conversation state processed:', {
          sessionId: effectiveSessionId,
          currentStage: conversationResult.newStage,
          shouldTriggerResearch: conversationResult.shouldTriggerResearch,
          leadData: leadData
        });
        
        // Trigger company research if needed
        if (conversationResult.shouldTriggerResearch && leadData?.email) {
          console.log('🔍 Triggering company research for:', leadData.email);
          // This will be handled by the Google Search processing below
        }
        
      } catch (error) {
        console.error('❌ Conversation state management error:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        // Continue without conversation state if there's an error
      }
    }

    // Process URL context if enabled
    let urlContext = '';
    if (enableUrlContext) {
      urlContext = await processUrlContext(currentMessage, correlationId);
    }

    // Process Google Search if enabled
    let searchResults = '';
    if (enableGoogleSearch) {
      searchResults = await processGoogleSearch(currentMessage, leadContext, correlationId);
    }

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

    // Build system prompt with enhanced context
    let systemPrompt = await buildEnhancedSystemPrompt(leadContext, messages[messages.length - 1]?.content || '', sessionId || null);
    
    // Add conversation stage context if available
    if (conversationResult) {
      systemPrompt += `\n\n**Conversation Context:**
- Current Stage: ${conversationResult.newStage}
- Lead Name: ${leadData?.name || 'Not provided yet'}
- Lead Email: ${leadData?.email || 'Not provided yet'}
- Company: ${leadData?.company || leadData?.emailDomain || 'Not identified yet'}
- Pain Points: ${leadData?.painPoints?.join(', ') || 'Not identified yet'}

**Stage-Specific Instructions:**
${getStageInstructions(conversationResult.newStage)}

**Important:** Use the conversation stage response provided by the system. The response has already been crafted for this stage.
Response to use: "${conversationResult.response}"`;
    }
    
    // Append URL context and search results to system prompt
    if (urlContext) {
      systemPrompt += urlContext;
    }
    
    if (searchResults) {
      systemPrompt += searchResults;
    }

    // Initialize Gemini client
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = genAI.models.generateContentStream;

    // Prepare optimized content for Gemini with caching and summarization
    const conversationMessages: ConversationMessage[] = sanitizedMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : (msg.role === 'system' ? 'user' : msg.role as 'user' | 'model'),
      content: msg.content
    }));

    const optimizedContent = await optimizeConversation(
      conversationMessages,
      systemPrompt,
      sessionId || 'default',
      4000 // Max history tokens
    );

    // Create optimized generation config with token limits
    const optimizedConfig = createOptimizedConfig('chat', {
      maxOutputTokens: 2048, // Prevent unbounded generation
      temperature: 0.7
    });

    // Generate response with enhanced configuration
    let responseStream;
    let actualInputTokens = optimizedContent.estimatedTokens;
    let actualOutputTokens = 0;
    
    // Build configuration with thinking, tools support, and optimization
    const config = {
      ...optimizedConfig,
      thinkingConfig: {
        thinkingBudget: thinkingBudget,
      },
      tools,
    };

    // Log optimization results
    console.log(`💡 Chat optimization: ${optimizedContent.usedCache ? 'Used cache' : 'Created new'}, estimated tokens: ${optimizedContent.estimatedTokens}${optimizedContent.summary ? ', with summary' : ''}`);

    const contents = optimizedContent.contents;
    
    try {
      responseStream = await model({
        model: modelSelection.model,
        config,
        contents
      });

      // Use optimized token estimation
      // actualInputTokens already set from optimizedContent.estimatedTokens
      actualOutputTokens = Math.min(optimizedConfig.maxOutputTokens, actualInputTokens * 0.6); // Estimate based on input with cap
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

    // Usage tracking is now handled client-side with the simplified demo session system

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

    // Heuristic coach: suggest next best capability based on the latest user message
    function detectYouTubeURL(text: string): string | null {
      try {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
        const m = text?.match(regex)
        return m ? m[0] : null
      } catch { return null }
    }
    function computeNextBestCapability(message: string, ctx: { hasUrlContext: boolean; hasSearch: boolean; lead?: any, stage?: any }): { nextBest: string | null, suggestions: string[] } {
      const m = (message || '').toLowerCase()
      const suggestions: string[] = []
      if (detectYouTubeURL(m)) suggestions.push('video')
      if (/\b(roi|payback|savings|cost|hours|time|efficiency)\b/.test(m)) suggestions.push('roi')
      if (/\b(upload|document|pdf|docx|spec|process)\b/.test(m)) suggestions.push('doc')
      if (/\b(screenshot|image|photo|picture)\b/.test(m)) suggestions.push('image')
      if (/\b(screen ?share|share your screen|my screen)\b/.test(m)) suggestions.push('screen')
      if (ctx.hasUrlContext) suggestions.push('webpreview')
      if (ctx.hasSearch) suggestions.push('search')
      // Stage-aware nudge
      if (!suggestions.length && ctx.stage === 3 /* EMAIL_CAPTURE */) suggestions.push('doc')
      if (!suggestions.length && ctx.stage === 5 /* PROBLEM_DISCOVERY */) suggestions.push('screen')
      return { nextBest: suggestions[0] || null, suggestions }
    }

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          // Send conversation state as first event if available
          console.log('🎯 Stream start - conversationResult:', conversationResult ? {
            newStage: conversationResult.newStage,
            hasLeadData: !!leadData
          } : 'null');
          
          if (conversationResult) {
            const stateData = {
              conversationStage: conversationResult.newStage,
              leadData: leadData ? {
                name: leadData.name,
                email: leadData.email,
                company: leadData.company || leadData.emailDomain
              } : undefined
            };
            console.log('🎯 Sending conversation state:', stateData);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(stateData)}\n\n`));
          }

          // Send coach suggestion if we can infer one from the latest user message and context
          try {
            const nb = computeNextBestCapability(currentMessage, { hasUrlContext: !!urlContext, hasSearch: !!searchResults, lead: leadData, stage: conversationResult?.newStage })
            if (nb.nextBest) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ nextBest: nb.nextBest, suggestions: nb.suggestions })}\n\n`))
            }
            // Emit capabilityUsed for context processors
            if (urlContext) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ capabilityUsed: 'webpreview' })}\n\n`))
            if (searchResults) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ capabilityUsed: 'googleSearch' })}\n\n`))
          } catch (e) {
            console.warn('coach suggestion failed', e)
          }
          
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
