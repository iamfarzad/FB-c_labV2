import type { ProxyRequestBody, ProxyResponse, ConversationState } from '../../types';
import { getGenAI } from '../../utils/genai';
import { getSupabase } from '../../utils/supabase';
import { determineNextStage } from '../../utils/conversationUtils';
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

export async function handleCodeExecution(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const {
      prompt,
      businessContext = "General business calculation",
      currentConversationState = { stage: 'capability_interaction', messages: [], messagesInStage: 0, sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2,9)}`, aiGuidance:"Capability interaction", sidebarActivity:"" } as ConversationState,
    } = body;

    const messageCount = body.messageCount !== undefined ? body.messageCount : (currentConversationState.messages?.length || 0);

    if (!prompt) {
      return { success: false, error: "No code execution prompt provided", status: 400 };
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      tools: [{ codeExecution: {} }],
      safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
        generationConfig: { temperature: 0.5, topP: 0.9, topK: 30 }
    });

    const codePromptText = `Create and execute Python code to solve this business problem: "${prompt}"\nBusiness context: ${businessContext}.\nRequirements: Write practical, business-relevant Python code. Execute it and show results. Explain the business value.\nFocus on demonstrating how AI can solve real business problems with code. The output should clearly present the code, its execution result, and a brief explanation of its business value.`;

    const result = await model.generateContent(codePromptText);
    const text = result.response.text();

    const supabase = getSupabase();
    if (currentConversationState.sessionId) {
        await supabase.channel(currentConversationState.sessionId)
          .send({
            type: 'broadcast', event: 'sidebar-update',
            payload: { activity: 'code_execution', message: '⚡ Executing business calculations...', timestamp: Date.now() }
          });
    }

    let conversationStateForNextTurn = determineNextStage(currentConversationState, `System: Code execution completed for prompt "${prompt}".`, messageCount);
    conversationStateForNextTurn.stage = 'post_capability_feedback';
    conversationStateForNextTurn.messagesInStage = 0;
    conversationStateForNextTurn.aiGuidance = `The code execution for "${prompt}" has completed. Ask the user for their feedback or if they have questions about the results or the code.`;
    conversationStateForNextTurn.sidebarActivity = 'code_execution_complete';

    return {
      success: true,
      data: {
        text,
        sidebarActivity: "code_execution_complete",
        note: "Live code execution for business problem solving",
        conversationStateForNextTurn
      }
    };
  } catch (error: any) {
    console.error("Error in handleCodeExecution:", error);
    const errorState = body.currentConversationState ? determineNextStage(body.currentConversationState, "Error during code execution.", body.currentConversationState.messages?.length || 0) : undefined;
    if (errorState && body.currentConversationState) {
        errorState.sidebarActivity = "code_execution_error";
        errorState.sessionId = body.currentConversationState.sessionId; // Preserve session ID
    }
    return {
        success: false,
        error: error.message || "Failed to execute code",
        status: 500,
        data: { conversationStateForNextTurn: errorState }
    };
  }
}
