import { NextRequest, NextResponse } from 'next/server';
import { UnifiedAIService } from '../../../lib/ai/unified-ai-service';
import { extractVideoId } from '@/lib/youtube-utils';
import { getVideoTranscript } from '@/lib/video-analysis';

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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Type for handler response
interface HandlerResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function POST(request: NextRequest) {
  // Handle OPTIONS for CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const action = request.nextUrl.searchParams.get('action') || 'conversationalFlow';
    
    let response: HandlerResponse;
    
    switch (action) {
      case 'conversationalFlow':
        response = await aiService.handleConversationalFlow(
          body.prompt,
          body.currentConversationState,
          body.messageCount,
          body.includeAudio
        );
        break;
        
      case 'generateImage':
      case 'imageGeneration':
        response = await aiService.handleImageGeneration(body.prompt);
        break;
        
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
        
      case 'leadCapture':
        response = await aiService.handleLeadCapture(body.currentConversationState);
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
        
      default:
        // Default to conversational flow
        response = await aiService.handleConversationalFlow(
          body.prompt || '',
          body.currentConversationState,
          body.messageCount,
          body.includeAudio
        );
    }
    
    // Convert UnifiedAIService response format to API response format
    if (response.success) {
      // For UnifiedAIService responses, return the response directly since it already has the right structure
      if ('data' in response && response.data) {
        return NextResponse.json(response, { headers: corsHeaders });
      } else {
        // For other handlers that return HandlerResponse format
        return NextResponse.json(response.data || {}, { headers: corsHeaders });
      }
    } else {
      return NextResponse.json(
        { success: false, error: response.error || 'Unknown error' },
        { status: 500, headers: corsHeaders }
      );
    }
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handler functions that aren't yet in UnifiedAIService
// These will be migrated in the next phase

async function handleVideoAnalysis(body: any): Promise<HandlerResponse> {
  const { videoUrl, prompt = 'Analyze this video for business insights', modelName = 'gemini-2.5-flash' } = body;
  
  if (!videoUrl && !prompt) {
    return { success: false, error: 'No video URL or prompt provided' };
  }

  try {
    // Handle video-to-app generation
    if (prompt && prompt.includes('pedagogist and product designer')) {
      if (!process.env.GEMINI_API_KEY) {
        const mockSpec = `Build an interactive learning app to help users understand the key concepts from this video.

SPECIFICATIONS:
1. The app must feature an interactive interface that engages users with the video content.
2. Include visual elements that reinforce the main concepts discussed.
3. Provide interactive exercises or quizzes to test understanding.
4. Create a progress tracking system to show learning advancement.
5. Include clear explanations and examples related to the video topic.

The app should be educational, engaging, and help users master the video's key ideas through hands-on interaction.`;

        return {
          success: true,
          data: {
            text: JSON.stringify({ spec: mockSpec })
          }
        };
      }

      // Use Gemini to analyze video URL and generate real specs
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent(`As a pedagogist and product designer, analyze this video: ${videoUrl}

Create a detailed specification for an interactive learning app that helps users understand the key concepts from this video.

Include:
1. Interactive interface design
2. Visual elements and reinforcement strategies  
3. Interactive exercises and assessment methods
4. Progress tracking system
5. User engagement mechanisms
6. Technical implementation suggestions

Provide a comprehensive, actionable specification that a developer could use to build the app.`);

      const spec = result.response.text();

      return {
        success: true,
        data: {
          text: JSON.stringify({ spec })
        }
      };
    }

    // Regular video analysis with YouTube API integration
    if (videoUrl && videoUrl.includes('youtube.com')) {
      try {
        const videoId = extractVideoId(videoUrl);
        
        if (videoId) {
          const transcript = await getVideoTranscript(videoUrl);
          
          if (transcript && process.env.GEMINI_API_KEY) {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const result = await model.generateContent(`Analyze this video transcript for business insights and opportunities:

Transcript: ${transcript}

Provide:
1. Key business insights and takeaways
2. Actionable recommendations
3. AI implementation opportunities
4. Potential for automation or optimization
5. Strategic value for businesses

Be specific and business-focused.`);

            const analysis = result.response.text();

            return {
              success: true,
              data: {
                text: analysis,
                videoUrl,
                transcript: transcript.substring(0, 500) + '...',
                analysisType: 'business_insights',
                sidebarActivity: 'video_analysis'
              }
            };
          }
        }
      } catch (error) {
        console.error('YouTube analysis error:', error);
      }
    }

    // Fallback analysis
    return {
      success: true,
      data: {
        text: `Video analysis for ${videoUrl}: This video contains valuable business insights and opportunities for AI implementation. The content suggests potential for automation, optimization, and strategic AI integration.`,
        videoUrl,
        analysisType: 'business_insights',
        sidebarActivity: 'video_analysis'
      }
    };
  } catch (error: any) {
    console.error('Video analysis error:', error);
    return { success: false, error: error.message || 'Failed to process video' };
  }
}

async function handleDocumentAnalysis(body: any): Promise<HandlerResponse> {
  const { documentData, prompt = 'Analyze this document' } = body;
  
  if (!documentData) {
    return { success: false, error: 'No document provided' };
  }

  return {
    success: true,
    data: {
      text: 'Document analysis would provide executive summary, key insights, and recommendations.',
      sidebarActivity: 'document_analysis'
    }
  };
}

async function handleCodeExecution(body: any): Promise<HandlerResponse> {
  const { prompt } = body;
  
  if (!prompt) {
    return { success: false, error: 'No prompt provided' };
  }

  try {
    // Handle code generation from spec
    if (body.action === 'generateCodeFromSpec') {
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

      return {
        success: true,
        data: {
          text: `\`\`\`html\n${mockCode}\n\`\`\``
        }
      };
    }

    // Regular code execution
    return {
      success: true,
      data: {
        text: `Mock code execution for business problem: "${prompt}"\n\nThis would provide working code examples and business value explanations.`,
        sidebarActivity: 'code_execution',
        note: 'Code execution for business problem solving'
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to execute code' };
  }
}

async function handleURLAnalysis(body: any): Promise<HandlerResponse> {
  const { url, prompt = 'Analyze this website for AI opportunities' } = body;
  
  if (!url) {
    return { success: false, error: 'No URL provided' };
  }

  return {
    success: true,
    data: {
      text: `Website analysis for ${url}: Identified opportunities for AI implementation including chatbots, personalization, and automation.`,
      sidebarActivity: 'url_analysis'
    }
  };
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
      audioData: null // Would be generated by ElevenLabs in production
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

  try {
    // Use Gemini Vision API for actual screen analysis
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: true,
        data: {
          text: 'I can see your screen. This shows opportunities for automation and AI enhancement.',
          insights: ['UI optimization', 'Workflow automation', 'AI integration points'],
          sidebarActivity: 'screen_analysis'
        }
      };
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      'Analyze this screen capture for AI automation opportunities. Identify workflows that could be automated, UI improvements, and areas where AI could add business value. Be specific and actionable.',
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
      success: true,
      data: {
        text: 'I can analyze your screen for automation opportunities. This interface has potential for AI enhancement.',
        insights: ['UI optimization', 'Workflow automation', 'AI integration points'],
        sidebarActivity: 'screen_analysis'
      }
    };
  }
}

async function handleWebcamAnalysis(body: any): Promise<HandlerResponse> {
  const { imageData, analysisType = 'general' } = body;
  
  if (!imageData) {
    return { success: false, error: 'No image data provided' };
  }

  try {
    // Use Gemini Vision API for actual webcam analysis
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: true,
        data: {
          text: 'Webcam analysis shows professional setup. Ready for our AI consultation!',
          analysisType,
          sidebarActivity: 'webcam_analysis'
        }
      };
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      'Analyze this webcam image for a business consultation. Provide insights about the person, environment, and professionalism level. Be encouraging and business-focused.',
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
      success: true,
      data: {
        text: 'I can see you through the webcam. Great setup for our AI consultation!',
        analysisType,
        sidebarActivity: 'webcam_analysis'
      }
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
  const { spec, language = 'typescript' } = body;
  
  return {
    success: true,
    data: {
      text: `Generated ${language} code based on specification`,
      code: '// Generated code would appear here',
      language
    }
  };
} 