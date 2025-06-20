import type { ProxyRequestBody, ProxyResponse, ConversationState } from '../../types';
import { getGenAI } from '../../utils/genai';
import { getSupabase } from '../../utils/supabase';
import { determineNextStage } from '../../utils/conversationUtils';
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

export async function handleURLAnalysis(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const {
      urlContext,
      analysisType = "business_analysis",
      currentConversationState = { stage: 'capability_interaction', messages: [], messagesInStage: 0, sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2,9)}`, aiGuidance:"Capability interaction", sidebarActivity:"" } as ConversationState,
    } = body;

    const messageCount = body.messageCount !== undefined ? body.messageCount : (currentConversationState.messages?.length || 0);


    if (!urlContext) {
      return { success: false, error: "No URL provided for analysis", status: 400 };
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      tools: [{ googleSearch: {} }],
       safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
        generationConfig: { temperature: 0.75, topP: 0.95, topK: 45 }
    });

    const urlAnalysisPromptText = `Analyze the website at the provided URL: ${urlContext}.\nFocus on ${analysisType}.\nProvide business intelligence analysis covering these points if applicable:\n1.  **Company Overview**: What they do, their market position.\n2.  **Technology Stack**: Visible technologies and tools (if discernible).\n3.  **AI Opportunities**: Where AI could improve their operations or offerings.\n4.  **Competitive Advantages**: What they do well.\n5.  **Improvement Areas**: Potential optimization opportunities.\n6.  **AI Implementation Roadmap Hints**: Specific recommendations or ideas.\nFocus on actionable insights for business improvement.`;

    const result = await model.generateContent(urlAnalysisPromptText);
    const response = result.response;
    const text = response.text();
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingAttributions?.map((attr:any) => ({ title: attr.web?.title || 'Web Source', url: attr.web?.uri || '#', snippet: attr.web?.title || 'Grounded search result' })) || [];

    const supabase = getSupabase();
    if (currentConversationState.sessionId) {
        await supabase.channel(currentConversationState.sessionId)
          .send({
            type: 'broadcast', event: 'sidebar-update',
            payload: { activity: 'url_analysis', message: '🌐 Analyzing website for business intelligence...', timestamp: Date.now() }
          });
    }

    let conversationStateForNextTurn = determineNextStage(currentConversationState, `System: URL analysis completed for ${urlContext}.`, messageCount);
    conversationStateForNextTurn.stage = 'post_capability_feedback';
    conversationStateForNextTurn.messagesInStage = 0;
    conversationStateForNextTurn.aiGuidance = `The URL analysis for "${urlContext}" has been completed. Ask the user for their feedback or if they have questions about the insights provided.`;
    conversationStateForNextTurn.sidebarActivity = 'url_analysis_complete';

    return {
      success: true,
      data: {
        text,
        sources,
        urlContext,
        sidebarActivity: "url_analysis_complete",
        conversationStateForNextTurn
      }
    };
  } catch (error: any) {
    console.error("Error in handleURLAnalysis:", error);
    const errorState = body.currentConversationState ? determineNextStage(body.currentConversationState, "Error during URL analysis.", body.currentConversationState.messages?.length || 0) : undefined;
    if (errorState && body.currentConversationState) {
        errorState.sidebarActivity = "url_analysis_error";
        errorState.sessionId = body.currentConversationState.sessionId; // Preserve session ID
    }
    return {
        success: false,
        error: error.message || "Failed to analyze URL",
        status: 500,
        data: { conversationStateForNextTurn: errorState }
    };
  }
}
