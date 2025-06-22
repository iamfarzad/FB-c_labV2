import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Initialize Gemini with proper error handling
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Initialize ElevenLabs
const elevenLabsClient = process.env.ELEVENLABS_API_KEY 
  ? new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY })
  : null;

// Initialize Supabase
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn('Supabase credentials not configured - real-time features will be disabled');
    return null;
  }
  
  return createClient(url, key);
}

// Usage limits
const AI_USAGE_LIMITS = {
  maxMessagesPerSession: 15,
  maxImageGeneration: 2,
  maxVideoAnalysis: 1,
  maxCodeExecution: 3,
  maxDocumentAnalysis: 2
};

export async function POST(request: NextRequest) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS for CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  try {
    const body = await request.json();
    const action = request.nextUrl.searchParams.get('action') || 'conversationalFlow';
    
    switch (action) {
      case 'conversationalFlow':
        return handleConversationalFlow(body);
      case 'generateImage':
        return handleImageGeneration(body);
      case 'analyzeVideo':
        return handleVideoAnalysis(body);
      case 'analyzeDocument':
        return handleDocumentAnalysis(body);
      case 'executeCode':
        return handleCodeExecution(body);
      case 'analyzeURL':
        return handleURLAnalysis(body);
      case 'leadCapture':
        return handleLeadCapture(body);
      case 'enhancedPersonalization':
        return handleEnhancedPersonalization(body);
      default:
        return handleConversationalFlow(body);
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

async function handleConversationalFlow(body: any) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const {
      prompt,
      currentConversationState = { stage: 'greeting', messages: [] },
      messageCount = 0,
      includeAudio = true
    } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'No prompt provided' }, { status: 400, headers });
    }

    // Check usage limits
    if (messageCount >= AI_USAGE_LIMITS.maxMessagesPerSession) {
      return NextResponse.json({
        success: true,
        data: {
          text: "This AI showcase has reached its demonstration limit. Ready to see the full capabilities in action? Let's schedule your consultation!",
          isLimitReached: true,
          showBooking: true
        }
      }, { headers });
    }

    // Build conversation context
    const userInfo = {
      name: currentConversationState.name,
      email: currentConversationState.email,
      companyInfo: currentConversationState.companyInfo
    };

    // Check if we have API key
    if (!genAI) {
      // Mock response for testing without API key
      const mockResponse = getMockResponse(currentConversationState.stage, prompt, userInfo);
      
      // Broadcast via Supabase
      try {
        const supabase = getSupabase();
        await supabase.channel('ai-showcase')
          .send({
            type: 'broadcast',
            event: 'ai-response',
            payload: {
              text: mockResponse.text,
              audioData: null,
              sources: [],
              sidebarActivity: mockResponse.sidebarActivity,
              conversationState: mockResponse.nextState,
              timestamp: Date.now()
            }
          });
      } catch (error) {
        console.error('Supabase broadcast error:', error);
      }
      
      return NextResponse.json({
        success: true,
        data: {
          text: mockResponse.text,
          sources: [],
          audioData: null,
          audioMimeType: 'audio/mpeg',
          sidebarActivity: mockResponse.sidebarActivity,
          conversationState: mockResponse.nextState
        }
      }, { headers });
    }
    
    // Enhanced system instruction
    const systemPrompt = `You are the F.B/c AI Assistant showcasing advanced AI capabilities for lead generation.

SHOWCASE CAPABILITIES NATURALLY:
- Text generation with personalization
- Real-time insights and analysis
- Structured output for organized responses
- Thinking process transparency
- Dynamic conversational flow

CONVERSATION FLOW:
Stage: ${currentConversationState.stage}
User Info: ${JSON.stringify(userInfo)}

Be engaging, demonstrate AI intelligence, and guide toward consultation booking.
Use their name frequently if provided and show company insights when available.

Current user message: "${prompt}"`;

    // Generate response
    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\n" + prompt }] }]
    });
    const text = result.text;

    // Determine next conversation stage
    const nextState = determineNextStage(currentConversationState, prompt, userInfo);

    // Generate voice if requested
    let audioData = null;
    let sidebarActivity = '';
    
    if (currentConversationState.stage === 'email_collected' && userInfo.email) {
      sidebarActivity = 'company_analysis';
    } else if (includeAudio && text) {
      const voiceResult = await generateVoiceWithElevenLabs(text);
      if (voiceResult) {
        audioData = voiceResult.audioBase64;
        sidebarActivity = 'voice_generation';
      }
    }

    // Broadcast via Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.channel('ai-showcase')
          .send({
            type: 'broadcast',
            event: 'ai-response',
            payload: {
              text,
              audioData,
              sources: [],
              sidebarActivity,
              conversationState: nextState,
              timestamp: Date.now()
            }
          });
      } catch (error) {
        console.error('Supabase broadcast error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        text,
        sources: [],
        audioData,
        audioMimeType: 'audio/mpeg',
        sidebarActivity,
        conversationState: nextState
      }
    }, { headers });
  } catch (error: any) {
    console.error('Conversational flow error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process conversation' },
      { status: 500, headers }
    );
  }
}

