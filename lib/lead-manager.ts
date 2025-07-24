import { getSupabase } from '@/lib/supabase/server'
import { EmailService } from '@/lib/email-service'
import { logServerActivity } from '@/lib/server-activity-logger'

export interface LeadData {
  id?: string
  name: string
  email: string
  company?: string
  role?: string
  conversationStage: ConversationStage
  leadScore: number
  emailDomain: string
  companySize?: CompanySize
  industry?: string
  decisionMaker?: boolean
  painPoints?: string[]
  aiReadiness?: number
  followUpSequence?: FollowUpSequence
  lastInteraction?: Date
  nextFollowUp?: Date
  totalInteractions: number
  engagementScore: number
  createdAt?: Date
  updatedAt?: Date
}

export enum ConversationStage {
  GREETING = 'greeting',
  NAME_COLLECTION = 'name_collection',
  EMAIL_CAPTURE = 'email_capture',
  BACKGROUND_RESEARCH = 'background_research',
  PROBLEM_DISCOVERY = 'problem_discovery',
  SOLUTION_PRESENTATION = 'solution_presentation',
  CALL_TO_ACTION = 'call_to_action'
}

export enum CompanySize {
  STARTUP = 'startup',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise'
}

export interface FollowUpSequence {
  id: string
  name: string
  emails: FollowUpEmail[]
  currentStep: number
  isActive: boolean
  startDate: Date
  lastSent?: Date
  nextScheduled?: Date
}

export interface FollowUpEmail {
  id: string
  subject: string
  content: string
  delayDays: number
  sent?: boolean
  sentDate?: Date
  openRate?: number
  clickRate?: number
}

export class LeadManager {
  private supabase = getSupabase()

  // ============================================================================
  // EMAIL DOMAIN ANALYSIS & COMPANY INTELLIGENCE
  // ============================================================================

  async analyzeEmailDomain(email: string): Promise<{
    domain: string
    companyName?: string
    companySize: CompanySize
    industry?: string
    decisionMaker: boolean
    aiReadiness: number
  }> {
    const domain = email.split('@')[1]
    
    // Analyze domain for company intelligence
    const domainAnalysis = await this.performDomainAnalysis(domain)
    
    // Determine if likely decision maker based on email patterns
    const decisionMaker = this.isDecisionMaker(email, domainAnalysis)
    
    // Calculate AI readiness score based on company characteristics
    const aiReadiness = this.calculateAIReadiness(domainAnalysis)
    
    return {
      domain,
      companyName: undefined, // Will be populated by research
      companySize: domainAnalysis.companySize,
      industry: domainAnalysis.industry,
      decisionMaker,
      aiReadiness
    }
  }

  private async performDomainAnalysis(domain: string) {
    // In production, integrate with company intelligence APIs
    // For now, use pattern matching and common knowledge
    
    const commonPatterns: Record<string, { companySize: CompanySize; industry: string }> = {
      'gmail.com': { companySize: CompanySize.STARTUP, industry: 'personal' },
      'outlook.com': { companySize: CompanySize.STARTUP, industry: 'personal' },
      'yahoo.com': { companySize: CompanySize.STARTUP, industry: 'personal' },
      'icloud.com': { companySize: CompanySize.STARTUP, industry: 'personal' }
    }

    // Check for common business domains
    if (domain.includes('corp') || domain.includes('inc') || domain.includes('llc')) {
      return { companySize: CompanySize.MEDIUM, industry: 'business' }
    }

    if (domain.includes('enterprise') || domain.includes('global')) {
      return { companySize: CompanySize.ENTERPRISE, industry: 'enterprise' }
    }

    // Default analysis
    return commonPatterns[domain] || { 
      companySize: CompanySize.SMALL, 
      industry: 'technology' 
    }
  }

  private isDecisionMaker(email: string, domainAnalysis: any): boolean {
    const emailPrefix = email.split('@')[0].toLowerCase()
    
    // Decision maker patterns
    const decisionMakerPatterns = [
      'ceo', 'cto', 'cfo', 'coo', 'president', 'vp', 'director', 'head',
      'manager', 'lead', 'founder', 'owner', 'principal', 'partner'
    ]
    
    return decisionMakerPatterns.some(pattern => 
      emailPrefix.includes(pattern)
    )
  }

