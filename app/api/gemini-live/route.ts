import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logServerActivity } from '@/lib/server-activity-logger';
import { withFullSecurity } from '@/lib/api-security';
import { selectModelForFeature } from '@/lib/model-selector';

// 🚨 COST CONTROL: Centralized cost management settings
const COST_CONTROL = {
  // Hard limit on daily API calls to prevent unexpected charges.
  maxDailyCalls: 100,
  // Disable the most expensive audio generation model (Veo 3).
  enableExpensiveAudio: false,
  // Enforce the use of free, client-side Text-to-Speech.
  useClientSideTTS: true,
  // Cache results to reduce redundant API calls.
  cacheResults: true, 
};

// In-memory store for tracking daily API usage. Resets on server restart.
const dailyUsage = new Map<string, number>();

/**
 * Checks if the API call is within the daily usage limits.
 * @param sessionId - The user's session ID for tracking.
 * @returns boolean - True if the call is allowed, false otherwise.
 */
function checkCostLimits(sessionId: string): boolean {
  const today = new Date().toDateString();
  const currentDailyCount = dailyUsage.get(today) || 0;

  if (currentDailyCount >= COST_CONTROL.maxDailyCalls) {
    console.warn(`🚫 Daily cost limit of ${COST_CONTROL.maxDailyCalls} reached. Call blocked for session: ${sessionId}`);
    return false;
  }

  dailyUsage.set(today, currentDailyCount + 1);
  return true;
}

async function handler(req: NextRequest) {
  const callId = logServerActivity('Live Gemini Call Started');
  
  try {
    const { 
      sessionId, 
      audioData, 
      imageData, 
      text, 
      config = {},
      action 
    } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400, headers: { 'X-Call-ID': callId } });
    }
    
    // 🚨 COST CONTROL: Enforce daily limits before proceeding.
    if (!checkCostLimits(sessionId)) {
      return NextResponse.json({
        error: "Daily API call limit reached. Please try again tomorrow.",
        callId,
      }, { status: 429 });
    }

    if (action === 'start') {
        logServerActivity('Live Conversation Started', { sessionId });
        // Here you could initialize a session state if needed
        return NextResponse.json({ status: 'session_started', sessionId }, { status: 200, headers: { 'X-Call-ID': callId } });
    }

    const {
      model: modelName = 'gemini-1.5-flash-latest',
      voiceName = 'aura-asteria-en',
      systemInstruction = 'You are a helpful AI assistant.',
    } = config;
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });

    let prompt: any = text || '';
    
    if (imageData) {
        const imagePart = {
            inlineData: {
                data: imageData.replace('data:image/jpeg;base64,', ''),
                mimeType: 'image/jpeg'
            }
        };
        prompt = { text: text || "Describe this image.", image: imagePart };
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();
    
    let audioContent = null;

    // 🚨 COST CONTROL: Generate audio only if explicitly allowed and not using client-side TTS.
    if (config.enableAudio && !COST_CONTROL.useClientSideTTS) {
        // This block would contain the call to the expensive audio generation API.
        // It is currently disabled by the COST_CONTROL flag.
        console.warn("Expensive audio generation is disabled by cost control settings.");
    }

    logServerActivity('Live Gemini Response Generated', { sessionId, callId });

    return NextResponse.json({
      text: textResponse,
      audioData: audioContent,
      costControl: {
          expensiveAudioDisabled: !COST_CONTROL.enableExpensiveAudio,
          clientSideTTSForced: COST_CONTROL.useClientSideTTS,
          reason: "Cost control measures are active."
      }
    }, { status: 200, headers: { 'X-Call-ID': callId } });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`❌ Gemini Live API Error:`, { errorMessage, callId, error });
    logServerActivity('Live Gemini Call Failed', { error: errorMessage, callId });
    return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500, headers: { 'X-Call-ID': callId } });
  }
}

export const POST = withFullSecurity(handler);
