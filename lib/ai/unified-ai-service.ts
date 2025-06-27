import { GoogleGenerativeAI as GoogleGenAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Unified types
export interface AIServiceConfig {
  geminiApiKey?: string;
  elevenLabsApiKey?: string;
  elevenLabsVoiceId?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export interface ConversationState {
  sessionId: string;
  stage: string;
  messages: Message[];
  messagesInStage: number;
  name?: string;
  email?: string;
  companyInfo?: CompanyInfo;
  aiGuidance?: string;
  sidebarActivity?: string;
  isLimitReached?: boolean;
  showBooking?: boolean;
}

export interface Message {
  id?: string;
  text: string;
  content?: string;
  sender: 'user' | 'ai' | 'model';
  role?: string;
  timestamp?: Date;
  parts?: { text: string }[];
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
    sources?: any[];
    audioData?: string;
    audioMimeType?: string;
    sidebarActivity?: string;
    conversationState?: ConversationState;
    [key: string]: any;
  };
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
}

export const AI_USAGE_LIMITS = {
  maxMessagesPerSession: 15,
  maxImageGeneration: 2,
  maxVideoAnalysis: 1,
  maxCodeExecution: 3,
  maxDocumentAnalysis: 2,
} as const;

export const CONVERSATION_STAGES = {
  GREETING: 'greeting',
  EMAIL_REQUEST: 'email_request',
  EMAIL_COLLECTED: 'email_collected',
  DISCOVERY: 'discovery',
  CAPABILITY_SHOWCASE: 'capability_showcase',
  SOLUTION_POSITIONING: 'solution_positioning',
  SUMMARY_GENERATION: 'summary_generation',
} as const;

export class UnifiedAIService {
  private genAI: GoogleGenAI | null = null;
  private elevenLabsClient: ElevenLabsClient | null = null;
  private supabaseClient: ReturnType<typeof createClient> | null = null;
  
  constructor(private config: AIServiceConfig) {
    this.initializeServices();
  }

  private initializeServices() {
    // Initialize Gemini
    if (this.config.geminiApiKey) {
      this.genAI = new GoogleGenAI(this.config.geminiApiKey);
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

      // Check usage limits
      if (messageCount >= AI_USAGE_LIMITS.maxMessagesPerSession) {
        return {
          success: true,
          data: {
            text: "This AI showcase has reached its demonstration limit. Ready to see the full capabilities in action? Let's schedule your consultation!",
            isLimitReached: true,
            showBooking: true,
            conversationState: { ...conversationState as ConversationState, isLimitReached: true }
          }
        };
      }

      const currentState = {
        sessionId: conversationState.sessionId || `session_${Date.now()}`,
        stage: conversationState.stage || CONVERSATION_STAGES.GREETING,
        messages: conversationState.messages || [],
        messagesInStage: conversationState.messagesInStage || 0,
        ...conversationState
      } as ConversationState;

      // Build user info
      const userInfo = {
        name: currentState.name,
        email: currentState.email,
        companyInfo: currentState.companyInfo
      };

      // If no API key, use mock response
      if (!this.genAI) {
        const mockResponse = this.getMockResponse(currentState.stage, prompt, userInfo);
        return {
          success: true,
          data: {
            text: mockResponse.text,
            sources: [],
            audioData: undefined,
            audioMimeType: 'audio/mpeg',
            sidebarActivity: mockResponse.sidebarActivity,
            conversationState: mockResponse.nextState
          }
        };
      }

      // Generate AI response
      const systemPrompt = this.buildSystemPrompt(currentState, userInfo);
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash'
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\n" + prompt }] }]
      });
      
      const response = result.response;
      const text = response.text();

      // Extract sources if available
      const sources = this.extractGroundingSources(response);

      // Determine next stage
      const nextState = this.determineNextStage(currentState, prompt, userInfo);

      // Generate voice if requested
      let audioData: string | undefined = undefined;
      let sidebarActivity = '';
      
      if (currentState.stage === CONVERSATION_STAGES.EMAIL_COLLECTED && userInfo.email) {
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
          timestamp: Date.now()
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
          conversationState: nextState
        },
        usage: { inputTokens, outputTokens, cost }
      };
    } catch (error: any) {
      console.error('Conversational flow error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process conversation'
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
            description: 'Professional image generation prompt created for business use',
            sidebarActivity: 'image_generation',
            note: 'Ready-to-use prompt for any AI image generation service'
          }
        };
      }

      // Use Gemini to create an even more detailed prompt
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(`Create a highly detailed, professional image generation prompt for: "${prompt}"

The prompt should be optimized for AI image generators like DALL-E, Midjourney, or Stable Diffusion.

Include:
1. Detailed visual description
2. Professional style guidelines
3. Color palette specifications
4. Lighting and composition notes
5. Business context elements
6. Technical quality specifications

Make it comprehensive enough that any AI image generator would create a polished, business-ready image.`);

      const detailedPrompt = result.response.text();

      if (this.supabaseClient) {
        await this.broadcastSidebarUpdate('image_generation', '🎨 Creating professional image specifications...');
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
          note: 'Professional-grade prompt ready for any AI image service'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to generate image prompt'
      };
    }
  }

  async handleLeadCapture(conversationState: ConversationState): Promise<AIResponse> {
    try {
      if (!conversationState.name || !conversationState.email) {
        return {
          success: false,
          error: 'Missing required lead information'
        };
      }

      const leadScore = this.calculateLeadScore(conversationState);
      const capabilities = this.extractCapabilitiesShown(conversationState);

      let summary: string;
      
      if (this.genAI) {
        const summaryPrompt = `Create a professional AI consultation summary for ${conversationState.name}.
        
        Based on conversation: ${JSON.stringify(conversationState.messages)}
        
        Include:
        1. Executive Summary
        2. AI Capabilities Demonstrated
        3. Business Opportunities
        4. Recommended Next Steps`;

        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
            ai_capabilities_shown: capabilities
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
          capabilitiesShown: capabilities
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to capture lead'
      };
    }
  }

  // Helper methods
  private buildSystemPrompt(conversationState: ConversationState, userInfo: any): string {
    return `You are the F.B/c AI Assistant showcasing advanced AI capabilities for lead generation.

SHOWCASE CAPABILITIES NATURALLY:
- Text generation with personalization
- Real-time insights and analysis
- Structured output for organized responses
- Thinking process transparency
- Dynamic conversational flow

CONVERSATION FLOW:
Stage: ${conversationState.stage}
User Info: ${JSON.stringify(userInfo)}
Messages in stage: ${conversationState.messagesInStage}

Be engaging, demonstrate AI intelligence, and guide toward consultation booking.
Use their name frequently if provided and show company insights when available.`;
  }

  private extractGroundingSources(response: any): any[] {
    return response.candidates?.[0]?.groundingMetadata?.groundingAttributions
      ?.map((attribution: any) => ({
        title: attribution.web?.title || 'Web Source',
        url: attribution.web?.uri || '#',
        snippet: attribution.web?.title || 'Grounded search result'
      })) || [];
  }

  private determineNextStage(
    currentState: ConversationState,
    userMessage: string,
    userInfo: any
  ): ConversationState {
    const { stage } = currentState;
    let nextStage = stage;
    let messagesInStage = currentState.messagesInStage + 1;

    switch (stage) {
      case CONVERSATION_STAGES.GREETING:
        if (userMessage.length > 0 && !userMessage.includes('@')) {
          nextStage = CONVERSATION_STAGES.EMAIL_REQUEST;
          messagesInStage = 0;
        }
        break;
      case CONVERSATION_STAGES.EMAIL_REQUEST:
        if (userMessage.includes('@')) {
          nextStage = CONVERSATION_STAGES.EMAIL_COLLECTED;
          messagesInStage = 0;
        }
        break;
      case CONVERSATION_STAGES.EMAIL_COLLECTED:
        nextStage = CONVERSATION_STAGES.DISCOVERY;
        break;
      case CONVERSATION_STAGES.DISCOVERY:
        if (messagesInStage > 3) {
          nextStage = CONVERSATION_STAGES.CAPABILITY_SHOWCASE;
          messagesInStage = 0;
        }
        break;
      case CONVERSATION_STAGES.CAPABILITY_SHOWCASE:
        if (currentState.messages.length > 10) {
          nextStage = CONVERSATION_STAGES.SOLUTION_POSITIONING;
          messagesInStage = 0;
        }
        break;
    }

    return {
      ...currentState,
      stage: nextStage,
      messagesInStage,
      email: userMessage.includes('@') ? userMessage : currentState.email
    };
  }

  private async generateVoice(text: string): Promise<{ audioBase64: string } | null> {
    if (!this.elevenLabsClient) return null;

    try {
      const voiceId = this.config.elevenLabsVoiceId || '21m00tcm4tlvdq8ikwam';
      
      const audioStream = await this.elevenLabsClient.textToSpeech.convert(voiceId, {
        text,
        modelId: 'eleven_turbo_v2_5',
        voiceSettings: {
          stability: 0.8,
          similarityBoost: 0.9,
          style: 0.4,
          useSpeakerBoost: true
        }
      });

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
    } catch (error) {
      console.error('Voice generation error:', error);
      return null;
    }
  }

  private async broadcastUpdate(payload: any): Promise<void> {
    if (!this.supabaseClient) return;
    
    try {
      await this.supabaseClient.channel('ai-showcase')
        .send({
          type: 'broadcast',
          event: 'ai-response',
          payload
        });
    } catch (error) {
      console.error('Supabase broadcast error:', error);
    }
  }

  private async broadcastSidebarUpdate(activity: string, message: string): Promise<void> {
    if (!this.supabaseClient) return;
    
    try {
      await this.supabaseClient.channel('ai-showcase')
        .send({
          type: 'broadcast',
          event: 'sidebar-update',
          payload: {
            activity,
            message,
            timestamp: Date.now()
          }
        });
    } catch (error) {
      console.error('Supabase broadcast error:', error);
    }
  }

  private calculateLeadScore(conversationState: ConversationState): number {
    let score = 0;
    
    if (conversationState.email) score += 20;
    
    const domain = conversationState.email?.split('@')[1] || '';
    if (!['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
      score += 20;
    }
    
    if (conversationState.messages?.length > 8) score += 15;
    if (conversationState.messages?.length > 15) score += 10;
    
    const capabilities = this.extractCapabilitiesShown(conversationState);
    score += capabilities.length * 10;
    
    return Math.min(score, 100);
  }

  private extractCapabilitiesShown(conversationState: ConversationState): string[] {
    const capabilities = new Set<string>();
    const messages = JSON.stringify(conversationState.messages || []).toLowerCase();
    
    if (messages.includes('image')) capabilities.add('Image Generation');
    if (messages.includes('video')) capabilities.add('Video Analysis');
    if (messages.includes('document')) capabilities.add('Document Processing');
    if (messages.includes('code')) capabilities.add('Code Execution');
    if (messages.includes('website') || messages.includes('url')) capabilities.add('URL Analysis');
    if (messages.includes('voice') || messages.includes('audio')) capabilities.add('Voice Generation');
    
    return Array.from(capabilities);
  }

  private generateEmailContent(name: string, email: string, summary: string, leadScore: number): string {
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

  private getMockResponse(stage: string, prompt: string, userInfo: any) {
    const responses: Record<string, any> = {
      greeting: {
        text: "Welcome to F.B/c AI Showcase! I'm here to demonstrate how AI can transform your business. I'm Farzad's AI assistant, and I'll be showing you some amazing capabilities today. What's your name?",
        sidebarActivity: 'greeting',
        nextState: { stage: CONVERSATION_STAGES.EMAIL_REQUEST, messagesInStage: 0 }
      },
      email_request: {
        text: `Nice to meet you! To personalize this experience and send you a summary of our conversation, could you please share your email address?`,
        sidebarActivity: 'collecting_info',
        nextState: { stage: CONVERSATION_STAGES.EMAIL_COLLECTED, messagesInStage: 0 }
      },
      email_collected: {
        text: `Perfect! I'm analyzing your company domain to provide relevant insights. Let me show you what AI can do for your business. What's your biggest business challenge right now?`,
        sidebarActivity: 'company_analysis',
        nextState: { stage: CONVERSATION_STAGES.DISCOVERY, messagesInStage: 0 }
      }
    };
    
    const response = responses[stage] || responses.greeting;
    
    return {
      ...response,
      nextState: {
        ...response.nextState,
        name: userInfo?.name,
        email: userInfo?.email,
        companyInfo: userInfo?.companyInfo
      }
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