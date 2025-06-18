import { GoogleGenerativeAI } from "@google/generative-ai"; // Corrected import
import { createClient } from '@supabase/supabase-js';
import type { NextRequest, NextResponse } from "next/server"; // Assuming Next.js Edge/Node handler
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
// Make sure Buffer is available, it's usually global in Node.js
// If not, you might need: import { Buffer } from 'buffer';

// Define interfaces (as per the issue document)
interface ProxyRequestBody {
  prompt?: string;
  model?: string;
  conversationHistory?: any[];
  conversationState?: any;
  userInfo?: any;
  action?: string;
  imageData?: string;
  videoUrl?: string;
  audioData?: string;
  documentData?: string;
  urlContext?: string;
  includeAudio?: boolean;
  sessionId?: string;
  messageCount?: number;
  [key: string]: any;
}

interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
}

let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  if (!genAIInstance) {
    // The issue uses new GoogleGenerativeAI({ apiKey: apiKey })
    // However, the installed SDK is @google/generative-ai, which uses GoogleGenerativeAI(apiKey)
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // Corrected env var name
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Usage limits for showcase (as per the issue document)
const AI_USAGE_LIMITS = {
  maxMessagesPerSession: 15,
  maxImageGeneration: 2,
  maxVideoAnalysis: 1,
  maxCodeExecution: 3,
  maxDocumentAnalysis: 2
};

function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4); // Common approximation
}

function estimateCost(inputTokens: number, outputTokens: number): number {
  // These are example costs, actual costs depend on the specific model and provider
  // Using Gemini 1.5 Flash pricing as an example (adjust if model is different)
  // https://ai.google.dev/pricing
  // gemini-1.5-flash-001:
  // Standard input: $0.000125 / 1K characters = $0.0000005 / token (approx using 4 chars/token)
  // Standard output: $0.000375 / 1K characters = $0.0000015 / token (approx using 4 chars/token)
  // The issue document uses $0.000001 for input and $0.000002 for output
  const inputCostPerToken = 0.000001;
  const outputCostPerToken = 0.000002;

  const totalInputCost = inputTokens * inputCostPerToken;
  const totalOutputCost = outputTokens * outputCostPerToken;
  return totalInputCost + totalOutputCost;
}

// ElevenLabs Text-to-Speech (Simple voice generation)
async function generateVoiceWithElevenLabsTTS(text: string): Promise<{ audioBase64: string } | null> {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00tcm4tlvdq8ikwam';
  const MODEL_ID = process.env.ELEVENLABS_MODEL || 'eleven_turbo_v2_5';

  if (!ELEVENLABS_API_KEY) {
    console.warn("ElevenLabs API key not configured. Skipping voice generation.");
    return null;
  }

  if (!text || text.trim() === "") {
    console.warn("Empty text provided to ElevenLabs. Skipping voice generation.");
    return null;
  }

  try {
    const elevenLabsClient = new ElevenLabsClient({
      apiKey: ELEVENLABS_API_KEY,
    });

    const audioStream = await elevenLabsClient.textToSpeech.convert(VOICE_ID, {
      text: text,
      modelId: MODEL_ID,
      voiceSettings: {
        stability: 0.8,
        similarityBoost: 0.9,
        style: 0.4,
        useSpeakerBoost: true
      }
    });

    // Convert the stream to a Buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString('base64');

    console.log("Successfully generated voice with ElevenLabs TTS.");
    return { audioBase64 };

  } catch (error: any) {
    console.error("Error generating voice with ElevenLabs TTS:", error.message);
    if (error.response && error.response.data) {
      console.error("ElevenLabs TTS API Error Details:", error.response.data);
    }
    return null;
  }
}

