import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ProxyRequestBody, 
  ProxyResponse,
  Message,
  UserInfo,
  LeadSummary,
  AI_CAPABILITIES
} from '@/api/ai-service/types';

export class LeadCaptureHandler {
  private genAI: GoogleGenerativeAI;
  private supabase: SupabaseClient | null;

  constructor(apiKey: string, supabaseUrl?: string, supabaseKey?: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.supabase = supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey) 
      : null;
  }

  async handleLeadCapture(body: ProxyRequestBody): Promise<ProxyResponse> {
    try {
      const { 
        conversationHistory = [], 
        userInfo,
        action = 'generate_summary'
      } = body;

      if (!conversationHistory || !userInfo?.name || !userInfo?.email) {
        return { 
          success: false, 
          error: "Missing required lead information", 
          status: 400 
        };
      }

      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest" 
      });

      switch (action) {
        case 'generate_summary':
          return await this.generateCompleteSummary(model, conversationHistory, userInfo);
        case 'calculate_score':
          return this.calculateLeadScoreOnly(conversationHistory, userInfo);
        default:
          return {
            success: false,
            error: "Invalid action specified",
            status: 400
          };
      }
    } catch (error: any) {
      console.error("Error in handleLeadCapture:", error);
      return {
        success: false,
        error: error.message || "Failed to process lead capture",
        status: 500
      };
    }
  }

  private async generateCompleteSummary(
    model: any,
    conversationHistory: Message[],
    userInfo: UserInfo
  ): Promise<ProxyResponse> {
    // Generate conversation summary for the lead
    const summaryPrompt = `Create a comprehensive F.B/c AI consultation summary for ${userInfo.name}.

    **AI CAPABILITIES DEMONSTRATED:**
    - Real-time conversation intelligence
    - Company research and analysis
    - Multimodal content processing
    - Voice generation and interaction
    - Business process optimization
    - Custom solution development

    **CONVERSATION ANALYSIS:**
    ${this.formatConversationHistory(conversationHistory)}

    **CREATE STRUCTURED SUMMARY:**
    1. **Executive Summary**: Key business insights discovered (2-3 sentences)
    2. **AI Capabilities Showcased**: List specific features demonstrated with examples
    3. **Business Opportunities**: How AI can help ${userInfo.companyInfo?.name || 'their company'} (3-5 specific opportunities)
    4. **Recommended Solutions**: Specific F.B/c services that match their needs
    5. **Implementation Roadmap**: Practical next steps with timeline
    6. **ROI Projections**: Expected business value with metrics
    7. **Next Steps**: Clear call-to-action for consultation

    Make it professional, actionable, and compelling for ${userInfo.name}.
    Focus on specific business value, not generic AI benefits.`;

    const summaryResult = await model.generateContent(summaryPrompt);
    const summary = summaryResult.response.text();

    // Generate consultant brief
    const briefPrompt = `Create a detailed consultant brief for Farzad's follow-up with ${userInfo.name}.

    **LEAD QUALIFICATION BRIEF**
    
    **Contact Information:**
    - Name: ${userInfo.name}
    - Email: ${userInfo.email}
    - Company: ${userInfo.companyInfo?.name || 'Unknown'}
    - Industry: ${userInfo.companyInfo?.industry || 'Unknown'}

    **AI SHOWCASE RESULTS:**
    Analyze what AI capabilities resonated most with this prospect based on their interactions:
    ${this.formatConversationHistory(conversationHistory)}

    **BUSINESS INTELLIGENCE:**
    1. **Primary Pain Points**: Extract specific challenges they expressed
    2. **AI Readiness Level**: Assess their technological sophistication (beginner/intermediate/advanced)
    3. **Decision Authority**: Analyze if they're a decision maker or influencer
    4. **Budget Indicators**: Look for any signals about investment capacity
    5. **Urgency Level**: Determine how urgent their need for AI solutions is
    6. **Service Fit Analysis**: Recommend training workshop vs consulting engagement

    **FOLLOW-UP STRATEGY:**
    - Key talking points for consultation call
    - Specific case studies to reference
    - Recommended solution approach
    - Pricing strategy considerations
    - Potential objections and responses

    **CONVERSATION INSIGHTS:**
    Provide specific quotes or moments from the conversation that indicate buying intent or concerns.

    Create actionable intelligence for converting this lead.`;

    const briefResult = await model.generateContent(briefPrompt);
    const brief = briefResult.response.text();

    // Calculate lead score
    const leadScore = this.calculateLeadScore(conversationHistory, userInfo);
    const capabilitiesShown = this.extractCapabilitiesShown(conversationHistory);

    // Store in Supabase if available
    let leadId: string | undefined;
    if (this.supabase) {
      try {
        const leadData: LeadSummary = {
          name: userInfo.name!,  // We've already checked these are defined
          email: userInfo.email!,
          company_name: userInfo.companyInfo?.name,
          conversation_summary: summary,
          consultant_brief: brief,
          lead_score: leadScore,
          ai_capabilities_shown: capabilitiesShown
        };

        const { data, error } = await this.supabase
          .from('lead_summaries')
          .insert(leadData)
          .select()
          .single();

        if (error) {
          console.error('Failed to store lead:', error);
        } else {
          leadId = data?.id;
        }
      } catch (error) {
        console.error('Supabase error:', error);
      }
    }

    // Generate email content
    const emailContent = this.generateEmailContent(userInfo.name!, userInfo.email!, summary, leadScore);

    return {
      success: true,
      data: { 
        summary,
        brief,
        leadScore,
        capabilitiesShown,
        emailContent,
        leadId
      }
    };
  }

  private calculateLeadScoreOnly(
    conversationHistory: Message[],
    userInfo: UserInfo
  ): ProxyResponse {
    const leadScore = this.calculateLeadScore(conversationHistory, userInfo);
    const capabilitiesShown = this.extractCapabilitiesShown(conversationHistory);

    return {
      success: true,
      data: {
        leadScore,
        capabilitiesShown,
        message: "Lead score calculated successfully"
      }
    };
  }

  private calculateLeadScore(conversationHistory: Message[], userInfo: UserInfo): number {
    let score = 0;
    
    // Company email (not generic) +20
    const domain = userInfo.email?.split('@')[1] || '';
    if (!['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
      score += 20;
    }
    
    // Conversation engagement +10
    if (conversationHistory.length > 8) {
      score += 10;
    }
    
    // Business terms mentioned +15
    const conversationText = this.formatConversationHistory(conversationHistory).toLowerCase();
    const businessTerms = ['automation', 'efficiency', 'ai', 'team', 'process', 'roi', 'productivity'];
    const mentionedTerms = businessTerms.filter(term => conversationText.includes(term));
    if (mentionedTerms.length >= 3) {
      score += 15;
    }
    
    // Pricing/timeline questions +25
    const buyingSignals = ['cost', 'price', 'when', 'timeline', 'budget', 'investment', 'how much'];
    const hasBuyingSignals = buyingSignals.some(signal => conversationText.includes(signal));
    if (hasBuyingSignals) {
      score += 25;
    }
    
    // Multiple AI capabilities requested +20
    const capabilityKeywords = ['image', 'video', 'document', 'analyze', 'generate', 'code', 'voice'];
    const capabilityMentions = capabilityKeywords.filter(keyword => 
      conversationText.includes(keyword)
    ).length;
    
    if (capabilityMentions >= 3) {
      score += 20;
    }

    // Specific business challenge mentioned +10
    const challengeKeywords = ['struggle', 'problem', 'challenge', 'issue', 'difficult', 'help'];
    const hasChallenges = challengeKeywords.some(keyword => conversationText.includes(keyword));
    if (hasChallenges) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  private extractCapabilitiesShown(conversationHistory: Message[]): string[] {
    const capabilities: string[] = [];
    const conversationText = this.formatConversationHistory(conversationHistory).toLowerCase();
    
    const capabilityMap: Record<string, string> = {
      'searching': AI_CAPABILITIES.GOOGLE_SEARCH,
      'grounding': AI_CAPABILITIES.GOOGLE_SEARCH,
      'voice': AI_CAPABILITIES.VOICE_GENERATION,
      'audio': AI_CAPABILITIES.VOICE_GENERATION,
      'image': AI_CAPABILITIES.IMAGE_GENERATION,
      'visual': AI_CAPABILITIES.IMAGE_GENERATION,
      'video': AI_CAPABILITIES.VIDEO_ANALYSIS,
      'document': AI_CAPABILITIES.DOCUMENT_UNDERSTANDING,
      'pdf': AI_CAPABILITIES.DOCUMENT_UNDERSTANDING,
      'code': AI_CAPABILITIES.CODE_EXECUTION,
      'calculation': AI_CAPABILITIES.CODE_EXECUTION,
      'website': AI_CAPABILITIES.URL_ANALYSIS,
      'url': AI_CAPABILITIES.URL_ANALYSIS
    };

    for (const [keyword, capability] of Object.entries(capabilityMap)) {
      if (conversationText.includes(keyword) && !capabilities.includes(capability)) {
        capabilities.push(capability);
      }
    }
    
    // Always include text generation as it's used throughout
    if (!capabilities.includes(AI_CAPABILITIES.TEXT_GENERATION)) {
      capabilities.push(AI_CAPABILITIES.TEXT_GENERATION);
    }
    
    return capabilities;
  }

  private formatConversationHistory(messages: Message[]): string {
    return messages.map(msg => 
      `${msg.sender.toUpperCase()}: ${msg.text}`
    ).join('\n');
  }

  private generateEmailContent(name: string, email: string, summary: string, leadScore: number): string {
    return `Hi ${name},

Thank you for experiencing F.B/c's AI showcase! I'm excited about the potential I see for your business.

**Your AI Readiness Score: ${leadScore}/100**

${leadScore >= 70 ? 
  "🎯 Your score indicates strong readiness for AI implementation. Let's move quickly to capitalize on this opportunity!" :
  leadScore >= 40 ?
  "📈 Your score shows good potential for AI adoption. With the right approach, we can unlock significant value for your business." :
  "🌱 Your score suggests we should start with foundational AI education. Our workshop would be perfect for your team!"
}

**Your Personalized AI Consultation Summary**

${summary}

**What's Next?**

Based on your showcase experience, I recommend:
${leadScore >= 70 ? 
  "✅ Custom AI Implementation - Let's build your AI solution immediately" :
  leadScore >= 40 ?
  "✅ Strategic Consultation - Let's create your AI roadmap together" :
  "✅ AI Workshop - Get your team up to speed with hands-on training"
}

📅 **Book Your Free 30-Minute Strategy Session**
Let's discuss your specific requirements and create a custom plan: [CALENDAR_LINK]

**Why F.B/c?**
- Proven AI implementation experience across industries
- Hands-on approach that delivers results
- Focus on practical business outcomes, not just technology
- Transparent pricing and clear deliverables

Best regards,
Farzad Bayat
Founder, F.B/c AI Consulting
bayatfarzad@gmail.com
[LinkedIn] | [Website]

P.S. The AI capabilities you experienced today are just the beginning. Imagine what your team could accomplish with these tools at their disposal! 🚀

---
This summary was generated using the same AI technology we can implement for your business.`;
  }
}