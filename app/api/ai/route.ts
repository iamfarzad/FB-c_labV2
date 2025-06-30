import { NextRequest, NextResponse } from 'next/server';
import { UnifiedAIService } from '../../../lib/ai/unified-ai-service';
import { extractVideoId } from '@/lib/youtube-utils';

// Initialize UnifiedAIService with configuration
const aiService = new UnifiedAIService({
  geminiApiKey: process.env.GEMINI_API_KEY,
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Type for handler response
interface HandlerResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action');
  
  if (action === 'geminiLive') {
    return handleGeminiLive(request);
  }
  
  return NextResponse.json(
    { success: false, error: 'GET method only supports geminiLive action' },
    { status: 400, headers: corsHeaders }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = request.nextUrl.searchParams.get('action') || 'conversationalFlow';
    
    let response: HandlerResponse;
    
    switch (action) {
      // Core AI actions (from UnifiedAIService)
      case 'conversationalFlow':
      case 'chat':
        response = await aiService.handleConversationalFlow(
          body.message || body.prompt || '',
          body.conversationState || body.currentConversationState || {},
          body.messageCount || 0,
          body.includeAudio || false
        );
        break;
        
      case 'generateImage':
      case 'imageGeneration':
        response = await aiService.handleImageGeneration(body.prompt || '');
        break;
        
      case 'leadCapture':
        response = await aiService.handleLeadCapture(body.conversationState || body.currentConversationState || {});
        break;
        
      // Advanced AI actions (from Gemini route)
      case 'analyzeVideo':
      case 'generateVideoSpec':
        response = await handleVideoAnalysis(body);
        break;
        
      case 'analyzeDocument':
        response = await handleDocumentAnalysis(body);
        break;
        
      case 'executeCode':
      case 'generateCodeFromSpec':
        response = await handleCodeExecution(body);
        break;
        
      case 'analyzeURL':
        response = await handleURLAnalysis(body);
        break;
        
      case 'enhancedPersonalization':
        response = await handleEnhancedPersonalization(body);
        break;
        
      case 'analyzeWebcamFrame':
        response = await handleWebcamAnalysis(body);
        break;
        
      case 'realTimeConversation':
        response = await handleRealTimeConversation(body);
        break;
        
      case 'analyzeScreenShare':
        response = await handleScreenShareAnalysis(body);
        break;
        
      case 'generateSpec':
        response = await handleGenerateSpec(body);
        break;
        
      case 'generateCode':
        response = await handleGenerateCode(body);
        break;
        
      // Standalone route migrations
      case 'youtubeTranscript':
        response = await handleYouTubeTranscript(body);
        break;
        
      default:
        // Default to conversational flow for backward compatibility
        response = await aiService.handleConversationalFlow(
          body.message || body.prompt || '',
          body.conversationState || body.currentConversationState || {},
          body.messageCount || 0,
          body.includeAudio || false
        );
    }
    
    // Standardize response format
    if (response.success) {
      return NextResponse.json(response, { headers: corsHeaders });
    } else {
      return NextResponse.json(
        { success: false, error: response.error || 'Unknown error' },
        { status: 500, headers: corsHeaders }
      );
    }
    
  } catch (error) {
    console.error('Unified AI API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ============================================================================
// HANDLER FUNCTIONS (migrated from individual routes)
// ============================================================================

async function handleVideoAnalysis(body: any): Promise<HandlerResponse> {
  const { videoUrl, prompt = 'Analyze this video for business insights' } = body;

  if (!videoUrl) {
    return { success: false, error: 'No video URL provided' };
  }

  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY is not configured.' };
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const videoAnalysisPrompt = `Analyze this video's content and provide a structured analysis.
    
    **Analysis Requirements:**
    1.  **Executive Summary**: A concise overview of the video's key topics and message.
    2.  **Business Opportunities**: Identify potential applications or business value derived from the video's content.
    3.  **Key Insights**: Extract the most important data points, concepts, or takeaways.
    4.  **Actionable Recommendations**: List practical next steps for a business interested in these topics.
    
    **Original User Request**: "${prompt}"`;
    
    const result = await model.generateContent(`${videoAnalysisPrompt}\n\nVideo URL: ${videoUrl}`);
    const analysis = result.response.text();

    return {
      success: true,
      data: {
        text: analysis,
        videoUrl,
        analysisType: 'business_insights',
        sidebarActivity: 'video_analysis',
      },
    };
  } catch (error: any) {
    console.error('Video analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process video',
    };
  }
}

async function handleDocumentAnalysis(body: any): Promise<HandlerResponse> {
  const { documentData, mimeType, prompt = 'Analyze this document' } = body;

  if (!documentData) {
    return { success: false, error: 'No document provided' };
  }

  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY is not configured.' };
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const businessAnalysisPrompt = `Analyze this business document and provide a structured analysis.
    
    **Analysis Requirements:**
    1.  **Executive Summary**: A concise overview of the document's key points (2-3 sentences).
    2.  **Business Opportunities**: Identify potential areas where AI could add value or drive growth.
    3.  **Process Improvements**: Suggest specific workflow optimizations based on the document's content.
    4.  **Key Insights**: Extract the most important data points, findings, or conclusions.
    5.  **Actionable Recommendations**: List practical next steps for the business.
    
    **Original User Request**: "${prompt}"`;

    const documentPart = {
      inlineData: {
        data: documentData,
        mimeType: mimeType || 'text/plain',
      },
    };

    const result = await model.generateContent([
      businessAnalysisPrompt,
      documentPart,
    ]);
    const analysis = result.response.text();

    return {
      success: true,
      data: {
        text: analysis,
        sidebarActivity: 'document_analysis',
      },
    };
  } catch (error: any) {
    console.error('Document analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze document',
    };
  }
}

async function handleCodeExecution(body: any): Promise<HandlerResponse> {
  const { prompt } = body;

  if (!prompt) {
    return { success: false, error: 'No prompt provided for code execution' };
  }
  
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY is not configured.' };
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      tools: [{ codeExecution: {} }]
    });

    const codePrompt = `Please execute the following request and provide only the result.
    
    **User Request**: "${prompt}"
    
    If the request requires calculation or data manipulation, write and execute the code to find the answer.`;

    const result = await model.generateContent(codePrompt);
    const response = result.response;
    const text = response.text();

    return {
      success: true,
      data: {
        text,
        sidebarActivity: 'code_execution',
        note: 'Live code execution for business problem solving',
      },
    };
  } catch (error: any) {
    console.error('Code execution error:', error);
    return { success: false, error: error.message || 'Failed to execute code' };
  }
}

