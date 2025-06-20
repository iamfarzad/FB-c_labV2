import type { ProxyRequestBody, ProxyResponse, ConversationState } from '../../types';
import { getGenAI } from '../../utils/genai';
import { getSupabase } from '../../utils/supabase';
import { determineNextStage } from '../../utils/conversationUtils';
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

// const BASE_SYSTEM_INSTRUCTION = `You are F.B/c AI Assistant...`; // Not used here as a more specific prompt is constructed

export async function handleImageGeneration(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const {
        prompt,
        currentConversationState = { stage: 'capability_interaction', messages: [], messagesInStage: 0, sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2,9)}`, aiGuidance:"Capability interaction", sidebarActivity:"" } as ConversationState,
    } = body;

    const messageCount = body.messageCount !== undefined ? body.messageCount : (currentConversationState.messages?.length || 0);
    const userInfo = body.userInfo || {
        name: currentConversationState.name,
        email: currentConversationState.email,
        companyInfo: currentConversationState.companyInfo
    };

    if (!prompt) {
      return { success: false, error: "No prompt provided for image generation", status: 400 };
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest", // This model generates text; for actual image generation, a different model/API would be needed
      safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
        generationConfig: { temperature: 0.7, topP: 0.9, topK: 35 }
    });

    // This prompt is for generating a *description* of an image, not the image itself.
    const enhancedPrompt = `Create a detailed visual description for a business concept related to: "${prompt}"\nContext: User ${userInfo.name || 'Anonymous'} from ${userInfo.companyInfo?.name || 'Unknown company'} is exploring AI.\nDescribe a professional business setting, clear visual metaphors for AI/technology, corporate color scheme, and elements resonating with business decision-makers.\nThis description will be used to conceptually visualize an image.`;

    const result = await model.generateContent(enhancedPrompt);
    const text = result.response.text();

    const supabase = getSupabase();
    if (currentConversationState.sessionId) {
        await supabase.channel(currentConversationState.sessionId)
          .send({
            type: 'broadcast', event: 'sidebar-update',
            payload: { activity: 'image_generation', message: '🎨 Generating business visualization concept...', timestamp: Date.now() }
          });
    }

    let conversationStateForNextTurn = determineNextStage(currentConversationState, `System: Image description generated for "${prompt}".`, messageCount);
    conversationStateForNextTurn.stage = 'post_capability_feedback';
    conversationStateForNextTurn.messagesInStage = 0;
    conversationStateForNextTurn.aiGuidance = `The image description for "${prompt}" has been generated. Ask the user for their feedback or if they have questions about it.`;
    conversationStateForNextTurn.sidebarActivity = 'image_generation_complete';

    return {
      success: true,
      data: {
        text: `Generated business visualization concept for: "${prompt}"\n\nDescription: ${text}`,
        description: text, // This is the textual description of the image
        note: "Image generation description created for business presentation.",
        sidebarActivity: "image_generation_complete",
        conversationStateForNextTurn
      }
    };
  } catch (error: any) {
    console.error("Error in handleImageGeneration:", error);
    const errorState = body.currentConversationState ? determineNextStage(body.currentConversationState, "Error during image generation.", body.currentConversationState.messages?.length || 0) : undefined;
    if (errorState && body.currentConversationState) {
        errorState.sidebarActivity = "image_generation_error";
        errorState.sessionId = body.currentConversationState.sessionId; // Preserve session ID
    }
    return {
        success: false,
        error: error.message || "Failed to generate image description",
        status: 500,
        data: { conversationStateForNextTurn: errorState }
    };
  }
}
