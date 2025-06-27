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
      case 'generateVideoSpec':
        return handleVideoAnalysis(body);
      case 'generateCodeFromSpec':
        return handleCodeExecution(body);
      case 'analyzeWebcamFrame':
        return handleWebcamAnalysis(body);
      case 'realTimeConversation':
        return handleRealTimeConversation(body);
      case 'analyzeScreenShare':
        return handleScreenShareAnalysis(body);
      case 'generateSpec':
        return handleGenerateSpec(body);
      case 'generateCode':
        return handleGenerateCode(body);
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
        if (supabase) {
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
        }
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
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const { videoUrl, prompt = 'Analyze this video for business insights', modelName = 'gemini-2.5-flash' } = body;
  
  if (!videoUrl && !prompt) {
    return NextResponse.json({ success: false, error: 'No video URL or prompt provided' }, { status: 400, headers });
  }

  try {
    // Handle video spec generation
    if (prompt && prompt.includes('pedagogist and product designer')) {
      if (!genAI) {
        const mockSpec = `Build an interactive learning app to help users understand the key concepts from this video.

SPECIFICATIONS:
1. The app must feature an interactive interface that engages users with the video content.
2. Include visual elements that reinforce the main concepts discussed.
3. Provide interactive exercises or quizzes to test understanding.
4. Create a progress tracking system to show learning advancement.
5. Include clear explanations and examples related to the video topic.

The app should be educational, engaging, and help users master the video's key ideas through hands-on interaction.`;

        return NextResponse.json({
          success: true,
          data: {
            text: JSON.stringify({ spec: mockSpec })
          }
        }, { headers });
      }

                    const result = await genAI.models.generateContent({
         model: modelName,
         contents: [{ role: 'user', parts: [{ text: prompt + (videoUrl ? `\n\nVideo URL: ${videoUrl}` : '') }] }]
       });

      return NextResponse.json({
        success: true,
        data: { text: result.text }
      }, { headers });
    }

    // Handle code generation from spec
    if (prompt && !videoUrl) {
      if (!genAI) {
        const mockCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Learning App</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        .header { text-align: center; color: #333; margin-bottom: 30px; }
        .interactive-section { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { background: #2196f3; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        .button:hover { background: #1976d2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Interactive Learning App</h1>
            <p>Learn through interactive experiences</p>
        </div>
        <div class="interactive-section">
            <h2>Interactive Demo</h2>
            <p>This is a demonstration of an interactive learning application.</p>
            <button class="button" onclick="alert('Interactive feature activated!')">Try Interactive Feature</button>
        </div>
    </div>
</body>
</html>`;

        return NextResponse.json({
          success: true,
          data: {
            text: `\`\`\`html\n${mockCode}\n\`\`\``
          }
        }, { headers });
      }

      const result = await genAI.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      return NextResponse.json({
        success: true,
        data: { text: result.text }
      }, { headers });
    }

    // Regular video analysis
    return NextResponse.json({
      success: true,
      data: {
        text: `Video analysis for ${videoUrl}: This would analyze the video content and provide business insights, key topics discussed, and actionable recommendations.`,
        videoUrl,
        analysisType: 'business_insights',
        sidebarActivity: 'video_analysis'
      }
    }, { headers });
  } catch (error: any) {
    console.error('Video analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process video' },
      { status: 500, headers }
    );
  }
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
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash', // Use the latest model for enhanced research
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
async function handleGenerateVideoSpec(body: any) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const { videoUrl, prompt, modelName = 'gemini-2.5-flash' } = body;
  
  if (!videoUrl) {
    return NextResponse.json({ success: false, error: 'No video URL provided' }, { status: 400, headers });
  }

  try {
    if (!genAI) {
      // Mock response for development
      const mockSpec = `Build an interactive learning app to help users understand the key concepts from this video.

SPECIFICATIONS:
1. The app must feature an interactive interface that engages users with the video content.
2. Include visual elements that reinforce the main concepts discussed.
3. Provide interactive exercises or quizzes to test understanding.
4. Create a progress tracking system to show learning advancement.
5. Include clear explanations and examples related to the video topic.

The app should be educational, engaging, and help users master the video's key ideas through hands-on interaction.`;

      return NextResponse.json({
        success: true,
        data: {
          text: JSON.stringify({ spec: mockSpec })
        }
      }, { headers });
    }

    // Use the video URL to generate a spec
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          {
            fileData: {
              mimeType: 'video/mp4',
              fileUri: videoUrl
            }
          }
        ]
      }]
    });

    const text = result.text;

    return NextResponse.json({
      success: true,
      data: { text }
    }, { headers });
  } catch (error: any) {
    console.error('Video spec generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate video spec' },
      { status: 500, headers }
    );
  }
}

