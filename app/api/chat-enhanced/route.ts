import { Client, types, GoogleSearch } from "@google/genai";
import { getSupabase } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';
import { chatRequestSchema, validateRequest, sanitizeString } from '@/lib/validation';
import { logActivity as logActivityToDB } from '@/lib/activity-logger';

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

function logActivity(level: 'info' | 'error' | 'warn', message: string, metadata: any = {}) {
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
// ENHANCED GEMINI CLIENT WITH GOOGLE SEARCH
// ============================================================================

class EnhancedGeminiClient {
  private client: Client;
  private session: any = null;

  constructor(apiKey: string) {
    this.client = new Client({
      apiKey: apiKey,
      vertexai: true,
      project: "fbconsulting-6225f",
      location: "global",
    });
  }

  async initializeSession(leadContext: any = {}) {
    const systemInstruction = `
You are F.B/c, a lead-generation assistant for Farzad Bayat's website. You speak clearly in Norwegian or English based on user preference. You are optimized for real-time interactive chat (text, voice, video), and can:

1. Offer immediate responses to user queries about services Farzad offers.
2. Detect lead tone and intent. If user shows interest, ask qualifying questions (company size, timeline, contact).
3. Seamlessly call internal tools:
   - function_calling: "capture_lead", "schedule_meeting", "send_brochure"
   - search_api: to fetch relevant blog/article content for context or social proof.
4. Use affective dialog: mirror user emotions (e.g. "jeg kan høre du er stressa—la oss finne en enkel løsning"), but remain concise and factual.
5. Handle interruptions: if user interrupts mid-message, stop generated response and respond to new input.
6. Support multimodal input:
   - Audio: accept user voice, transcribe, respond vocally with chosen voice profile.
   - Video: optionally read user nonverbal cues (smiling, nodding) to adjust tone but stay on topic.
7. Log all interactions with sentiment, lead stage, tags (e.g. "interested", "not a fit").
8. Respect privacy: no storing personal data beyond session, and always follow GDPR rules.

${leadContext?.name ? `Current user: ${leadContext.name}` : ''}
${leadContext?.company ? `Company: ${leadContext.company}` : ''}
${leadContext?.email ? `Email: ${leadContext.email}` : ''}
`;

    this.session = await this.client.startChatSession({
      model: "gemini-2.5-flash",
      tools: [
        // live web grounding via Google Search
        types.Tool({ google_search: new GoogleSearch() })
      ],
      systemInstruction,
      generationConfig: { responseMimeType: "text/plain" }
    });

    return this.session;
  }

  async sendMessage(message: string, leadContext: any = {}) {
    if (!this.session) {
      await this.initializeSession(leadContext);
    }

    const reply = await this.session.send({ text: message });
    
    return {
      text: reply.text,
      toolInvocations: reply.toolInvocations || []
    };
  }

  async generateStreamingResponse(messages: Message[], leadContext: any = {}) {
    if (!this.session) {
      await this.initializeSession(leadContext);
    }

    // Convert messages to the format expected by the session
    const lastMessage = messages[messages.length - 1];
    const reply = await this.session.send({ text: lastMessage.content });
    
    return reply.text;
  }
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const correlationId = logActivity('info', 'Enhanced chat request started');
  
  try {
    // Rate limiting check
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    if (!checkRateLimit(ip, 20, 60000)) {
      logActivity('warn', 'Rate limit exceeded', { ip, correlationId });
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

    // Authentication check (allow anonymous access for public chat)
    let auth: { success: boolean; userId?: string; error?: string };
    
    // Try authentication first, but allow anonymous access if it fails
    auth = await authenticateRequest(req);
    if (!auth.success) {
      // Allow anonymous access for public chat functionality
      auth = { success: true, userId: `anon-${Date.now()}-${Math.random().toString(36).substring(7)}`, error: undefined };
      logActivity('info', 'Anonymous user accessing chat', { ip, correlationId, userId: auth.userId });
    } else {
      logActivity('info', 'Authenticated user accessing chat', { ip, correlationId, userId: auth.userId });
    }

    // Input validation
    const rawData = await req.json();
    const validation = validateRequest(chatRequestSchema, rawData);
    if (!validation.success) {
      logActivity('warn', 'Validation failed', { 
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
    
    // Sanitize messages
    const sanitizedMessages = messages.map((message: Message) => ({
      ...message,
      content: sanitizeString(message.content)
    }));

    // Log enhanced chat activity if we have lead context
    if (leadContext?.name) {
      await logActivityToDB({
        type: "ai_request",
        title: "Enhanced AI Chat with Google Search",
        description: `Advanced chat with ${leadContext.name} using web grounding`,
        status: "in_progress",
        metadata: { 
          name: leadContext.name, 
          email: leadContext.email,
          company: leadContext.company,
          messageCount: sanitizedMessages.length,
          enhanced: true
        }
      });
    }

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logActivity('error', 'Missing API key configuration', { correlationId });
      return new Response(JSON.stringify({
        error: 'Service configuration error'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize enhanced Gemini client
    const geminiClient = new EnhancedGeminiClient(apiKey);

    logActivity('info', 'Processing enhanced chat request', { 
      correlationId,
      userId: auth.userId,
      sessionId,
      messageCount: sanitizedMessages.length,
      model: 'gemini-2.5-flash',
      enhanced: true
    });

    // Generate response using enhanced client with Google Search
    let responseText;
    try {
      responseText = await geminiClient.generateStreamingResponse(sanitizedMessages, leadContext);
    } catch (error) {
      logActivity('error', 'Failed to generate enhanced response', {
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

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send the response in chunks to simulate streaming
          const chunks = responseText.match(/.{1,100}/g) || [responseText];
          
          for (const chunk of chunks) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
            // Small delay to simulate real streaming
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // Log successful response completion
          if (leadContext?.name) {
            await logActivityToDB({
              type: "ai_stream",
              title: "Enhanced Response Complete",
              description: `Generated ${responseText.length} character response with Google Search for ${leadContext.name}`,
              status: "completed",
              metadata: { 
                name: leadContext.name, 
                responseLength: responseText.length,
                enhanced: true
              }
            });
          }
          
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    logActivity('info', 'Enhanced chat response streaming started', {
      correlationId,
      userId: auth.userId,
      responseLength: responseText.length,
      responseTime: Date.now() - startTime,
      enhanced: true
    });

    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Correlation-ID': correlationId,
        'X-Response-Time': `${Date.now() - startTime}ms`,
        'X-Enhanced': 'true'
      },
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logActivity('error', 'Enhanced chat API error', { 
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