async function handleImageGeneration(body: any) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  const { prompt } = body;
  
  if (!prompt) {
    return NextResponse.json({ success: false, error: 'No prompt provided' }, { status: 400, headers });
  }

  try {
    if (!genAI) {
      return NextResponse.json({
        success: true,
        data: {
          text: `Generated business visualization concept: "${prompt}"`,
          description: 'Mock image generation description for demo purposes',
          note: 'Image generation description created for business presentation',
          sidebarActivity: 'image_generation'
        }
      }, { headers });
    }
    
    const imagePrompt = `Create a detailed visual description for business concept: "${prompt}"
    
    Describe the scene with:
    - Professional business setting
    - Clear visual metaphors for AI/technology
    - Corporate color scheme
    - Specific elements that would resonate with business decision makers`;

    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: [{ role: 'user', parts: [{ text: imagePrompt }] }]
    });
    const text = result.text;

    // Broadcast sidebar update
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.channel('ai-showcase')
          .send({
            type: 'broadcast',
            event: 'sidebar-update',
            payload: {
              activity: 'image_generation',
              message: '🎨 Generating business visualization...',
              timestamp: Date.now()
            }
          });
      } catch (error) {
        console.error('Supabase broadcast error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        text: `Generated business visualization concept: "${prompt}"`,
        description: text,
        note: 'Image generation description created for business presentation',
        sidebarActivity: 'image_generation'
      }
    }, { headers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate image' },
      { status: 500, headers }
    );
  }
}

async function handleVideoAnalysis(body: any) {
  const { videoUrl, prompt = 'Analyze this video for business insights' } = body;
  
  if (!videoUrl) {
    return NextResponse.json({ success: false, error: 'No video URL provided' }, { status: 400 });
  }

  // Mock implementation for now
  return NextResponse.json({
    success: true,
    data: {
      text: `Video analysis for ${videoUrl}: This would analyze the video content and provide business insights, key topics discussed, and actionable recommendations.`,
      videoUrl,
      analysisType: 'business_insights',
      sidebarActivity: 'video_analysis'
    }
  });
}

async function handleDocumentAnalysis(body: any) {
  const { documentData, prompt = 'Analyze this document' } = body;
  
  if (!documentData) {
    return NextResponse.json({ success: false, error: 'No document provided' }, { status: 400 });
  }

  // Mock implementation
  return NextResponse.json({
    success: true,
    data: {
      text: 'Document analysis would provide executive summary, key insights, and recommendations.',
      sidebarActivity: 'document_analysis'
    }
  });
}

