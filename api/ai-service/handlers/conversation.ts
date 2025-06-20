import type { ProxyRequestBody, ProxyResponse, ConversationState, Message } from '../../types';
import { getGenAI } from '../../utils/genai';
import { getSupabase } from '../../utils/supabase';
import { AI_USAGE_LIMITS } from '../../utils/constants';
import { estimateTokens, estimateCost } from '../../utils/tokens';
import { generateVoiceWithElevenLabs } from '../../utils/elevenlabs';
import { determineNextStage } from '../../utils/conversationUtils';
import { HarmCategory, HarmBlockThreshold } from "@google/genai";

export async function handleConversationalFlow(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const {
      prompt,
      currentConversationState = { stage: 'greeting', messages: [], messagesInStage: 0, sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2,9)}`, aiGuidance:"Initial greeting", sidebarActivity:"" } as ConversationState,
      // messageCount is derived from currentConversationState.messages if not explicitly passed
      includeAudio = true,
    } = body;

    // Ensure messageCount is correctly sourced or derived
    const messageCount = body.messageCount !== undefined ? body.messageCount : (currentConversationState.messages?.length || 0);


    const userInfo = body.userInfo || {
        name: currentConversationState.name,
        email: currentConversationState.email,
        companyInfo: currentConversationState.companyInfo
    };

    if (!prompt) {
      return { success: false, error: "No prompt provided", status: 400 };
    }

    if (messageCount >= AI_USAGE_LIMITS.maxMessagesPerSession && currentConversationState.stage !== 'limit_reached') {
      const limitReachedText = `Apologies, ${currentConversationState.name || 'there'}, we've reached the message limit for this interactive demo. To dive deeper and discuss tailored AI solutions for your business, I highly recommend booking a complimentary strategy session with Farzad!`;
      const limitState: ConversationState = {
           ...currentConversationState,
           stage: 'limit_reached',
           aiGuidance: 'Inform user about message limit and strongly encourage consultation booking.',
           isLimitReached: true,
           showBooking: true,
           messagesInStage: 0
      };
      const audio = includeAudio && limitReachedText ? await generateVoiceWithElevenLabs(limitReachedText) : null;
      const supabase = getSupabase();
      if (limitState.sessionId) {
        await supabase.channel(limitState.sessionId).send({
            type: 'broadcast', event: 'ai-response',
            payload: {
                text: limitReachedText,
                audioData: audio?.audioBase64,
                conversationStateForNextTurn: limitState,
                sender: 'ai',
                timestamp: Date.now()
            }
        });
      }
      return {
          success: true,
          data: {
              text: limitReachedText,
              audioData: audio?.audioBase64,
              conversationStateForNextTurn: limitState
          }
      };
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
        generationConfig: { temperature: 0.75, topP: 0.9, topK: 40 }
    });

    const stateForSystemInstruction = currentConversationState;
    const baseSystemInstruction = `You are F.B/c AI Assistant, a friendly, highly intelligent, and slightly witty AI. Your primary role is to showcase AI capabilities for business transformation, understand user needs, and guide them towards a consultation with Farzad Bayat. Be conversational, engaging, and helpful. Use the user's name and company details (if known) to personalize responses. Avoid lists unless specifically asked. Keep responses concise and focused on the current conversational goal.`;
    const dynamicSystemInstruction = `${baseSystemInstruction}\nCURRENT STAGE: ${stateForSystemInstruction.stage}.\nUSER: ${stateForSystemInstruction.name || 'Guest'}.\nCOMPANY: ${stateForSystemInstruction.companyInfo?.name || 'Not specified'}\nCONVERSATIONAL GOAL: ${stateForSystemInstruction.aiGuidance || 'Respond to the user appropriately based on the conversation history and current stage.'}`;

    const geminiHistory = (stateForSystemInstruction.messages || []).map((msg: Message) => ({
        role: msg.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    const result = await model.generateContent({
        contents: [...geminiHistory, { role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { role: "system", parts: [{ text: dynamicSystemInstruction }] }
    });

    const response = result.response;
    const responseText = response.text();
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingAttributions?.map((attribution: any) => ({title: attribution.web?.title || 'Web Source',url: attribution.web?.uri || '#',snippet: attribution.web?.title || 'Grounded search result'})) || [];
    let audioDataResult = null;
    if (includeAudio && responseText) {
      audioDataResult = await generateVoiceWithElevenLabs(responseText);
    }

    const conversationStateForNextTurn = determineNextStage(currentConversationState, prompt, messageCount);
    const supabase = getSupabase();
    if (conversationStateForNextTurn.sessionId) {
        await supabase.channel(conversationStateForNextTurn.sessionId).send({
            type: 'broadcast',
            event: 'ai-response',
            payload: {
              text: responseText,
              audioData: audioDataResult?.audioBase64,
              sources,
              sidebarActivity: conversationStateForNextTurn.sidebarActivity,
              conversationStateForNextTurn: conversationStateForNextTurn,
              sender: 'ai',
              timestamp: Date.now()
            }
        });
    }

    const inputTokens = estimateTokens(prompt) + estimateTokens(dynamicSystemInstruction) + geminiHistory.reduce((acc, curr) => acc + estimateTokens(curr.parts[0].text),0);
    const outputTokens = estimateTokens(responseText);
    const cost = estimateCost(inputTokens, outputTokens);

    return {
      success: true,
      data: {
        text: responseText,
        sources,
        audioData: audioDataResult?.audioBase64,
        audioMimeType: 'audio/mpeg',
        sidebarActivity: conversationStateForNextTurn.sidebarActivity,
        conversationStateForNextTurn: conversationStateForNextTurn
      },
      usage: { inputTokens, outputTokens, cost }
    };
  } catch (error: any) {
    console.error("Error in handleConversationalFlow:", error);
    return {
      success: false,
      error: error.message || "Failed to process conversation",
      status: 500
    };
  }
}