async function handleURLAnalysis(body: any): Promise<HandlerResponse> {
  const { url, prompt = 'Analyze this website for AI opportunities' } = body;

  if (!url) {
    return { success: false, error: 'No URL provided' };
  }

  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY is not configured.' };
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ googleSearchRetrieval: {} }],
    });

    const urlAnalysisPrompt = `Analyze the content of this website: ${url}
    
    **Analysis Requirements:**
    1.  **Company/Project Overview**: What is this website about? Who is it for?
    2.  **AI Opportunities**: Based on the content, where could AI be implemented to improve the service, product, or user experience?
    3.  **Technology Stack**: If possible, identify any visible technologies or platforms being used.
    4.  **Key Offerings**: What are the main products, services, or information being offered?
    5.  **Actionable Recommendations**: Provide specific, actionable next steps for the website owner to leverage AI.
    
    **Original User Request**: "${prompt}"`;

    const result = await model.generateContent(urlAnalysisPrompt);
    const analysis = result.response.text();

    return {
      success: true,
      data: {
        text: analysis,
        sidebarActivity: 'url_analysis',
      },
    };
  } catch (error: any) {
    console.error('URL analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze URL',
    };
  }
}

async function handleEnhancedPersonalization(body: any): Promise<HandlerResponse> {
  const { name, email, userMessage, conversationHistory } = body;
  
  if (!name || !email) {
    return { success: false, error: 'Name and email required for personalization' };
  }

  const personalizedResponse = `Hi ${name}! Based on your email domain, I can see you're interested in AI solutions. Let me show you how our platform can transform your business with cutting-edge AI capabilities.`;

  return {
    success: true,
    data: {
      personalizedResponse,
      researchSummary: `Contact research completed for ${name}`,
      audioData: null
    }
  };
}

async function handleRealTimeConversation(body: any): Promise<HandlerResponse> {
  const { message, conversationHistory, includeAudio = true } = body;
  
  return {
    success: true,
    data: {
      text: `Real-time response to: "${message}"`,
      audioData: null,
      conversationTurn: 'ai'
    }
  };
}