async function handleCodeExecution(body: any) {
  const { prompt } = body;
  
  try {
    if (!genAI) {
      return NextResponse.json({
        success: true,
        data: {
          text: `Mock code execution for business problem: "${prompt}"\n\nThis would provide working code examples and business value explanations.`,
          sidebarActivity: 'code_execution',
          note: 'Code execution for business problem solving'
        }
      });
    }
    
    const codePrompt = `Create and explain code to solve this business problem: "${prompt}"
    
    Provide:
    1. Working code example
    2. Business value explanation
    3. Implementation suggestions`;

    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: [{ role: 'user', parts: [{ text: codePrompt }] }]
    });
    const text = result.text;

    return NextResponse.json({
      success: true,
      data: {
        text,
        sidebarActivity: 'code_execution',
        note: 'Code execution for business problem solving'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute code' },
      { status: 500 }
    );
  }
}

async function handleURLAnalysis(body: any) {
  const { urlContext } = body;
  
  if (!urlContext) {
    return NextResponse.json({ success: false, error: 'No URL provided' }, { status: 400 });
  }

  // Mock implementation
  return NextResponse.json({
    success: true,
    data: {
      text: `Website analysis for ${urlContext}: Would provide technology stack analysis, AI opportunities, and optimization recommendations.`,
      urlContext,
      sidebarActivity: 'url_analysis'
    }
  });
}

async function handleLeadCapture(body: any) {
  const { currentConversationState } = body;
  
  if (!currentConversationState?.name || !currentConversationState?.email) {
    return NextResponse.json(
      { success: false, error: 'Missing required lead information' },
      { status: 400 }
    );
  }

  try {
    if (!genAI) {
      const summary = `Professional AI Consultation Summary for ${currentConversationState.name}

Executive Summary:
Based on our conversation, you've explored various AI capabilities that could benefit your business.

AI Capabilities Demonstrated:
- Conversational AI for customer engagement
- Real-time data analysis and insights
- Automated content generation

Business Opportunities:
- Streamline customer support with AI chatbots
- Automate repetitive tasks and processes
- Enhance decision-making with AI insights

Recommended Next Steps:
1. Schedule a detailed consultation to assess your specific needs
2. Develop a custom AI implementation roadmap
3. Start with a pilot project to demonstrate ROI`;

      const leadScore = calculateLeadScore(currentConversationState);
      
      return NextResponse.json({
        success: true,
        data: {
          summary,
          leadScore,
          emailContent: generateEmailContent(
            (currentConversationState.name as string) || 'Valued Customer',
            (currentConversationState.email as string) || '',
            summary,
            leadScore
          )
        }
      });
    }
    
    const summaryPrompt = `Create a professional AI consultation summary for ${currentConversationState.name}.
    
    Based on conversation: ${JSON.stringify(currentConversationState.messages)}
    
    Include:
    1. Executive Summary
    2. AI Capabilities Demonstrated
    3. Business Opportunities
    4. Recommended Next Steps`;

    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }]
    });
    const summary = result.text;

    // Calculate lead score
    const leadScore = calculateLeadScore(currentConversationState);

    // Store in Supabase (if configured)
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('lead_summaries').insert({
          name: currentConversationState.name,
          email: currentConversationState.email,
          company_name: currentConversationState.companyInfo?.name,
          conversation_summary: summary || '',
          consultant_brief: summary || '',
          lead_score: leadScore,
          ai_capabilities_shown: extractCapabilitiesShown(currentConversationState)
        });
      } catch (error) {
        console.error('Failed to store lead:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        leadScore,
        emailContent: generateEmailContent(
          currentConversationState.name || 'Valued Customer',
          currentConversationState.email || '',
          summary || '',
          leadScore
        )
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to capture lead' },
      { status: 500 }
    );
  }
}