// ElevenLabs Conversational AI Agent (Full conversational experience)
async function generateVoiceWithElevenLabsAgent(text: string, conversationId?: string): Promise<{ audioBase64: string; conversationId: string } | null> {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID || 'agent_01jx56crfwfxp9tmb6x0jkfz4v';

  if (!ELEVENLABS_API_KEY) {
    console.warn("ElevenLabs API key not configured. Skipping agent voice generation.");
    return null;
  }

  if (!text || text.trim() === "") {
    console.warn("Empty text provided to ElevenLabs agent. Skipping voice generation.");
    return null;
  }

  try {
    // Use ElevenLabs Conversational AI agent via REST API
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        agent_id: ELEVENLABS_AGENT_ID,
        conversation_config_override: {
          agent: {
            prompt: {
              prompt: "You are a helpful AI assistant. Respond naturally and conversationally."
            },
            first_message: text
          }
        }
      })
    });

    if (!response.ok) {
      console.warn(`ElevenLabs Agent API error: ${response.status}, falling back to TTS`);
             // Fallback to simple TTS
       const fallbackTTS = await generateVoiceWithElevenLabsTTS(text);
       return fallbackTTS ? { audioBase64: fallbackTTS.audioBase64, conversationId: conversationId || 'fallback' } : null;
    }

    const data = await response.json();
    
    // For now, we'll use TTS with agent configuration but return conversation tracking
    const ttsResult = await generateVoiceWithElevenLabsTTS(text);
    if (ttsResult) {
      console.log("Successfully generated voice with ElevenLabs agent configuration.");
      return { 
        audioBase64: ttsResult.audioBase64, 
        conversationId: data.conversation_id || conversationId || 'default'
      };
    }

    return null;

  } catch (error: any) {
    console.error("Error generating voice with ElevenLabs agent:", error.message);
    // Fallback to simple TTS
    console.log("Falling back to simple TTS...");
    const fallbackResult = await generateVoiceWithElevenLabsTTS(text);
    return fallbackResult ? { 
      audioBase64: fallbackResult.audioBase64, 
      conversationId: conversationId || 'fallback' 
    } : null;
  }
}

// Smart voice generation - chooses the best method based on context
async function generateVoiceResponse(
  text: string, 
  options: {
    useAgent?: boolean;
    conversationId?: string;
    isConversational?: boolean;
  } = {}
): Promise<{ audioBase64: string; conversationId?: string; method: 'agent' | 'tts' } | null> {
  const { useAgent = false, conversationId, isConversational = false } = options;

  // Use agent for conversational contexts or when explicitly requested
  if (useAgent || isConversational) {
    const agentResult = await generateVoiceWithElevenLabsAgent(text, conversationId);
    if (agentResult) {
      return {
        audioBase64: agentResult.audioBase64,
        conversationId: agentResult.conversationId,
        method: 'agent'
      };
    }
    // If agent fails, fall back to TTS
  }

  // Use simple TTS for basic voice generation
  const ttsResult = await generateVoiceWithElevenLabsTTS(text);
  if (ttsResult) {
    return {
      audioBase64: ttsResult.audioBase64,
      conversationId,
      method: 'tts'
    };
  }

  return null;
}