async function handleGenerateCodeFromSpec(body: any) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const { prompt, modelName = 'gemini-2.5-flash' } = body;
  
  if (!prompt) {
    return NextResponse.json({ success: false, error: 'No spec provided' }, { status: 400, headers });
  }

  try {
    if (!genAI) {
      // Mock response for development
      const mockCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Learning App</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        .header { text-align: center; color: #333; margin-bottom: 30px; }
        .interactive-section { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { background: #2196f3; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        .button:hover { background: #1976d2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Interactive Learning App</h1>
            <p>Learn through interactive experiences</p>
        </div>
        <div class="interactive-section">
            <h2>Interactive Demo</h2>
            <p>This is a demonstration of an interactive learning application.</p>
            <button class="button" onclick="alert('Interactive feature activated!')">Try Interactive Feature</button>
        </div>
    </div>
</body>
</html>`;

      return NextResponse.json({
        success: true,
        data: {
          text: `\`\`\`html\n${mockCode}\n\`\`\``
        }
      }, { headers });
    }

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = result.text;

    return NextResponse.json({
      success: true,
      data: { text }
    }, { headers });
  } catch (error: any) {
    console.error('Code generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate code from spec' },
      { status: 500, headers }
    );
  }
}

async function handleRealTimeConversation(body: any) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const { message, conversationHistory = [], includeAudio = true } = body;
  
  if (!message) {
    return NextResponse.json({ success: false, error: 'No message provided' }, { status: 400, headers });
  }

  try {
    if (!genAI) {
      // Mock response for testing without API key
      const mockResponses = [
        "That's really interesting! Tell me more about that.",
        "I understand what you're saying. How does that make you feel?",
        "Great point! I'd love to hear your thoughts on how we could implement that.",
        "That's a fascinating perspective. What led you to that conclusion?",
        "I can see why that would be important to you. Let's explore that further."
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      return NextResponse.json({
        success: true,
        data: {
          text: randomResponse,
          audioData: null, // Would include base64 audio in real implementation
          conversationTurn: 'ai'
        }
      }, { headers });
    }

    // Build conversation context from history
    const conversationContext = conversationHistory
      .slice(-10) // Keep last 10 turns for context
      .map((turn: any) => `${turn.type === 'user' ? 'User' : 'AI'}: ${turn.text}`)
      .join('\n');

    const systemPrompt = `You are an AI assistant engaged in a real-time voice conversation. 

Context from recent conversation:
${conversationContext}

Current user message: "${message}"

Respond naturally and conversationally. Keep responses concise but engaging, as this is a real-time voice chat.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
    });
    
    const text = result.text;

    // Generate voice if requested
    let audioData = null;
    if (includeAudio && text) {
      const voiceResult = await generateVoiceWithElevenLabs(text);
      if (voiceResult) {
        audioData = voiceResult.audioBase64;
      }
    }

    // Broadcast via Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.channel('ai-showcase')
          .send({
            type: 'broadcast',
            event: 'realtime-conversation',
            payload: {
              message: text,
              audioData,
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
        audioData,
        conversationTurn: 'ai'
      }
    }, { headers });
  } catch (error: any) {
    console.error('Real-time conversation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process real-time conversation' },
      { status: 500, headers }
    );
  }
}

async function handleScreenShareAnalysis(body: any) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const { imageData, prompt = 'Analyze this screen share' } = body;
  
  if (!imageData) {
    return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400, headers });
  }

  try {
    if (!genAI) {
      // Mock response for testing without API key
      const mockAnalysis = `I can see a professional desktop environment with multiple applications open. There appears to be a development environment with code editor, browser windows, and possibly design tools. This looks like someone working on a web development project with a focus on user interface design. The workflow suggests active development and testing of web applications.`;
      
      return NextResponse.json({
        success: true,
        data: {
          text: mockAnalysis,
          confidence: 'high',
          sidebarActivity: 'screen_analysis'
        }
      }, { headers });
    }

    // Create image part for Gemini
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg'
      }
    };

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ 
        role: 'user', 
        parts: [
          { text: prompt },
          imagePart
        ] 
      }]
    });
    
    const text = result.text;

    // Broadcast via Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.channel('ai-showcase')
          .send({
            type: 'broadcast',
            event: 'screen-analysis',
            payload: {
              analysis: text,
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
        confidence: 'high',
        sidebarActivity: 'screen_analysis'
      }
    }, { headers });
  } catch (error: any) {
    console.error('Screen share analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze screen share' },
      { status: 500, headers }
    );
  }
}

async function handleWebcamAnalysis(body: any) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const { imageData, prompt = 'Analyze what you see in this webcam frame' } = body;
  
  if (!imageData) {
    return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400, headers });
  }

  try {
    if (!genAI) {
      // Mock response for testing without API key
      const mockAnalysis = `I can see a professional workspace with a person at their desk. The lighting appears natural, suggesting a daytime work environment. This appears to be a typical business consultation setting where someone is actively engaged with their computer, likely reviewing business materials or participating in a video call.`;
      
      return NextResponse.json({
        success: true,
        data: {
          text: mockAnalysis,
          confidence: 'high',
          sidebarActivity: 'webcam_analysis'
        }
      }, { headers });
    }

    // Create image part for Gemini
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg'
      }
    };

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ 
        role: 'user', 
        parts: [
          { text: prompt },
          imagePart
        ] 
      }]
    });
    
    const text = result.text;

    // Broadcast via Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.channel('ai-showcase')
          .send({
            type: 'broadcast',
            event: 'webcam-analysis',
            payload: {
              analysis: text,
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
        confidence: 'high',
        sidebarActivity: 'webcam_analysis'
      }
    }, { headers });
  } catch (error: any) {
    console.error('Webcam analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze webcam frame' },
      { status: 500, headers }
    );
  }
}

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

async function handleGenerateSpec(body: any) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const { videoUrl } = body;
  
  if (!videoUrl) {
    return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
  }

  const prompt = `You are a pedagogist and product designer with deep expertise in crafting engaging learning experiences via interactive web apps.

Examine the contents of the attached video. Then, write a detailed and carefully considered spec for an interactive web app designed to complement the video and reinforce its key idea or ideas. The recipient of the spec does not have access to the video, so the spec must be thorough and self-contained (the spec must not mention that it is based on a video).

The goal of the app is to enhance understanding through simple and playful design. The provided spec should not be overly complex, i.e., a junior web developer should be able to implement it in a single html file (with all styles and scripts inline). Most importantly, the spec must clearly outline the core mechanics of the app, and those mechanics must be highly effective in reinforcing the given video's key idea(s).

Provide the result as a JSON object containing a single field called "spec", whose value is the spec for the web app.`;

     if (!genAI) {
     return NextResponse.json({ error: 'Gemini API not configured' }, { status: 500 });
   }

  // For now, simulate spec generation since we don't have video processing
  // In production, you would use Gemini's video input capabilities
  const mockVideoAnalysis = `
Based on the video content, create an interactive learning app with the following specifications:

SPECIFICATIONS:
1. The app must feature an interactive quiz interface that tests understanding of the key concepts.
2. Include visual demonstrations with interactive elements that users can manipulate.
3. Provide immediate feedback on user interactions to reinforce learning.
4. Use animations to illustrate complex concepts in a simple way.
5. Include a progress tracker to show learning advancement.
6. The interface must be clean, modern, and engaging.
7. Support both desktop and mobile devices with responsive design.
8. Include sound effects for positive reinforcement (optional, with mute toggle).

The app must be fully responsive and function properly on both desktop and mobile. Provide the code as a single, self-contained HTML document. All styles and scripts must be inline.`;

     try {
     const result = await genAI.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: [{ role: 'user', parts: [{ text: prompt + '\n\nVideo URL: ' + videoUrl + '\n\n' + mockVideoAnalysis }] }]
     });
          const responseText = result.text || '';
     
     // Parse the JSON response
     let spec;
     try {
       const jsonMatch = responseText.match(/\{[\s\S]*"spec"[\s\S]*\}/);
       if (jsonMatch) {
         const parsed = JSON.parse(jsonMatch[0]);
         spec = parsed.spec;
       } else {
         spec = responseText;
       }
     } catch (e) {
       spec = responseText;
     }

    return NextResponse.json({ spec });
  } catch (error: any) {
    console.error('Spec generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate spec' },
      { status: 500 }
    );
  }
}

async function handleGenerateCode(body: any) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const { spec } = body;
  
  if (!spec) {
    return NextResponse.json({ error: 'Spec is required' }, { status: 400 });
  }

     const fullPrompt = spec + `\n\nThe app must be fully responsive and function properly on both desktop and mobile. Provide the code as a single, self-contained HTML document. All styles and scripts must be inline. Encase the code between \`\`\`html and \`\`\` for easy parsing.`;

   if (!genAI) {
     return NextResponse.json({ error: 'Gemini API not configured' }, { status: 500 });
   }

     try {
     const result = await genAI.models.generateContent({
       model: 'gemini-2.5-pro',
       contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
     });
     const responseText = result.text || '';
    
    // Extract HTML code from the response
    let code = responseText;
    const htmlMatch = responseText.match(/```html\s*([\s\S]*?)\s*```/);
    if (htmlMatch) {
      code = htmlMatch[1];
    } else {
      // Try to extract between any code blocks
      const codeMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        code = codeMatch[1];
      }
    }

    return NextResponse.json({ code });
  } catch (error: any) {
    console.error('Code generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate code' },
      { status: 500 }
    );
  }
} 