async function handleEnhancedPersonalization(body: any) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { name, email, userMessage, conversationHistory } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required for personalization' },
        { status: 400, headers }
      );
    }

    if (!genAI) {
      // Mock personalized response
      return NextResponse.json({
        success: true,
        data: {
          personalizedResponse: `Based on your background, I can see you're working in an innovative field. How can I help you explore AI solutions for your business today?`,
          researchSummary: 'Mock research completed',
          audioData: null
        }
      }, { headers });
    }

    // Enhanced prompt with contact research (like the example you provided)
    const researchPrompt = `I need you to search the name ${name} on google and linkedin using email ${email}
then summarize their background and industry, and write quick bullet points pain points in their industry and how LLM can automate most of it.

Based on this research, create a personalized greeting that:
1. Shows I understand their background
2. Highlights relevant AI opportunities for their industry
3. Keeps it conversational and helpful
4. Mentions 2-3 specific ways AI could help their business

User's first message: "${userMessage}"

Format the response as a natural, personalized greeting that shows I've done my homework.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17', // Use the latest model for enhanced research
      contents: [{ 
        role: 'user', 
        parts: [{ text: researchPrompt }] 
      }],
      config: {
        thinkingConfig: {
          thinkingBudget: -1, // Allow unlimited thinking
        },
        tools: [
          { urlContext: {} }, // Enable web search
        ],
        responseMimeType: 'text/plain',
      }
    });

    const personalizedResponse = result.text || 'Based on your background, I can help you explore AI solutions for your business today.';

    // Generate voice response if available
    let audioData = null;
    const voiceResult = await generateVoiceWithElevenLabs(personalizedResponse);
    if (voiceResult) {
      audioData = voiceResult.audioBase64;
    }

    // Broadcast research completion via Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.channel('ai-showcase')
          .send({
            type: 'broadcast',
            event: 'sidebar-update',
            payload: {
              activity: 'contact_research',
              message: `🔍 Research completed for ${name}`,
              timestamp: Date.now()
            }
          });
      } catch (error) {
        console.error('Supabase broadcast error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        personalizedResponse,
        researchSummary: `Contact research completed for ${name}`,
        audioData
      }
    }, { headers });

  } catch (error: any) {
    console.error('Enhanced personalization error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to personalize conversation' },
      { status: 500, headers }
    );
  }
}

// Helper functions
function determineNextStage(currentState: any, userMessage: string, userInfo: any) {
  const { stage } = currentState;
  
  switch (stage) {
    case 'greeting':
      if (userMessage.length > 0 && !userMessage.includes('@')) {
        return { ...currentState, stage: 'email_request', messagesInStage: 0 };
      }
      break;
    case 'email_request':
      if (userMessage.includes('@')) {
        return { ...currentState, stage: 'email_collected', messagesInStage: 0, email: userMessage };
      }
      break;
    case 'email_collected':
      return { ...currentState, stage: 'discovery', messagesInStage: currentState.messagesInStage + 1 };
    case 'discovery':
      if (currentState.messagesInStage > 3) {
        return { ...currentState, stage: 'capability_showcase', messagesInStage: 0 };
      }
      break;
    case 'capability_showcase':
      if (currentState.messages?.length > 10) {
        return { ...currentState, stage: 'solution_positioning', messagesInStage: 0 };
      }
      break;
  }
  
  return { ...currentState, messagesInStage: (currentState.messagesInStage || 0) + 1 };
}

function calculateLeadScore(conversationState: any): number {
  let score = 0;
  
  // Has email
  if (conversationState.email) score += 20;
  
  // Company email (not personal)
  const domain = conversationState.email?.split('@')[1] || '';
  if (!['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
    score += 20;
  }
  
  // Engagement level
  if (conversationState.messages?.length > 8) score += 15;
  if (conversationState.messages?.length > 15) score += 10;
  
  // Capabilities explored
  const capabilities = extractCapabilitiesShown(conversationState);
  score += capabilities.length * 10;
  
  return Math.min(score, 100);
}

function extractCapabilitiesShown(conversationState: any): string[] {
  const capabilities = new Set<string>();
  const messages = JSON.stringify(conversationState.messages || []).toLowerCase();
  
  if (messages.includes('image')) capabilities.add('Image Generation');
  if (messages.includes('video')) capabilities.add('Video Analysis');
  if (messages.includes('document')) capabilities.add('Document Processing');
  if (messages.includes('code')) capabilities.add('Code Execution');
  if (messages.includes('website') || messages.includes('url')) capabilities.add('URL Analysis');
  if (messages.includes('voice') || messages.includes('audio')) capabilities.add('Voice Generation');
  
  return Array.from(capabilities);
}

function generateEmailContent(name: string, email: string, summary: string, leadScore: number): string {
  if (!name || !email || !summary) {
    return '';
  }
  
  return `Hi ${name},