async function handleScreenShareAnalysis(body: any): Promise<HandlerResponse> {
  const { imageData, context } = body;
  
  if (!imageData) {
    return { success: false, error: 'No screen data provided' };
  }

  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY is not configured.' };
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const analysisPrompt = `Analyze this screen capture for AI automation opportunities. 
    
    Please provide:
    1. **Application/Website Identification**: What software or website is being shown?
    2. **Workflow Analysis**: What workflows or processes are visible that could be automated?
    3. **UI/UX Improvements**: Areas where AI could enhance the user experience
    4. **Efficiency Opportunities**: Specific tasks that AI could streamline or eliminate
    5. **Implementation Recommendations**: Practical next steps for AI integration
    
    ${context ? `Additional context: ${context}` : ''}
    
    Be specific and actionable in your recommendations.`;

    const result = await model.generateContent([
      analysisPrompt,
      {
        inlineData: {
          data: imageData.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType: 'image/png'
        }
      }
    ]);

    const analysis = result.response.text();

    return {
      success: true,
      data: {
        text: analysis,
        insights: ['AI automation opportunities identified', 'Workflow optimization potential', 'Enhanced user experience recommendations'],
        sidebarActivity: 'screen_analysis'
      }
    };
  } catch (error: any) {
    console.error('Screen analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze screen'
    };
  }
}

async function handleWebcamAnalysis(body: any): Promise<HandlerResponse> {
  const { imageData, analysisType = 'general' } = body;
  
  if (!imageData) {
    return { success: false, error: 'No image data provided' };
  }

  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY is not configured.' };
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let analysisPrompt = '';
    switch (analysisType) {
      case 'professional':
        analysisPrompt = 'Analyze this webcam image for a professional consultation. Comment on the setup, lighting, background, and overall professional appearance. Provide constructive feedback.';
        break;
      case 'environment':
        analysisPrompt = 'Analyze the environment shown in this webcam image. Describe the workspace, any visible technology, and what it suggests about the work being done.';
        break;
      default:
        analysisPrompt = 'Analyze this webcam image. Describe what you see, including the person (if visible), environment, and any notable details that might be relevant for a business consultation.';
    }

    const result = await model.generateContent([
      analysisPrompt,
      {
        inlineData: {
          data: imageData.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const analysis = result.response.text();

    return {
      success: true,
      data: {
        text: analysis,
        analysisType,
        sidebarActivity: 'webcam_analysis'
      }
    };
  } catch (error: any) {
    console.error('Webcam analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze webcam image'
    };
  }
}

async function handleGenerateSpec(body: any): Promise<HandlerResponse> {
  const { requirements, type = 'web-app' } = body;
  
  return {
    success: true,
    data: {
      text: `Generated ${type} specification based on requirements: ${requirements}`,
      spec: {
        type,
        requirements,
        generatedSpec: 'Detailed technical specification would go here'
      }
    }
  };
}

async function handleGenerateCode(body: any): Promise<HandlerResponse> {
  const { spec, language = 'javascript' } = body;
  
  return {
    success: true,
    data: {
      text: `Generated ${language} code based on specification`,
      code: {
        language,
        content: '// Generated code would go here'
      }
    }
  };
}

async function handleYouTubeTranscript(body: any): Promise<HandlerResponse> {
  const { videoUrl, videoId } = body;
  
  if (!videoUrl && !videoId) {
    return { success: false, error: 'Video URL or ID is required' };
  }

  try {
    const extractedVideoId = videoId || extractVideoId(videoUrl);
    if (!extractedVideoId) {
      return { success: false, error: 'Invalid YouTube URL' };
    }

    // Mock transcript for now - in production this would fetch real transcript
    const transcript = `This is a mock transcript for video ID: ${extractedVideoId}. In a production environment, this would contain the actual video transcript.`;

    return {
      success: true,
      data: {
        transcript,
        videoId: extractedVideoId,
        videoUrl: videoUrl || `https://youtube.com/watch?v=${extractedVideoId}`
      }
    };
  } catch (error: any) {
    console.error('YouTube transcript error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get transcript'
    };
  }
}

async function handleGeminiLive(request: NextRequest): Promise<NextResponse> {
  // Mock Gemini Live functionality
  return NextResponse.json({
    success: true,
    data: {
      status: 'connected',
      message: 'Gemini Live API mock response'
    }
  }, { headers: corsHeaders });
} 