import type { ProxyRequestBody, ProxyResponse, ConversationState, Message } from '../../types'; // Removed CompanyInfo as it's part of ConversationState or userInfo
import { getGenAI } from '../../utils/genai';
import { getSupabase } from '../../utils/supabase';
import { determineNextStage } from '../../utils/conversationUtils';
import { calculateLeadScore, extractCapabilitiesShown, generateEmailContent } from '../../utils/leadUtils';
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

const BASE_SYSTEM_INSTRUCTION = `You are F.B/c AI Assistant, a friendly, highly intelligent, and slightly witty AI. Your primary role is to showcase AI capabilities for business transformation, understand user needs, and guide them towards a consultation with Farzad Bayat. Be conversational, engaging, and helpful. Use the user's name and company details (if known) to personalize responses. Avoid lists unless specifically asked. Keep responses concise and focused on the current conversational goal.`;

export async function handleLeadCapture(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const {
      currentConversationState // Contains all necessary info like messages, name, email, companyInfo
    } = body;

    if (!currentConversationState) {
        return { success: false, error: "Missing currentConversationState", status: 400 };
    }

    const conversationHistory = currentConversationState.messages;
    // UserInfo is now part of currentConversationState, so we extract from there
    const userInfo = {
        name: currentConversationState.name,
        email: currentConversationState.email,
        companyInfo: currentConversationState.companyInfo
    };
    const messageCount = currentConversationState.messages?.length || 0;


    if (!conversationHistory || !userInfo.name || !userInfo.email) {
      return { success: false, error: "Missing required lead information (name, email, or history from currentConversationState)", status: 400 };
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
        generationConfig: { temperature: 0.5, topP: 0.85, topK: 30 }
    });

    const leadCaptureSystemInstruction = `${BASE_SYSTEM_INSTRUCTION}\nCONVERSATIONAL GOAL: Generate a concise and professional summary and a consultant brief based on the provided conversation history and user details. Focus on clarity and actionability.`;
    const capabilitiesShownText = extractCapabilitiesShown(conversationHistory).join(', ') || 'General discussion';
    // Ensure historyForSummaryPrompt is correctly typed if needed, though JSON.stringify will handle it.
    const historyForSummaryPrompt = conversationHistory.length > 10 ? conversationHistory.slice(-10) : conversationHistory;


    const summaryPromptText = `Create a comprehensive F.B/c AI consultation summary for ${userInfo.name}.\nAI CAPABILITIES DEMONSTRATED: ${capabilitiesShownText}.\nCONVERSATION ANALYSIS (selected highlights): ${JSON.stringify(historyForSummaryPrompt)}\nCREATE STRUCTURED SUMMARY: 1. Executive Summary (key insights). 2. AI Capabilities Showcased. 3. Business Opportunities for ${userInfo.companyInfo?.name || 'their company'}. 4. Recommended Solutions (Training vs Consulting). 5. Next Steps (call-to-action for consultation).\nMake it professional, actionable, and compelling for ${userInfo.name}.`;
    const summaryGeminiResult = await model.generateContent({ contents: [{role: 'user', parts: [{text: summaryPromptText}]}], systemInstruction: {role: 'system', parts: [{text: leadCaptureSystemInstruction}]} });
    const summary = summaryGeminiResult.response.text();

    const briefPromptText = `Create a detailed consultant brief for Farzad's follow-up with ${userInfo.name}.\nContact: ${userInfo.name}, Email: ${userInfo.email}, Company: ${userInfo.companyInfo?.name || 'N/A'}, Industry: ${currentConversationState.companyInfo?.industry || 'N/A'}.\nAI Capabilities that resonated: ${capabilitiesShownText}.\nKey Pain Points expressed during conversation. AI Readiness Level (impression). Decision Authority (impression). Budget Indicators (if any). Urgency Level (impression). Service Fit (Training/Consulting).\nFOLLOW-UP STRATEGY: Key talking points, relevant case studies, recommended solution approach, pricing considerations.\nCONVERSATION INSIGHTS (key interactions): ${JSON.stringify(historyForSummaryPrompt)}\nProvide actionable intelligence for converting this lead.`;
    const briefGeminiResult = await model.generateContent({ contents: [{role: 'user', parts: [{text: briefPromptText}]}], systemInstruction: {role: 'system', parts: [{text: leadCaptureSystemInstruction}]} });
    const brief = briefGeminiResult.response.text();

    const supabase = getSupabase();
    const leadScore = calculateLeadScore(conversationHistory, userInfo); // userInfo is already structured correctly
    const { data: leadData, error: supabaseError } = await supabase.from('lead_summaries').insert({ name: userInfo.name, email: userInfo.email, company_name: userInfo.companyInfo?.name, conversation_summary: summary, consultant_brief: brief, lead_score: leadScore, ai_capabilities_shown: extractCapabilitiesShown(conversationHistory) }).select();

    if (supabaseError) throw new Error(`Failed to store lead: ${supabaseError.message}`);
    if (!leadData || leadData.length === 0) throw new Error("Lead data was not returned after insert.");

    let conversationStateForNextTurn = determineNextStage(currentConversationState, `System: Lead capture complete for ${userInfo.name}.`, messageCount);
    conversationStateForNextTurn.stage = 'finalizing';
    conversationStateForNextTurn.messagesInStage = 0;
    conversationStateForNextTurn.aiGuidance = `Lead capture process is complete. The summary and brief have been generated. Thank the user and indicate that Farzad will be in touch if they requested a consultation.`;
    conversationStateForNextTurn.sidebarActivity = 'lead_capture_complete';
    conversationStateForNextTurn.isLimitReached = true;
    conversationStateForNextTurn.showBooking = true;

    return {
      success: true,
      data: {
        summary, brief, leadScore,
        emailContent: generateEmailContent(userInfo.name!, userInfo.email!, summary, leadScore, userInfo.companyInfo?.name),
        leadId: leadData[0].id,
        sidebarActivity: "lead_capture_complete",
        conversationStateForNextTurn
      }
    };
  } catch (error: any) {
    console.error("Error in handleLeadCapture:", error);
    const errorState = body.currentConversationState ? determineNextStage(body.currentConversationState, "Error during lead capture.", body.currentConversationState.messages?.length || 0) : undefined;
    if (errorState && body.currentConversationState) {
        errorState.sidebarActivity = "lead_capture_error";
        errorState.sessionId = body.currentConversationState.sessionId; // Preserve session ID
    }
    return {
        success: false,
        error: error.message || "Failed to process lead capture",
        status: 500,
        data: { conversationStateForNextTurn: errorState }
    };
  }
}