Thank you for experiencing F.B/c's AI showcase! Based on our conversation, here's your personalized AI consultation summary:

${summary}

Your AI Readiness Score: ${leadScore}/100

Ready to implement these AI solutions in your business? Let's schedule a free strategy session to create your custom roadmap.

Best regards,
Farzad Bayat
F.B/c AI Consulting`;
}

// Mock responses for testing without API key
function getMockResponse(stage: string, prompt: string, userInfo: any) {
  const responses: Record<string, any> = {
    greeting: {
      text: "Welcome to F.B/c AI Showcase! I'm here to demonstrate how AI can transform your business. I'm Farzad's AI assistant, and I'll be showing you some amazing capabilities today. What's your name?",
      sidebarActivity: 'greeting',
      nextState: { stage: 'email_request', messagesInStage: 0 }
    },
    email_request: {
      text: `Nice to meet you! To personalize this experience and send you a summary of our conversation, could you please share your email address?`,
      sidebarActivity: 'collecting_info',
      nextState: { stage: 'email_collected', messagesInStage: 0 }
    },
    email_collected: {
      text: `Perfect! I'm analyzing your company domain to provide relevant insights. Let me show you what AI can do for your business. What's your biggest business challenge right now?`,
      sidebarActivity: 'company_analysis',
      nextState: { stage: 'discovery', messagesInStage: 0 }
    },
    discovery: {
      text: `That's interesting! AI can definitely help with that. Let me demonstrate some capabilities that could address your needs. Would you like to see image generation, document analysis, or code execution first?`,
      sidebarActivity: 'capability_selection',
      nextState: { stage: 'capability_showcase', messagesInStage: 0 }
    },
    capability_showcase: {
      text: `Excellent choice! Here's how AI can help solve your business challenges. [This is a mock response - with real API key, I would provide detailed AI-powered insights]`,
      sidebarActivity: 'demonstrating',
      nextState: { stage: 'solution_positioning', messagesInStage: 0 }
    },
    solution_positioning: {
      text: `Based on what we've discussed, I can see several ways AI could transform your operations. Would you like to schedule a consultation to create a custom AI implementation roadmap for your business?`,
      sidebarActivity: 'closing',
      nextState: { stage: 'summary_generation', messagesInStage: 0 }
    }
  };
  
  const response = responses[stage] || responses.greeting;
  
  // Update with current conversation state
  return {
    ...response,
    nextState: {
      ...response.nextState,
      name: userInfo?.name,
      email: userInfo?.email,
      companyInfo: userInfo?.companyInfo
    }
  };
}

// Enhanced voice generation function
async function generateVoiceWithElevenLabs(text: string): Promise<{ audioBase64: string } | null> {
  if (!elevenLabsClient) {
    console.warn('ElevenLabs not configured - voice generation disabled');
    return null;
  }

  try {
    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00tcm4tlvdq8ikwam';
    
    const audioStream = await elevenLabsClient.textToSpeech.convert(VOICE_ID, {
      text,
      modelId: 'eleven_turbo_v2_5',
      voiceSettings: {
        stability: 0.8,
        similarityBoost: 0.9,
        style: 0.4,
        useSpeakerBoost: true
      }
    });

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    const reader = audioStream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }
    
    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString('base64');
    
    return { audioBase64 };
  } catch (error) {
    console.error('Voice generation error:', error);
    return null;
  }
} 