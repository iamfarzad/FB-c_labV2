import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ConversationState, 
  ProxyRequestBody, 
  ProxyResponse,
  CONVERSATION_STAGES,
  AI_USAGE_LIMITS,
  UserInfo,
  AI_CAPABILITIES
} from '../../api/ai-service/types';

export class ConversationalFlowHandler {
  private genAI: GoogleGenerativeAI;
  private supabase: SupabaseClient | null;

  constructor(apiKey: string, supabaseUrl?: string, supabaseKey?: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.supabase = supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey) 
      : null;
  }

  async handleConversationalFlow(body: ProxyRequestBody): Promise<ProxyResponse> {
    try {
      const {
        prompt,
        conversationState = { 
          sessionId: `session_${Date.now()}`,
          stage: CONVERSATION_STAGES.GREETING,
          messages: [],
          messagesInStage: 0,
          capabilitiesShown: []
        },
        messageCount = 0,
        includeAudio = true
      } = body;

      if (!prompt) {
        return { success: false, error: "No prompt provided", status: 400 };
      }

      // Enforce usage limits
      if (messageCount >= AI_USAGE_LIMITS.maxMessagesPerSession) {
        return {
          success: true,
          data: {
            text: "This AI showcase has reached its demonstration limit. Ready to see the full capabilities in action? Let's schedule your consultation!",
            isLimitReached: true,
            showBooking: true,
            conversationState: { ...conversationState, isLimitReached: true }
          }
        };
      }

      // Extract user info from conversation state
      const userInfo: UserInfo = {
        name: conversationState.name,
        email: conversationState.email,
        companyInfo: conversationState.companyInfo
      };

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [{ googleSearchRetrieval: {} }]
      });

      // Enhanced system instruction
      const systemInstruction = this.buildSystemInstruction(conversationState, userInfo);

      // Enhance prompt based on conversation stage
      let enhancedPrompt = prompt;
      let sidebarActivity = "";

      if (conversationState.stage === CONVERSATION_STAGES.EMAIL_COLLECTED && userInfo.email) {
        const domain = userInfo.email.split('@')[1];
        enhancedPrompt = `User provided email: ${userInfo.email}.
        Analyze company domain "${domain}" and create a response that:
        1. Shows you're analyzing their company background
        2. Provides relevant industry insights from search
        3. Asks about their main business challenge
        
        User message: "${prompt}"`;
        sidebarActivity = "company_analysis";
      }

      // Generate response
      const result = await model.generateContent([
        { text: systemInstruction },
        { text: enhancedPrompt }
      ]);

      const response = result.response;
      const text = response.text();

      // Extract grounding sources if available
      const sources = this.extractGroundingSources(response);

      // Determine next conversation stage
      const nextState = this.determineNextStage(conversationState, prompt, userInfo);

      // Update capabilities shown
      if (sources.length > 0 && !nextState.capabilitiesShown.includes(AI_CAPABILITIES.GOOGLE_SEARCH)) {
        nextState.capabilitiesShown.push(AI_CAPABILITIES.GOOGLE_SEARCH);
      }

      // Generate voice response if requested (placeholder for now)
      let audioData = null;
      if (includeAudio && text) {
        // Voice generation would be handled by a separate service
        sidebarActivity = "voice_generation";
      }

      // Broadcast real-time updates via Supabase
      if (this.supabase) {
        await this.broadcastUpdate({
          text,
          audioData,
          sources,
          sidebarActivity,
          conversationState: nextState,
          timestamp: Date.now()
        });
      }

      // Calculate usage
      const inputTokens = this.estimateTokens(enhancedPrompt);
      const outputTokens = this.estimateTokens(text);
      const cost = this.estimateCost(inputTokens, outputTokens);

      return {
        success: true,
        data: {
          text,
          sources,
          audioData,
          audioMimeType: 'audio/mpeg',
          sidebarActivity,
          conversationState: nextState
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

  private buildSystemInstruction(conversationState: ConversationState, userInfo: UserInfo): string {
    return `You are the F.B/c AI Assistant showcasing advanced AI capabilities for lead generation.

SHOWCASE ALL CAPABILITIES NATURALLY:
- Text generation with personalization
- Real-time Google Search for company intelligence
- Structured output for organized responses
- Thinking process transparency
- Function calling for dynamic actions

CONVERSATION FLOW:
Stage: ${conversationState.stage}
User Info: ${JSON.stringify(userInfo)}
Messages in current stage: ${conversationState.messagesInStage}

CURRENT GUIDANCE: ${conversationState.aiGuidance || 'Engage naturally and guide the conversation.'}

Be engaging, demonstrate AI intelligence, and guide toward consultation booking.
Use their name frequently and show company insights when available.`;
  }

  private extractGroundingSources(response: any): any[] {
    return response.candidates?.[0]?.groundingMetadata?.groundingAttributions
      ?.map((attribution: any) => ({
        title: attribution.content?.parts?.[0]?.text || 'Web Source',
        url: attribution.sourceId?.groundingPassage?.passage?.content || '#',
        snippet: attribution.content?.parts?.[0]?.text || 'Grounded search result'
      })) || [];
  }

  private determineNextStage(
    currentState: ConversationState,
    userMessage: string,
    userInfo: UserInfo
  ): ConversationState {
    let nextState = { ...currentState };
    let nextStage = currentState.stage;
    let aiGuidance = "";
    let messagesInStage = currentState.messagesInStage + 1;

    const transitionTo = (stage: string, guidance: string, activity?: string) => {
      nextStage = stage;
      aiGuidance = guidance;
      messagesInStage = 0;
      if (activity) {
        nextState.sidebarActivity = activity;
      }
    };

    switch (currentState.stage) {
      case CONVERSATION_STAGES.GREETING:
        if (userMessage && userMessage.length > 1 && !userMessage.includes('@')) {
          nextState.name = userMessage.trim();
          transitionTo(
            CONVERSATION_STAGES.EMAIL_REQUEST,
            `Great to meet ${userMessage}! Now ask for their email to personalize the showcase.`
          );
        }
        break;

      case CONVERSATION_STAGES.EMAIL_REQUEST:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(userMessage)) {
          nextState.email = userMessage.trim();
          const domain = userMessage.split('@')[1];
          nextState.companyInfo = { 
            domain, 
            name: domain.split('.')[0] 
          };
          transitionTo(
            CONVERSATION_STAGES.EMAIL_COLLECTED,
            `Email collected. Now analyze their company and engage about business challenges.`,
            "company_analysis"
          );
        }
        break;

      case CONVERSATION_STAGES.EMAIL_COLLECTED:
        transitionTo(
          CONVERSATION_STAGES.INITIAL_DISCOVERY,
          `Company analysis complete. Dive deeper into their specific needs.`
        );
        break;

      case CONVERSATION_STAGES.INITIAL_DISCOVERY:
        if (messagesInStage >= 2) {
          transitionTo(
            CONVERSATION_STAGES.CAPABILITY_INTRODUCTION,
            `Good discovery. Now introduce AI capabilities relevant to their needs.`
          );
        }
        break;

      case CONVERSATION_STAGES.CAPABILITY_INTRODUCTION:
        transitionTo(
          CONVERSATION_STAGES.CAPABILITY_SELECTION,
          `Guide them to select a capability demonstration.`
        );
        break;

      case CONVERSATION_STAGES.CAPABILITY_SELECTION:
        // Check if user is requesting a demo
        const demoKeywords = ['show', 'demo', 'try', 'analyze', 'generate', 'create'];
        if (demoKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
          transitionTo(
            CONVERSATION_STAGES.POST_CAPABILITY_FEEDBACK,
            `Capability demonstrated. Gather feedback and explore business applications.`
          );
        } else if (messagesInStage >= 2) {
          transitionTo(
            CONVERSATION_STAGES.CAPABILITY_SUGGESTION,
            `They seem unsure. Suggest a specific capability demonstration.`
          );
        }
        break;

      case CONVERSATION_STAGES.POST_CAPABILITY_FEEDBACK:
        if (messagesInStage >= 1) {
          transitionTo(
            CONVERSATION_STAGES.SOLUTION_DISCUSSION,
            `Good feedback received. Discuss how F.B/c can implement these solutions.`
          );
        }
        break;

      case CONVERSATION_STAGES.SOLUTION_DISCUSSION:
        if (messagesInStage >= 2) {
          transitionTo(
            CONVERSATION_STAGES.SUMMARY_OFFER,
            `Discussion complete. Offer to generate a personalized summary.`
          );
        }
        break;

      case CONVERSATION_STAGES.SUMMARY_OFFER:
        if (userMessage.toLowerCase().match(/yes|ok|sure|please|generate|summary/)) {
          transitionTo(
            CONVERSATION_STAGES.FINALIZING,
            `Generate summary and guide to consultation booking.`,
            "summary_generation"
          );
        }
        break;
    }

    return {
      ...nextState,
      stage: nextStage,
      messagesInStage,
      aiGuidance
    };
  }

  private async broadcastUpdate(payload: any): Promise<void> {
    if (!this.supabase) return;
    
    try {
      await this.supabase.channel('ai-showcase')
        .send({
          type: 'broadcast',
          event: 'ai-response',
          payload
        });
    } catch (error) {
      console.error('Supabase broadcast error:', error);
    }
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = inputTokens * 0.000001;
    const outputCost = outputTokens * 0.000002;
    return inputCost + outputCost;
  }
}