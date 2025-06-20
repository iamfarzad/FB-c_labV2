import type { ProxyRequestBody, ProxyResponse, ConversationState } from '../../types';
import { getGenAI } from '../../utils/genai';
import { getSupabase } from '../../utils/supabase';
import { estimateTokens, estimateCost } from '../../utils/tokens';
import { determineNextStage } from '../../utils/conversationUtils';
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

export async function handleDocumentAnalysis(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const {
      documentData,
      mimeType = "application/pdf",
      prompt = "Analyze this document for business insights",
      currentConversationState = { stage: 'capability_interaction', messages: [], messagesInStage: 0, sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2,9)}`, aiGuidance:"Capability interaction", sidebarActivity:"" } as ConversationState,
    } = body;

    const messageCount = body.messageCount !== undefined ? body.messageCount : (currentConversationState.messages?.length || 0);

    if (!documentData) {
      return { success: false, error: "No document data provided", status: 400 };
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest", // Ensure this model supports inlineData for documents
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
        generationConfig: { temperature: 0.6, topP: 0.9, topK: 35 }
    });

    const businessAnalysisPromptText = `Analyze this business document (mime-type: ${mimeType}) and provide: 1. **Executive Summary**: Key points in 2-3 sentences. 2. **Business Opportunities**: Areas where AI could help. 3. **Process Improvements**: Workflow optimizations possible. 4. **ROI Potential**: Quantifiable benefits. 5. **Implementation Roadmap**: Practical next steps. Original user request: ${prompt}`;

    const documentPart = { inlineData: { data: documentData, mimeType: mimeType } };
    // The Gemini API expects an array of "parts" for generateContent.
    // If the prompt is text and the document is inlineData, they should be separate parts in the array.
    const result = await model.generateContent([businessAnalysisPromptText, documentPart]);
    const text = result.response.text();

    const supabase = getSupabase();
    if (currentConversationState.sessionId) {
        await supabase.channel(currentConversationState.sessionId)
          .send({
            type: 'broadcast', event: 'sidebar-update',
            payload: { activity: 'document_analysis', message: '📄 Processing business document...', timestamp: Date.now() }
          });
    }

    const inputTokens = estimateTokens(prompt) + estimateTokens(businessAnalysisPromptText) + estimateTokens(documentData)/2; // documentData is base64, might need different token estimation
    const outputTokens = estimateTokens(text);
    const cost = estimateCost(inputTokens, outputTokens);

    let conversationStateForNextTurn = determineNextStage(currentConversationState, `System: Document analysis completed.`, messageCount);
    conversationStateForNextTurn.stage = 'post_capability_feedback';
    conversationStateForNextTurn.messagesInStage = 0;
    conversationStateForNextTurn.aiGuidance = `The document analysis has been generated. Ask the user for their feedback or if they have questions about it.`;
    conversationStateForNextTurn.sidebarActivity = 'document_analysis_complete';

    return {
      success: true,
      data: {
        text,
        sidebarActivity: "document_analysis_complete",
        conversationStateForNextTurn
      },
      usage: { inputTokens, outputTokens, cost }
    };
  } catch (error: any) {
    console.error("Error in handleDocumentAnalysis:", error);
    const errorState = body.currentConversationState ? determineNextStage(body.currentConversationState, "Error during document analysis.", body.currentConversationState.messages?.length || 0) : undefined;
    if (errorState && body.currentConversationState) {
        errorState.sidebarActivity = "document_analysis_error";
        errorState.sessionId = body.currentConversationState.sessionId; // Preserve session ID
    }
    return {
        success: false,
        error: error.message || "Failed to analyze document",
        status: 500,
        data: { conversationStateForNextTurn: errorState }
    };
  }
}