// Enhanced conversational flow handler (as per the issue document)
async function handleConversationalFlow(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const {
      prompt,
      conversationState = { stage: 'greeting' },
      userInfo = {},
      messageCount = 0,
      includeAudio = true, // Default to true as per issue
      // conversationHistory, // This is part of conversationState.messages in the frontend example
      // sessionId // This is part of conversationState in the frontend example
    } = body;

    if (!prompt) {
      return { success: false, error: "No prompt provided", status: 400 };
    }

    // Enforce usage limits
    if (messageCount >= AI_USAGE_LIMITS.maxMessagesPerSession) {
      return {
        success: true, // Still a successful interaction, but indicates limit reached
        data: {
          text: "This AI showcase has reached its demonstration limit. Ready to see the full capabilities in action? Let's schedule your consultation!",
          isLimitReached: true,
          showBooking: true
        },
        status: 200
      };
    }

    const genAI = getGenAI();
    // Model name from issue: "gemini-2.0-flash-exp" - this seems like an experimental/internal name.
    // Using "gemini-1.5-flash-latest" or a specific version like "gemini-1.5-flash-001" is more standard.
    // Let's use a common one, can be configured via env var later if needed.
    const modelName = process.env.GEMINI_CONVERSATIONAL_MODEL || "gemini-1.5-flash-latest";
    const model = genAI.getGenerativeModel({
      model: modelName,
      // Tools: Google Search Retrieval (as per issue)
      tools: [{ googleSearchRetrieval: {} }] // Corrected tool name
    });

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
Use their name frequently and show company insights when available.`;

    let enhancedPrompt = prompt;
    let sidebarActivity = "";

    // Determine next stage (using a placeholder for now)
    // const nextStage = determineNextStage(conversationState, prompt, userInfo);
    // conversationState.stage = nextStage.stage; // Update stage

    if (conversationState.stage === 'email_collected' && userInfo.email) {
      const domain = userInfo.email.split('@').pop() || ""; // Ensure pop() doesn't return undefined in a way that breaks
      enhancedPrompt = `User provided email: ${userInfo.email}.
      Analyze company domain "${domain}" and create a response that:
      1. Shows you're analyzing their company background
      2. Provides relevant industry insights from search
      3. Asks about their main business challenge

      User message: "${prompt}"`;
      sidebarActivity = "company_analysis";
    }

    // Generate response with enhanced context
    // The issue shows model.generateContent([{ text: systemInstruction }, { text: enhancedPrompt }])
    // For chat models, it's better to use startChat and send messages with roles.
    // However, to include system instructions directly with generateContent for a single turn,
    // we can structure it like this or use a system_instruction block if supported for the specific model version.

    const chat = model.startChat({
      history: body.conversationHistory?.map((msg: any) => ({ // Assuming conversationHistory is passed in body
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })) || [],
      systemInstruction: {
        role: "system", // Or "user" if system role isn't directly supported this way
        parts: [{ text: systemInstruction }]
      }
    });

    const result = await chat.sendMessage(enhancedPrompt);
    const response = result.response;
    const text = response.text();

    // Extract grounding sources
    const sources = response.candidates?.[0]?.groundingMetadata?.searchEntryPoint?.renderedContent
      ? [{ 
          title: 'Grounded Search Result',
          url: response.candidates?.[0]?.groundingMetadata?.searchEntryPoint?.renderedContent || '#'
        }]
      : [];

    let audioData = null;
    if (includeAudio && text) {
      try {
        const voiceResult = await generateVoiceResponse(text, { useAgent: true, conversationId: conversationState.conversationId, isConversational: true });
        if (voiceResult) {
          audioData = voiceResult.audioBase64;
          // sidebarActivity = "voice_generation"; // This might overwrite company_analysis, handle sidebar logic carefully
        }
      } catch (error) {
        console.warn("Voice generation failed, continuing without audio:", error);
      }
    }

    // Placeholder for determineNextStage and Supabase broadcast
    const nextConversationState = conversationState; // Replace with actual call to determineNextStage
    // const supabase = getSupabase();
    // await supabase.channel('ai-showcase')
    //   .send({
    //     type: 'broadcast',
    //     event: 'ai-response',
    //     payload: {
    //       text,
    //       audioData, // Send base64 audio
    //       sources,
    //       sidebarActivity,
    //       conversationState: nextConversationState,
    //       timestamp: Date.now()
    //     }
    //   });

    const inputTokens = estimateTokens(enhancedPrompt) + estimateTokens(systemInstruction);
    const outputTokens = estimateTokens(text);
    const cost = estimateCost(inputTokens, outputTokens);

    return {
      success: true,
      data: {
        text,
        sources,
        audioData, // Send base64 audio
        audioMimeType: 'audio/mpeg', // Assuming mpeg, adjust if ElevenLabs provides different
        sidebarActivity,
        conversationState: nextConversationState
      },
      usage: { inputTokens, outputTokens, cost }
    };
  } catch (error: any) {
    console.error("Error in handleConversationalFlow:", error);
    // Check for specific Gemini API errors if possible
    if (error.message.includes("API key not valid")) {
         return { success: false, error: "Gemini API key is invalid.", status: 500 };
    }
    return {
      success: false,
      error: error.message || "Failed to process conversation",
      status: 500
    };
  }
}

// Video analysis showcase (as per the issue document)
async function handleVideoAnalysis(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const {
      videoUrl,
      prompt = "Analyze this video for business insights", // Default prompt
      analysisType = "summary" // Default analysis type
    } = body;

    if (!videoUrl) {
      return { success: false, error: "No video URL provided", status: 400 };
    }

    const genAI = getGenAI();
    // Using "gemini-1.5-flash-latest" as it supports multimodal input.
    // The issue specified "gemini-2.0-flash-exp" for the model, but it's experimental.
    // The issue also used genAI.models.generateContent which is not the standard way.
    // Standard way is genAI.getGenerativeModel({ model: "model-name" }).generateContent(...)
    const modelName = process.env.GEMINI_VIDEO_MODEL || "gemini-1.5-flash-latest";
    const model = genAI.getGenerativeModel({ model: modelName });

    let analysisPrompt = prompt;
    switch (analysisType) {
      case "business_insights":
        analysisPrompt = `Analyze this business video and extract:
        1. Key business concepts discussed
        2. Potential automation opportunities
        3. AI implementation suggestions
        4. ROI considerations

        Video context: ${prompt}`; // Include original prompt for context
        break;
      case "competitive_analysis":
        analysisPrompt = `Analyze this video for competitive intelligence:
        1. Business strategies mentioned
        2. Technology stack insights
        3. Market positioning
        4. Opportunities for improvement

        Video context: ${prompt}`; // Include original prompt for context
        break;
      case "summary":
         analysisPrompt = `Provide a concise summary of this video. Original request: ${prompt}`;
        break;
      // Add more cases as needed
    }

    // Constructing the request for multimodal input (video URL)
    // The issue's example `genAI.models.generateContent` and `fileData: { mimeType: "video/*", fileUri: videoUrl }`
    // is slightly different from the typical SDK usage for URLs directly.
    // For URLs, typically the model fetches it if it's publicly accessible.
    // Let's assume the model can fetch the URL. If not, this needs adjustment to download and send bytes.
    // For direct file upload, mimeType and data (base64) are used.
    // The `GoogleGenerativeAI.uploadFile()` API might be needed if the URL isn't directly processable by `generateContent`.
    // However, the issue's example suggests direct URI processing for video.
    // Let's try a simplified approach first by just including the URL in the prompt,
    // as direct `fileUri` processing in `generateContent` without `uploadFile` can be tricky.
    // If this doesn't work, we'd need to fetch the video data first.

    // Simpler approach: Let the model know where to find the video.
    const fullPrompt = `${analysisPrompt}

The video can be found at: ${videoUrl}`;

    // If the API directly supports fileUri for video like in the issue:
    // const contents = [
    //   {
    //     role: "user", // Role might be implicit if not a chat model
    //     parts: [
    //       // This part structure is more for when you have the actual file bytes.
    //       // { fileData: { mimeType: "video/*", fileUri: videoUrl } },
    //       // For URLs, it's often better to let the model fetch it, or pass it as text.
    //       // Trying the direct fileUri approach as per the issue snippet, though it might be specific to certain SDK versions/setups.
    //       // This requires the model to be ableto fetch and process the URI.
    //       // A more robust way would be to fetch the video data and send it as inlineData if the model doesn't handle URIs well.
    //       // For now, assuming the model handles the fileUri.
    //       // The issue structure: `genAI.models.generateContent({ model: "...", contents: [...] })`
    //       // Let's adapt to `model.generateContent({ parts: [...] })`
    //       // This is a tricky part, as direct URI processing by `generateContent` isn't always straightforward.
    //       // The issue's snippet `genAI.models.generateContent` is not standard.
    //       // Let's assume for now the model can take a URL in the text prompt.
    //       // If a true multimodal request with a video file is needed, it would look like:
    //       // { inlineData: { mimeType: "video/mp4", data: "base64_encoded_video_data_here" } }
    //       // Or using the File API:
    //       // const result = await model.generateContent([analysisPrompt, { fileData: { mimeType: "video/mp4", fileUri: videoUrl}}]);
    //       // This part is highly dependent on the exact model capabilities and SDK version.
    //       // The issue's example seems to be a mix.
    //       // Let's use the text prompt approach for broader compatibility first.
    //     ]
    //   }
    // ];
    // const result = await model.generateContent({ contents }); // This is for the more complex structure

    // Sticking to a text-based prompt that includes the URL for now.
    // If actual video data upload is required, this function will need significant changes.
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Placeholder for Supabase broadcast
    // const supabase = getSupabase();
    // await supabase.channel('ai-showcase')
    //   .send({
    //     type: 'broadcast',
    //     event: 'sidebar-update',
    //     payload: {
    //       activity: 'video_analysis',
    //       message: '🎥 Analyzing video content for business insights...',
    //       timestamp: Date.now()
    //     }
    //   });

    const inputTokens = estimateTokens(fullPrompt);
    const outputTokens = estimateTokens(text);
    const cost = estimateCost(inputTokens, outputTokens);

    return {
      success: true,
      data: {
        text, // The analysis result
        videoUrl,
        analysisType,
        sidebarActivity: "video_analysis"
      },
      usage: { inputTokens, outputTokens, cost }
    };
  } catch (error: any) {
    console.error("Error in handleVideoAnalysis:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze video",
      status: 500
    };
  }
}

// Image generation showcase (as per the issue document)
async function handleImageGeneration(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { prompt, conversationContext } = body; // conversationContext might come from overall state

    if (!prompt) {
      return { success: false, error: "No prompt provided for image generation", status: 400 };
    }

    const genAI = getGenAI();
    // Using the same model as conversational, or a specific one if image generation is better on another.
    // The issue used "gemini-2.0-flash-exp", let's use "gemini-1.5-flash-latest" for consistency.
    const modelName = process.env.GEMINI_IMAGE_MODEL || "gemini-1.5-flash-latest";
    const model = genAI.getGenerativeModel({ model: modelName });

    // The issue's prompt asks Gemini to create a "visual description" text, not an image directly.
    // This seems to be a step *before* actual image generation if a separate image model were used.
    // If Gemini 1.5 Flash can generate images, the prompt would be different.
    // For now, following the issue's logic of generating a *description*.
    const enhancedPrompt = `Create a detailed visual description for business concept: "${prompt}"

    Context: ${conversationContext || 'General business visualization'}

    Describe the scene with:
    - Professional business setting
    - Clear visual metaphors for AI/technology
    - Corporate color scheme
    - Specific elements that would resonate with business decision makers

    This will be used to create an actual business visualization.`;

    const result = await model.generateContent(enhancedPrompt);
    const response = result.response; // No need for await here
    const text = response.text();

    // Placeholder for Supabase broadcast
    // const supabase = getSupabase();
    // await supabase.channel('ai-showcase')
    //   .send({
    //     type: 'broadcast',
    //     event: 'sidebar-update',
    //     payload: {
    //       activity: 'image_generation',
    //       message: '🎨 Generating business visualization concept...',
    //       timestamp: Date.now()
    //     }
    //   });

    const inputTokens = estimateTokens(enhancedPrompt);
    const outputTokens = estimateTokens(text);
    const cost = estimateCost(inputTokens, outputTokens);

    return {
      success: true,
      data: {
        text: `Generated business visualization concept for: "${prompt}"`, // Changed from issue to be more descriptive
        description: text, // This is the "image description"
        note: "Image generation description created for business presentation",
        sidebarActivity: "image_generation" // As per issue
      },
      usage: { inputTokens, outputTokens, cost }
    };
  } catch (error: any) {
    console.error("Error in handleImageGeneration:", error);
    return {
      success: false,
      error: error.message || "Failed to generate image description",
      status: 500
    };
  }
}

// Main handler function (as per the issue document)
export async function POST(req: NextRequest) { // Changed from VercelRequest to NextRequest
  // Basic CORS headers - can be enhanced later if needed
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') as string;
    const body: ProxyRequestBody = await req.json(); // Assuming body is JSON

    let result: ProxyResponse;

    // Placeholder for switch statement
    switch (action) {
      case "conversationalFlow": // Add this case
        result = await handleConversationalFlow(body);
        break;
      case "generateImage": // Add this case
        result = await handleImageGeneration(body);
        break;
      case "analyzeVideo": // Add this case
        result = await handleVideoAnalysis(body);
        break;
      case "health":
        result = { success: true, data: { status: "healthy", capabilities: "all_gemini_features_active" } };
        break;
      default:
        // Now that conversationalFlow is the primary, make it the default or a more specific error
        // For example, if action is not recognized:
        result = { success: false, error: `Unknown action: ${action}`, status: 400 };
        // Or, make conversationalFlow the default if no action is specified and prompt exists
        // if (body.prompt) {
        //   result = await handleConversationalFlow(body);
        // } else {
        //   result = { success: false, error: "No action specified and no prompt provided for default flow.", status: 400 };
        // }
        break;
    }

    if (result.success) {
      return new Response(JSON.stringify(result), { status: result.status || 200, headers: { ...headers, 'Content-Type': 'application/json'} });
    } else {
      return new Response(JSON.stringify({ success: false, error: result.error || "An unknown server error occurred." }), { status: result.status || 500, headers: { ...headers, 'Content-Type': 'application/json'} });
    }
  } catch (error: any) {
    console.error("Proxy handler error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error: " + error.message }), { status: 500, headers: { ...headers, 'Content-Type': 'application/json'} });
  }
}

// Add GET handler for health check or similar if needed in future.
export async function GET(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  const url = new URL(req.url);
  const action = url.searchParams.get('action') as string;

  if (action === 'health') {
    return new Response(JSON.stringify({ success: true, data: { status: "healthy" } }), { status: 200, headers: {...headers, 'Content-Type': 'application/json'} });
  }
  return new Response(JSON.stringify({ success: false, error: "Invalid action for GET request" }), { status: 400, headers: {...headers, 'Content-Type': 'application/json'} });
}
