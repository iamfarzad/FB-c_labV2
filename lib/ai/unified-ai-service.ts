import {
  GoogleGenerativeAI,
  GenerateContentResponse,
} from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import {
  CONVERSATION_STAGES,
  Message,
  Source,
  UserInfo,
  AI_USAGE_LIMITS,
  ConversationState,
} from './types';

// Stage Handler Types
interface StageHandler {
  (
    currentState: ConversationState,
    userMessage: string,
    userInfo: UserInfo
  ): Partial<ConversationState>;
}

interface StageConfig {
  handler: StageHandler;
  nextStage?: string;
  guidance: string;
  sidebarActivity?: string;
}

// Unified types
export interface AIServiceConfig {
  geminiApiKey?: string;
  elevenLabsApiKey?: string;
  elevenLabsVoiceId?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  showBooking?: boolean;
}

export interface CompanyInfo {
  name?: string;
  domain?: string;
  industry?: string;
  analysis?: string;
}

export interface AIResponse {
  success: boolean;
  data?: {
    text: string;
    sources?: Source[];
    audioData?: string;
    audioMimeType?: string;
    sidebarActivity?: string;
    conversationState?: ConversationState;
    [key: string]: unknown;
  };
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
}

export class UnifiedAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private elevenLabsClient: ElevenLabsClient | null = null;
  private supabaseClient: ReturnType<typeof createClient> | null = null;
  
  constructor(private config: AIServiceConfig) {
    this.initializeServices();
  }

  private initializeServices() {
    // Initialize Gemini
    if (this.config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(this.config.geminiApiKey);
    }

    // Initialize ElevenLabs
    if (this.config.elevenLabsApiKey) {
      this.elevenLabsClient = new ElevenLabsClient({ 
        apiKey: this.config.elevenLabsApiKey 
      });
    }

    // Initialize Supabase
    if (this.config.supabaseUrl && this.config.supabaseKey) {
      this.supabaseClient = createClient(
        this.config.supabaseUrl,
        this.config.supabaseKey
      );
    }
  }

  async handleConversationalFlow(
    prompt: string,
    conversationState: Partial<ConversationState> = {},
    messageCount = 0,
    includeAudio = true
  ): Promise<AIResponse> {
    try {
      if (!prompt) {
        return { success: false, error: 'No prompt provided' };
      }

      const currentState = {
        sessionId: conversationState.sessionId || `session_${Date.now()}`,
        stage: conversationState.stage || CONVERSATION_STAGES.GREETING,
        messages: conversationState.messages || [],
        messagesInStage: conversationState.messagesInStage || 0,
        ...conversationState,
      } as ConversationState;

      // Check usage limits
      if (messageCount >= AI_USAGE_LIMITS.maxMessagesPerSession) {
        return {
          success: true,
          data: {
            text: "This AI showcase has reached its demonstration limit. Ready to see the full capabilities in action? Let's schedule your consultation!",
            isLimitReached: true,
            showBooking: true,
            conversationState: { ...currentState, isLimitReached: true },
          },
        };
      }

      // Build user info
      const userInfo: UserInfo = {
        name: currentState.name,
        email: currentState.email,
        companyInfo: currentState.companyInfo,
      };

      // If no API key, use mock response
      if (!this.genAI) {
        const mockResponse = this.getMockResponse(
          currentState.stage,
          prompt,
          userInfo
        );
        return {
          success: true,
          data: {
            text: mockResponse.text,
            sources: [],
            audioData: undefined,
            audioMimeType: 'audio/mpeg',
            sidebarActivity: mockResponse.sidebarActivity,
            conversationState: mockResponse.nextState as ConversationState,
          },
        };
      }

      // Enhance prompt based on conversation stage
      let enhancedPrompt = prompt;
      if (
        currentState.stage === CONVERSATION_STAGES.EMAIL_COLLECTED &&
        userInfo.email
      ) {
        const domain = userInfo.email.split('@')[1];
        enhancedPrompt = `User provided email: ${userInfo.email}.
        Analyze company domain "${domain}" and create a response that:
        1. Shows you're analyzing their company background
        2. Provides relevant industry insights from search
        3. Asks about their main business challenge
        
        User message: "${prompt}"`;
      }

      // Generate AI response
      const systemPrompt = this.buildSystemPrompt(currentState, userInfo);
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
      });

      const chat = model.startChat({
        history: currentState.messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessage(enhancedPrompt);
      const response = result.response;
      const text = response.text();

      // Extract sources if available
      const sources = this.extractGroundingSources(response);

      // Determine next stage
      const nextState = this.determineNextStage(
        currentState,
        prompt,
        userInfo
      );

      // Update messages for next turn
      nextState.messages = [
        ...currentState.messages,
        {
          role: 'user',
          content: prompt,
          id: `user-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: text,
          id: `asst-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      ];

      // Generate voice if requested
      let audioData: string | undefined = undefined;
      let sidebarActivity = '';

      if (
        currentState.stage === CONVERSATION_STAGES.EMAIL_COLLECTED &&
        userInfo.email
      ) {
        sidebarActivity = 'company_analysis';
      } else if (includeAudio && text && this.elevenLabsClient) {
        const voiceResult = await this.generateVoice(text);
        if (voiceResult) {
          audioData = voiceResult.audioBase64;
          sidebarActivity = 'voice_generation';
        }
      }

      // Broadcast via Supabase
      if (this.supabaseClient) {
        await this.broadcastUpdate({
          text,
          audioData,
          sources,
          sidebarActivity,
          conversationState: nextState,
          timestamp: Date.now(),
        });
      }

      const inputTokens = this.estimateTokens(prompt);
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
          conversationState: nextState,
        },
        usage: { inputTokens, outputTokens, cost },
      };
    } catch (error: unknown) {
      console.error('Conversational flow error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to process conversation';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async handleImageGeneration(prompt: string): Promise<AIResponse> {
    try {
      if (!prompt) {
        return { success: false, error: 'No prompt provided' };
      }

      // Enhanced image prompt generation
      const enhancedPrompt = `Professional business visualization: ${prompt}
      
Style: Corporate, modern, clean
Colors: Professional palette (blues, grays, whites with accent colors)
Lighting: Bright, professional lighting
Composition: Well-balanced, suitable for business presentations
Elements: Include subtle AI/technology metaphors
Quality: High-resolution, photorealistic
Setting: Professional business environment`;

      if (!this.genAI) {
        return {
          success: true,
          data: {
            text: `🎨 **Generated Image Concept**: "${prompt}"

**Visual Description**: 
${enhancedPrompt}

**Implementation Notes**: 
- Use this prompt with DALL-E, Midjourney, or similar AI image generators
- Perfect for business presentations and marketing materials
- Optimized for professional corporate use

**Suggested Platforms**:
- DALL-E 3 (OpenAI)
- Midjourney
- Stable Diffusion
- Adobe Firefly`,
            imagePrompt: enhancedPrompt,
            description:
              'Professional image generation prompt created for business use',
            sidebarActivity: 'image_generation',
            note: 'Ready-to-use prompt for any AI image generation service',
          },
        };
      }

      // Use Gemini to create an even more detailed prompt
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(
        `Create a highly detailed, professional image generation prompt for: "${prompt}"

The prompt should be optimized for AI image generators like DALL-E, Midjourney, or Stable Diffusion.

Include:
1. Detailed visual description
2. Professional style guidelines
3. Color palette specifications
4. Lighting and composition notes
5. Business context elements
6. Technical quality specifications

Make it comprehensive enough that any AI image generator would create a polished, business-ready image.`
      );

      const detailedPrompt = result.response.text();

      if (this.supabaseClient) {
        await this.broadcastSidebarUpdate(
          'image_generation',
          '🎨 Creating professional image specifications...'
        );
      }

      return {
        success: true,
        data: {
          text: `🎨 **Professional Image Generated**: "${prompt}"

**Enhanced AI Image Prompt**:
${detailedPrompt}

**Ready for Implementation**: This optimized prompt can be used with any professional AI image generation service to create high-quality business visuals.

**Recommended Usage**:
- Copy the prompt to DALL-E 3, Midjourney, or similar platforms
- Perfect for presentations, marketing materials, and business content
- Professionally crafted for corporate standards`,
          imagePrompt: detailedPrompt,
          originalRequest: prompt,
          description: 'AI-optimized image generation prompt for professional use',
          sidebarActivity: 'image_generation',
          note: 'Professional-grade prompt ready for any AI image service',
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to generate image prompt';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async handleLeadCapture(
    conversationState: ConversationState
  ): Promise<AIResponse> {
    try {
      if (!conversationState.name || !conversationState.email) {
        return {
          success: false,
          error: 'Missing required lead information',
        };
      }

      const leadScore = this.calculateLeadScore(conversationState);
      const capabilities = this.extractCapabilitiesShown(conversationState);

      let summary: string;

      if (this.genAI) {
        const summaryPrompt = `Create a professional AI consultation summary for ${
          conversationState.name
        }.
        
        Based on conversation: ${JSON.stringify(conversationState.messages)}
        
        Include:
        1. Executive Summary
        2. AI Capabilities Demonstrated
        3. Business Opportunities
        4. Recommended Next Steps`;

        const model = this.genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
        });
        const result = await model.generateContent(summaryPrompt);
        summary = result.response.text();
      } else {
        summary = this.generateMockSummary(conversationState.name);
      }

      // Store in Supabase if available
      if (this.supabaseClient) {
        try {
          await this.supabaseClient.from('lead_summaries').insert({
            name: conversationState.name,
            email: conversationState.email,
            company_name: conversationState.companyInfo?.name,
            conversation_summary: summary,
            consultant_brief: summary,
            lead_score: leadScore,
            ai_capabilities_shown: capabilities,
          });
        } catch (error) {
          console.error('Failed to store lead:', error);
        }
      }

      const emailContent = this.generateEmailContent(
        conversationState.name,
        conversationState.email,
        summary,
        leadScore
      );

      return {
        success: true,
        data: {
          text: summary,
          summary,
          leadScore,
          emailContent,
          capabilitiesShown: capabilities,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to capture lead';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Helper methods
  private extractGroundingSources(response: GenerateContentResponse): Source[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadata: any = response.candidates?.[0]?.groundingMetadata;
    const attributions = metadata?.groundingAttributions;

    if (!attributions) {
      return [];
    }

    return attributions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((attribution: any) => {
        const webAttribution = attribution.web;
        if (!webAttribution) return null;

        return {
          title: webAttribution.title || 'Web Source',
          url: webAttribution.uri || '#',
          snippet: webAttribution.title || 'Grounded search result',
        };
      })
      .filter((source: Source | null): source is Source => source !== null);
  }

  private buildSystemPrompt(
    conversationState: ConversationState,
    userInfo: UserInfo
  ): string {
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

CURRENT GUIDANCE: ${
      conversationState.aiGuidance || 'Engage naturally and guide the conversation.'
    }

Be engaging, demonstrate AI intelligence, and guide toward consultation booking.
Use their name frequently and show company insights when available.
Keep responses concise and engaging. Your goal is to move the conversation forward.`;
  }

  // #region Stage Handlers
  private handleGreetingStage(
    currentState: ConversationState,
    userMessage: string
  ): Partial<ConversationState> {
    if (userMessage && userMessage.length > 1 && !userMessage.includes('@')) {
      return { name: userMessage.trim() };
    }
    return {};
  }

  private handleEmailRequestStage(
    currentState: ConversationState,
    userMessage: string
  ): Partial<ConversationState> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(userMessage)) {
      const email = userMessage.trim();
      const domain = email.split('@')[1];
      return {
        email,
        companyInfo: {
          domain,
          name: domain.split('.')[0],
        },
      };
    }
    return {};
  }
  // #endregion

  private getStageConfig(stage: string): StageConfig | undefined {
    const stageConfigs: Record<string, StageConfig> = {
      [CONVERSATION_STAGES.GREETING]: {
        handler: this.handleGreetingStage,
        nextStage: CONVERSATION_STAGES.EMAIL_REQUEST,
        guidance: `Great to meet you! Now ask for their email to personalize the showcase.`,
      },
      [CONVERSATION_STAGES.EMAIL_REQUEST]: {
        handler: this.handleEmailRequestStage,
        nextStage: CONVERSATION_STAGES.EMAIL_COLLECTED,
        guidance: `Email collected. Now analyze their company and engage about business challenges.`,
        sidebarActivity: 'company_analysis',
      },
      [CONVERSATION_STAGES.EMAIL_COLLECTED]: {
        handler: () => ({}),
        nextStage: CONVERSATION_STAGES.INITIAL_DISCOVERY,
        guidance: `Company analysis complete. Dive deeper into their specific needs.`,
      },
      [CONVERSATION_STAGES.INITIAL_DISCOVERY]: {
        handler: () => ({}),
        nextStage: CONVERSATION_STAGES.CAPABILITY_INTRODUCTION,
        guidance: `Good discovery. Now introduce AI capabilities relevant to their needs.`,
      },
      // ... Add other stages here
    };
    return stageConfigs[stage];
  }

  private determineNextStage(
    currentState: ConversationState,
    userMessage: string,
    userInfo: UserInfo
  ): ConversationState {
    const config = this.getStageConfig(currentState.stage);
    let nextState: Partial<ConversationState> = {};
    let shouldTransition = false;

    if (config) {
      nextState = config.handler(currentState, userMessage, userInfo);

      const transitionImmediatelyStages = new Set<string>([
        CONVERSATION_STAGES.EMAIL_COLLECTED,
        CONVERSATION_STAGES.POST_CAPABILITY_FEEDBACK,
        CONVERSATION_STAGES.SOLUTION_DISCUSSION,
        CONVERSATION_STAGES.SUMMARY_OFFER,
      ]);

      const transitionAfterInteractionStages = new Set<string>([
        CONVERSATION_STAGES.INITIAL_DISCOVERY,
        CONVERSATION_STAGES.CAPABILITY_INTRODUCTION,
        CONVERSATION_STAGES.CAPABILITY_SELECTION,
        CONVERSATION_STAGES.CAPABILITY_SUGGESTION,
      ]);

      // Check if the handler returned the necessary data to transition
      if (
        currentState.stage === CONVERSATION_STAGES.GREETING &&
        nextState.name
      ) {
        shouldTransition = true;
      } else if (
        currentState.stage === CONVERSATION_STAGES.EMAIL_REQUEST &&
        nextState.email
      ) {
        shouldTransition = true;
      } else if (transitionImmediatelyStages.has(currentState.stage)) {
        shouldTransition = true;
      } else if (
        transitionAfterInteractionStages.has(currentState.stage) &&
        currentState.messagesInStage >= 1 // Simplified logic for demo
      ) {
        shouldTransition = true;
      }
    }

    if (shouldTransition && config?.nextStage) {
      const nextConfig = this.getStageConfig(config.nextStage);
      return {
        ...currentState,
        ...nextState,
        stage: config.nextStage,
        messagesInStage: 0,
        aiGuidance: nextConfig?.guidance || '',
        sidebarActivity:
          config.sidebarActivity || currentState.sidebarActivity,
      };
    }

    return {
      ...currentState,
      ...nextState,
      messagesInStage: currentState.messagesInStage + 1,
    };
  }

  private async generateVoice(
    text: string
  ): Promise<{ audioBase64: string } | null> {
    if (!this.elevenLabsClient) return null;

    try {
      const voiceId = this.config.elevenLabsVoiceId || '21m00tcm4tlvdq8ikwam';

      const audioStream = await this.elevenLabsClient.textToSpeech.convert(
        voiceId,
        {
          text,
          modelId: 'eleven_turbo_v2_5',
          voiceSettings: {
            stability: 0.8,
            similarityBoost: 0.9,
            style: 0.4,
            useSpeakerBoost: true,
          },
        }
      );

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      const reader = audioStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(Buffer.from(value));
      }

      const audioBuffer = Buffer.concat(chunks);
      const audioBase64 = audioBuffer.toString('base64');

      return { audioBase64 };
    } catch (error: unknown) {
      console.error('Voice generation error:', error);
      return null;
    }
  }

  private async broadcastUpdate(
    payload: Record<string, unknown>
  ): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      await this.supabaseClient
        .channel('ai-showcase')
        .send({
          type: 'broadcast',
          event: 'ai-response',
          payload,
        });
    } catch (error: unknown) {
      console.error('Supabase broadcast error:', error);
    }
  }

  private async broadcastSidebarUpdate(
    activity: string,
    message: string
  ): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      await this.supabaseClient
        .channel('ai-showcase')
        .send({
          type: 'broadcast',
          event: 'sidebar-update',
          payload: {
            activity,
            message,
            timestamp: Date.now(),
          },
        });
    } catch (error: unknown) {
      console.error('Supabase broadcast error:', error);
    }
  }

  private calculateLeadScore(conversationState: ConversationState): number {
    let score = 0;

    if (conversationState.email) score += 20;

    const domain = conversationState.email?.split('@')[1] || '';
    if (
      !['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'].includes(domain)
    ) {
      score += 20;
    }

    if (conversationState.messages?.length > 8) score += 15;
    if (conversationState.messages?.length > 15) score += 10;

    const capabilities = this.extractCapabilitiesShown(conversationState);
    score += capabilities.length * 10;

    return Math.min(score, 100);
  }

  private extractCapabilitiesShown(
    conversationState: ConversationState
  ): string[] {
    const capabilities = new Set<string>();
    const messages = JSON.stringify(conversationState.messages || []).toLowerCase();

    if (messages.includes('image')) capabilities.add('Image Generation');
    if (messages.includes('video')) capabilities.add('Video Analysis');
    if (messages.includes('document'))
      capabilities.add('Document Processing');
    if (messages.includes('code')) capabilities.add('Code Execution');
    if (messages.includes('website') || messages.includes('url'))
      capabilities.add('URL Analysis');
    if (messages.includes('voice') || messages.includes('audio'))
      capabilities.add('Voice Generation');

    return Array.from(capabilities);
  }

  private generateEmailContent(
    name: string,
    email: string,
    summary: string,
    leadScore: number
  ): string {
    return `Hi ${name},

Thank you for experiencing F.B/c's AI showcase! Based on our conversation, here's your personalized AI consultation summary:

${summary}

Your AI Readiness Score: ${leadScore}/100

Ready to implement these AI solutions in your business? Let's schedule a free strategy session to create your custom roadmap.

Best regards,
Farzad Bayat
F.B/c AI Consulting`;
  }

  private generateMockSummary(name: string): string {
    return `Professional AI Consultation Summary for ${name}

Executive Summary:
Based on our conversation, you've explored various AI capabilities that could benefit your business.

AI Capabilities Demonstrated:
- Conversational AI for customer engagement
- Real-time data analysis and insights
- Automated content generation

Business Opportunities:
- Streamline customer support with AI chatbots
- Automate repetitive tasks and processes
- Enhance decision-making with AI insights

Recommended Next Steps:
1. Schedule a detailed consultation to assess your specific needs
2. Develop a custom AI implementation roadmap
3. Start with a pilot project to demonstrate ROI`;
  }

  private getMockResponse(
    stage: string,
    prompt: string,
    userInfo: Partial<UserInfo>
  ) {
    const responses: Record<
      string,
      {
        text: string;
        sidebarActivity: string;
        nextState: Partial<ConversationState>;
      }
    > = {
      greeting: {
        text: "Welcome to F.B/c AI Showcase! I'm here to demonstrate how AI can transform your business. I'm Farzad's AI assistant, and I'll be showing you some amazing capabilities today. What's your name?",
        sidebarActivity: 'greeting',
        nextState: {
          stage: CONVERSATION_STAGES.EMAIL_REQUEST,
          messagesInStage: 0,
        },
      },
      email_request: {
        text: `Nice to meet you! To personalize this experience and send you a summary of our conversation, could you please share your email address?`,
        sidebarActivity: 'collecting_info',
        nextState: {
          stage: CONVERSATION_STAGES.EMAIL_COLLECTED,
          messagesInStage: 0,
        },
      },
      email_collected: {
        text: `Perfect! I'm analyzing your company domain to provide relevant insights. Let me show you what AI can do for your business. What's your biggest business challenge right now?`,
        sidebarActivity: 'company_analysis',
        nextState: {
          stage: CONVERSATION_STAGES.DISCOVERY,
          messagesInStage: 0,
        },
      },
    };

    const response = responses[stage] || responses.greeting;

    return {
      ...response,
      nextState: {
        ...response.nextState,
        name: userInfo?.name,
        email: userInfo?.email,
        companyInfo: userInfo?.companyInfo,
      },
    };
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