  private calculateAIReadiness(domainAnalysis: any): number {
    let score = 50 // Base score
    
    // Adjust based on company size
    switch (domainAnalysis.companySize) {
      case CompanySize.STARTUP:
        score += 20 // Startups are often more open to AI
        break
      case CompanySize.SMALL:
        score += 10
        break
      case CompanySize.MEDIUM:
        score += 5
        break
      case CompanySize.LARGE:
        score -= 5 // Larger companies may have more bureaucracy
        break
      case CompanySize.ENTERPRISE:
        score -= 10
        break
    }
    
    // Adjust based on industry
    if (domainAnalysis.industry === 'technology') {
      score += 15
    }
    
    return Math.max(0, Math.min(100, score))
  }

  // ============================================================================
  // CONVERSATION STAGE MANAGEMENT
  // ============================================================================

  async processConversationStage(
    leadId: string, 
    currentMessage: string, 
    stage: ConversationStage
  ): Promise<{
    nextStage: ConversationStage
    response: string
    shouldTriggerResearch: boolean
    shouldSendFollowUp: boolean
  }> {
    // If no leadId provided, create a temporary lead for processing
    let lead: LeadData | null = null
    if (leadId) {
      lead = await this.getLead(leadId)
    }
    
    // Create temporary lead data for processing if none exists
    if (!lead) {
      lead = {
        id: 'temp_' + Date.now(),
        name: '',
        email: '',
        emailDomain: '',
        conversationStage: stage,
        leadScore: 0,
        totalInteractions: 0,
        engagementScore: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    switch (stage) {
      case ConversationStage.GREETING:
        return this.handleGreetingStage(lead, currentMessage)
      
      case ConversationStage.NAME_COLLECTION:
        return this.handleNameCollectionStage(lead, currentMessage)
      
      case ConversationStage.EMAIL_CAPTURE:
        return this.handleEmailCaptureStage(lead, currentMessage)
      
      case ConversationStage.BACKGROUND_RESEARCH:
        return this.handleBackgroundResearchStage(lead, currentMessage)
      
      case ConversationStage.PROBLEM_DISCOVERY:
        return this.handleProblemDiscoveryStage(lead, currentMessage)
      
      case ConversationStage.SOLUTION_PRESENTATION:
        return this.handleSolutionPresentationStage(lead, currentMessage)
      
      case ConversationStage.CALL_TO_ACTION:
        return this.handleCallToActionStage(lead, currentMessage)
      
      default:
        return this.handleGreetingStage(lead, currentMessage)
    }
  }

  private async handleGreetingStage(lead: LeadData, message: string) {
    const response = `Hello! I'm F.B/c, your AI strategy assistant. I help businesses like yours transform their operations with intelligent automation.

I'd love to learn more about your company and how we can help you leverage AI. Could you tell me your name?`

    return {
      nextStage: ConversationStage.NAME_COLLECTION,
      response,
      shouldTriggerResearch: false,
      shouldSendFollowUp: false
    }
  }

  private async handleNameCollectionStage(lead: LeadData, message: string) {
    // Extract name from message (simple pattern matching)
    const name = this.extractName(message)
    
    if (name) {
      await this.updateLead(lead.id!, { name })
      
      const response = `Great to meet you, ${name}! 

To provide you with the most relevant AI insights, could you share your work email address? This helps me understand your company's context and tailor my recommendations specifically for your industry and challenges.`

      return {
        nextStage: ConversationStage.EMAIL_CAPTURE,
        response,
        shouldTriggerResearch: false,
        shouldSendFollowUp: false
      }
    } else {
      return {
        nextStage: ConversationStage.NAME_COLLECTION,
        response: "I didn't catch your name. Could you please tell me your name?",
        shouldTriggerResearch: false,
        shouldSendFollowUp: false
      }
    }
  }

  private async handleEmailCaptureStage(lead: LeadData, message: string) {
    const email = this.extractEmail(message)
    
    if (email) {
      // Analyze email domain
      const domainAnalysis = await this.analyzeEmailDomain(email)
      
      // Update lead with email and domain analysis
      await this.updateLead(lead.id!, {
        email,
        emailDomain: domainAnalysis.domain,
        companySize: domainAnalysis.companySize,
        industry: domainAnalysis.industry,
        decisionMaker: domainAnalysis.decisionMaker,
        aiReadiness: domainAnalysis.aiReadiness
      })

      const response = `Perfect! I can see you're from ${domainAnalysis.domain}. 

Let me quickly research your company to understand your specific context and challenges. This will help me provide you with the most relevant AI solutions for your business.`

      return {
        nextStage: ConversationStage.BACKGROUND_RESEARCH,
        response,
        shouldTriggerResearch: true,
        shouldSendFollowUp: false
      }
    } else {
      return {
        nextStage: ConversationStage.EMAIL_CAPTURE,
        response: "I didn't catch your email address. Could you please share your work email?",
        shouldTriggerResearch: false,
        shouldSendFollowUp: false
      }
    }
  }

  private async handleBackgroundResearchStage(lead: LeadData, message: string) {
    // This stage is handled by the lead-research API
    // Here we just provide context and move to problem discovery
    
    const response = `Based on my research of ${lead.company || lead.emailDomain}, I can see some interesting opportunities for AI transformation.

What are the biggest challenges your company is currently facing? Are there any specific processes that feel manual, time-consuming, or error-prone?`

    return {
      nextStage: ConversationStage.PROBLEM_DISCOVERY,
      response,
      shouldTriggerResearch: false,
      shouldSendFollowUp: false
    }
  }

  private async handleProblemDiscoveryStage(lead: LeadData, message: string) {
    // Extract pain points from message
    const painPoints = this.extractPainPoints(message)
    
    if (painPoints.length > 0) {
      await this.updateLead(lead.id!, { painPoints })
      
      const response = `Excellent insights! I can see how AI could significantly impact those areas. 

Based on your challenges with ${painPoints[0]}, I'd recommend focusing on intelligent automation solutions that could save you 40-60% of manual processing time while improving accuracy.

Would you like me to show you a specific example of how we've helped similar companies in your industry?`

      return {
        nextStage: ConversationStage.SOLUTION_PRESENTATION,
        response,
        shouldTriggerResearch: false,
        shouldSendFollowUp: false
      }
    } else {
      return {
        nextStage: ConversationStage.PROBLEM_DISCOVERY,
        response: "Could you tell me more about the specific challenges you're facing? For example, are there any manual processes, data analysis tasks, or customer interactions that could be improved?",
        shouldTriggerResearch: false,
        shouldSendFollowUp: false
      }
    }
  }

  private async handleSolutionPresentationStage(lead: LeadData, message: string) {
    const response = `Perfect! Here's how we can help:

**For ${lead.company || 'your company'}, I recommend:**

1. **Intelligent Process Automation** - Automate ${lead.painPoints?.[0] || 'manual workflows'} with 95% accuracy
2. **AI-Powered Analytics** - Transform your data into actionable insights
3. **Smart Customer Engagement** - Enhance customer experience with AI chatbots and personalization

**Expected Impact:**
- 40-60% reduction in manual processing time
- 25-35% improvement in customer satisfaction
- ROI within 6-12 months

Would you like to schedule a 30-minute consultation to discuss your specific implementation strategy?`

    return {
      nextStage: ConversationStage.CALL_TO_ACTION,
      response,
      shouldTriggerResearch: false,
      shouldSendFollowUp: false
    }
  }

  private async handleCallToActionStage(lead: LeadData, message: string) {
    const response = `Excellent! I'd love to dive deeper into your specific needs.

**Next Steps:**
1. **Schedule a consultation** - 30-minute strategy session
2. **Custom AI roadmap** - Tailored to your business
3. **Implementation plan** - Step-by-step transformation

Would you like me to send you a calendar link to book your consultation? Just let me know your preferred time, and I'll send you the details.`

    return {
      nextStage: ConversationStage.CALL_TO_ACTION,
      response,
      shouldTriggerResearch: false,
      shouldSendFollowUp: true
    }
  }

  // ============================================================================
  // FOLLOW-UP SEQUENCE MANAGEMENT
  // ============================================================================

  async createFollowUpSequence(leadId: string): Promise<FollowUpSequence> {
    const lead = await this.getLead(leadId)
    if (!lead) throw new Error('Lead not found')

    const sequence: FollowUpSequence = {
      id: `seq_${Date.now()}`,
      name: `Follow-up for ${lead.name}`,
      emails: this.generateFollowUpEmails(lead),
      currentStep: 0,
      isActive: true,
      startDate: new Date()
    }

    await this.updateLead(leadId, { followUpSequence: sequence })
    return sequence
  }

  private generateFollowUpEmails(lead: LeadData): FollowUpEmail[] {
    const baseEmails = [
      {
        id: 'email_1',
        subject: `AI Strategy for ${lead.company || 'Your Business'} - Next Steps`,
        content: this.generateEmailContent(lead, 1),
        delayDays: 1
      },
      {
        id: 'email_2',
        subject: `Case Study: How AI Transformed ${lead.industry || 'Similar Companies'}`,
        content: this.generateEmailContent(lead, 2),
        delayDays: 3
      },
      {
        id: 'email_3',
        subject: `Exclusive: AI Readiness Assessment for ${lead.company || 'Your Team'}`,
        content: this.generateEmailContent(lead, 3),
        delayDays: 7
      },
      {
        id: 'email_4',
        subject: `Final Reminder: AI Consultation Opportunity`,
        content: this.generateEmailContent(lead, 4),
        delayDays: 14
      }
    ]

    return baseEmails.map(email => ({
      ...email,
      sent: false
    }))
  }

  private generateEmailContent(lead: LeadData, emailNumber: number): string {
    const templates: Record<number, string> = {
      1: `Hi ${lead.name},

Thank you for your interest in AI transformation for ${lead.company || 'your business'}.

Based on our conversation about ${lead.painPoints?.[0] || 'your challenges'}, I've prepared a customized AI strategy overview specifically for your industry.

Would you like to schedule a 30-minute consultation to discuss your implementation roadmap?

Best regards,
Farzad Bayat
F.B/c AI Strategy`,

      2: `Hi ${lead.name},

I wanted to share a case study that's particularly relevant to ${lead.company || 'your situation'}.

We recently helped a ${lead.industry || 'similar company'} achieve:
- 45% reduction in processing time
- 30% improvement in accuracy
- ROI within 8 months

Would you like to see how this could apply to your specific challenges?

Best regards,
Farzad Bayat
F.B/c AI Strategy`,

      3: `Hi ${lead.name},

I've created a personalized AI readiness assessment for ${lead.company || 'your team'}.

This 10-minute assessment will help you:
- Identify your top AI opportunities
- Understand implementation complexity
- Calculate potential ROI

Would you like me to send you the assessment link?

Best regards,
Farzad Bayat
F.B/c AI Strategy`,

      4: `Hi ${lead.name},

This is my final follow-up regarding AI transformation for ${lead.company || 'your business'}.

If you're still interested in exploring AI solutions, I'd be happy to schedule a consultation at your convenience.

If not, I understand and wish you the best with your business goals.

Best regards,
Farzad Bayat
F.B/c AI Strategy`
    }

    return templates[emailNumber] || templates[1]
  }

  async processFollowUpSequences(): Promise<void> {
    const leads = await this.getLeadsWithActiveSequences()
    
    for (const lead of leads) {
      if (!lead.followUpSequence) continue
      
      const sequence = lead.followUpSequence
      const currentEmail = sequence.emails[sequence.currentStep]
      
      if (currentEmail && !currentEmail.sent && this.shouldSendEmail(sequence)) {
        await this.sendFollowUpEmail(lead, currentEmail)
        
        // Update sequence
        sequence.currentStep++
        sequence.lastSent = new Date()
        sequence.nextScheduled = this.calculateNextEmailDate(sequence)
        
        await this.updateLead(lead.id!, { followUpSequence: sequence })
      }
    }
  }

  private async sendFollowUpEmail(lead: LeadData, email: FollowUpEmail): Promise<void> {
    try {
      await EmailService.sendEmail({
        to: lead.email,
        subject: email.subject,
        html: email.content,
        tags: { 
          type: 'follow_up', 
          lead_id: lead.id!,
          sequence_step: email.id 
        }
      })

      email.sent = true
      email.sentDate = new Date()
      
      await logServerActivity({
        type: 'email_sent',
        title: 'Follow-up Email Sent',
        description: `Sent ${email.subject} to ${lead.name}`,
        status: 'completed',
        metadata: { 
          leadId: lead.id,
          emailId: email.id,
          subject: email.subject
        }
      })
    } catch (error) {
      console.error('Failed to send follow-up email:', error)
    }
  }

  private shouldSendEmail(sequence: FollowUpSequence): boolean {
    if (!sequence.nextScheduled) return true
    return new Date() >= sequence.nextScheduled
  }

  private calculateNextEmailDate(sequence: FollowUpSequence): Date {
    const nextEmail = sequence.emails[sequence.currentStep + 1]
    if (!nextEmail) return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + nextEmail.delayDays)
    return nextDate
  }

  // ============================================================================
  // LEAD SCORING & ENGAGEMENT TRACKING
  // ============================================================================

  async updateLeadScore(leadId: string): Promise<number> {
    const lead = await this.getLead(leadId)
    if (!lead) throw new Error('Lead not found')

    let score = 0

    // Base score from company characteristics
    score += lead.aiReadiness || 0
    
    // Engagement score
    score += lead.engagementScore || 0
    
    // Interaction frequency
    score += Math.min(lead.totalInteractions * 5, 25)
    
    // Decision maker bonus
    if (lead.decisionMaker) score += 20
    
    // Company size bonus (startups and small companies are often more agile)
    if (lead.companySize === CompanySize.STARTUP) score += 15
    if (lead.companySize === CompanySize.SMALL) score += 10
    
    // Pain points identified
    if (lead.painPoints && lead.painPoints.length > 0) {
      score += lead.painPoints.length * 5
    }

    const finalScore = Math.max(0, Math.min(100, score))
    
    await this.updateLead(leadId, { leadScore: finalScore })
    return finalScore
  }

  async updateEngagementScore(leadId: string, interactionType: string): Promise<void> {
    const lead = await this.getLead(leadId)
    if (!lead) throw new Error('Lead not found')

    let engagementIncrease = 0

    switch (interactionType) {
      case 'chat_message':
        engagementIncrease = 5
        break
      case 'email_open':
        engagementIncrease = 3
        break
      case 'email_click':
        engagementIncrease = 8
        break
      case 'meeting_scheduled':
        engagementIncrease = 25
        break
      case 'consultation_completed':
        engagementIncrease = 40
        break
      default:
        engagementIncrease = 2
    }

    const newEngagementScore = Math.min(100, (lead.engagementScore || 0) + engagementIncrease)
    
    await this.updateLead(leadId, { 
      engagementScore: newEngagementScore,
      totalInteractions: (lead.totalInteractions || 0) + 1,
      lastInteraction: new Date()
    })
  }

  // ============================================================================
  // DATABASE OPERATIONS
  // ============================================================================

  async createLead(leadData: Partial<LeadData>): Promise<LeadData> {
    const { data, error } = await this.supabase
      .from('leads')
      .insert([{
        ...leadData,
        conversationStage: ConversationStage.GREETING,
        leadScore: 0,
        totalInteractions: 0,
        engagementScore: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getLead(leadId: string): Promise<LeadData | null> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (error) return null
    return data
  }

  async updateLead(leadId: string, updates: Partial<LeadData>): Promise<void> {
    const { error } = await this.supabase
      .from('leads')
      .update({
        ...updates,
        updatedAt: new Date()
      })
      .eq('id', leadId)

    if (error) throw error
  }

  async getLeadsWithActiveSequences(): Promise<LeadData[]> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .not('followUpSequence', 'is', null)

    if (error) return []
    return data || []
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private extractName(message: string): string | null {
    // Simple name extraction - in production, use NLP
    const namePatterns = [
      /my name is (\w+)/i,
      /i'm (\w+)/i,
      /i am (\w+)/i,
      /call me (\w+)/i
    ]
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern)
      if (match) return match[1]
    }
    
    return null
  }

  private extractEmail(message: string): string | null {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    const match = message.match(emailPattern)
    return match ? match[0] : null
  }

  private extractPainPoints(message: string): string[] {
    const painPointKeywords = [
      'manual', 'time-consuming', 'error-prone', 'repetitive',
      'slow', 'inefficient', 'tedious', 'boring', 'frustrating',
      'challenge', 'problem', 'issue', 'difficulty', 'struggle'
    ]
    
    const painPoints: string[] = []
    const lowerMessage = message.toLowerCase()
    
    for (const keyword of painPointKeywords) {
      if (lowerMessage.includes(keyword)) {
        painPoints.push(keyword)
      }
    }
    
    return painPoints
  }
} 