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
  private supabase: any = null
  
  private async getSupabaseClient() {
    if (!this.supabase) {
      try {
        const { getSupabase } = await import('@/lib/supabase/server')
        this.supabase = getSupabase()
      } catch (error) {
        console.warn('Supabase not available, some features will be limited')
        return null
      }
    }
    return this.supabase
  }

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
    leadIdOrData: string | LeadData | null, 
    currentMessage: string, 
    stage: ConversationStage
  ): Promise<{
    nextStage: ConversationStage
    response: string
    shouldTriggerResearch: boolean
    shouldSendFollowUp: boolean
    updatedLeadData?: Partial<LeadData>
  }> {
    // Handle different input types
    let lead: LeadData | null = null
    
    if (typeof leadIdOrData === 'object' && leadIdOrData !== null) {
      // Direct lead data provided
      lead = leadIdOrData as LeadData
    } else if (typeof leadIdOrData === 'string' && leadIdOrData) {
      // Lead ID provided, fetch from database
      lead = await this.getLead(leadIdOrData)
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
    
    console.info('🎯 processConversationStage:', {
      leadIdOrData: typeof leadIdOrData === 'object' ? 'LeadData object' : leadIdOrData,
      stage,
      currentMessage: currentMessage.substring(0, 50) + '...',
      leadData: lead
    })

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
    console.info('🔍 handleNameCollectionStage called with:', { lead, message })
    
    // Extract name from message with enhanced NLP
    const name = this.extractName(message)
    console.info('🔍 Extracted name:', name)
    
    if (name) {
      // Update lead with extracted name
      lead.name = name
      if (lead.id && lead.id !== 'temp_' + lead.id?.substring(5)) {
        await this.updateLead(lead.id, { name })
      }
      
      // Validate we can move to next stage
      const validation = this.validateStageTransition(
        ConversationStage.NAME_COLLECTION,
        ConversationStage.EMAIL_CAPTURE,
        lead
      )
      
      console.info('🔍 Validation result:', validation)
      
      if (validation.valid) {
        const response = `Great to meet you, ${name}! 

To provide you with the most relevant AI insights and personalized recommendations, could you share your work email address? This helps me understand your company's context and industry-specific challenges.`

        return {
          nextStage: ConversationStage.EMAIL_CAPTURE,
          response,
          shouldTriggerResearch: false,
          shouldSendFollowUp: false,
          updatedLeadData: { name }
        }
      }
    }
    
    // Stay on current stage if name not extracted or validation failed
    return {
      nextStage: ConversationStage.NAME_COLLECTION,
      response: "I didn't quite catch your name. Could you please tell me your full name? For example, 'My name is John Smith' or just 'John Smith'.",
      shouldTriggerResearch: false,
      shouldSendFollowUp: false
    }
  }

  private async handleEmailCaptureStage(lead: LeadData, message: string) {
    const email = this.extractEmail(message)
    
    if (email && this.isValidBusinessEmail(email)) {
      // Analyze email domain
      const domainAnalysis = await this.analyzeEmailDomain(email)
      
      // Update lead with email and domain analysis
      lead.email = email
      lead.emailDomain = domainAnalysis.domain
      lead.companySize = domainAnalysis.companySize
      lead.industry = domainAnalysis.industry
      lead.decisionMaker = domainAnalysis.decisionMaker
      lead.aiReadiness = domainAnalysis.aiReadiness
      
      if (lead.id && lead.id !== 'temp_' + lead.id?.substring(5)) {
        await this.updateLead(lead.id, {
          email,
          emailDomain: domainAnalysis.domain,
          companySize: domainAnalysis.companySize,
          industry: domainAnalysis.industry,
          decisionMaker: domainAnalysis.decisionMaker,
          aiReadiness: domainAnalysis.aiReadiness
        })
      }

      // Validate transition to next stage
      const validation = this.validateStageTransition(
        ConversationStage.EMAIL_CAPTURE,
        ConversationStage.BACKGROUND_RESEARCH,
        lead
      )

      if (validation.valid) {
        const companyName = domainAnalysis.companyName || domainAnalysis.domain
        const response = `Perfect! I can see you're from ${companyName}. 

Let me quickly research ${companyName} to understand your specific industry context and challenges. This will help me provide you with the most relevant AI solutions tailored to your business needs.

*Analyzing your company background...*`

        return {
          nextStage: ConversationStage.BACKGROUND_RESEARCH,
          response,
          shouldTriggerResearch: true,
          shouldSendFollowUp: false,
          updatedLeadData: {
            email,
            emailDomain: domainAnalysis.domain,
            company: domainAnalysis.companyName || domainAnalysis.domain,
            companySize: domainAnalysis.companySize,
            industry: domainAnalysis.industry,
            decisionMaker: domainAnalysis.decisionMaker
          }
        }
      }
    }
    
    // Provide specific feedback for invalid emails
    if (email && !this.isValidBusinessEmail(email)) {
      return {
        nextStage: ConversationStage.EMAIL_CAPTURE,
        response: "Please provide a valid work email address. Personal email addresses (like Gmail or Yahoo) won't give me the context I need to understand your company's specific challenges.",
        shouldTriggerResearch: false,
        shouldSendFollowUp: false
      }
    }
    
    return {
      nextStage: ConversationStage.EMAIL_CAPTURE,
      response: "I didn't catch a valid email address. Could you please share your work email? For example: 'john.smith@company.com'",
      shouldTriggerResearch: false,
      shouldSendFollowUp: false
    }
  }

  private isValidBusinessEmail(email: string): boolean {
    const personalDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
    ]
    const domain = email.split('@')[1]?.toLowerCase()
    return domain ? !personalDomains.includes(domain) : false
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
    // Extract pain points from message with enhanced NLP
    const painPoints = this.extractPainPoints(message)
    
    if (painPoints.length > 0) {
      // Update lead with pain points
      lead.painPoints = painPoints
      if (lead.id && lead.id !== 'temp_' + lead.id?.substring(5)) {
        await this.updateLead(lead.id, { painPoints })
      }
      
      // Validate transition
      const validation = this.validateStageTransition(
        ConversationStage.PROBLEM_DISCOVERY,
        ConversationStage.SOLUTION_PRESENTATION,
        lead
      )
      
      if (validation.valid) {
        // Analyze pain points to provide targeted response
        const primaryPain = painPoints[0]
        const painCategory = this.categorizePainPoint(primaryPain)
        
        const response = `Excellent insights, ${lead.name}! I can see how these challenges are impacting ${lead.company || 'your business'}.

**Key challenges identified:**
${painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Based on your ${painCategory} challenges, I can already see several AI solutions that could transform your operations:

• **Intelligent Automation**: Reduce manual work by 40-60% with AI-powered workflows
• **Predictive Analytics**: Turn your data into actionable insights
• **Smart Process Optimization**: Eliminate bottlenecks and improve efficiency

Let me show you exactly how we've helped companies like yours achieve measurable results. Would you like to see a specific case study?`

        return {
          nextStage: ConversationStage.SOLUTION_PRESENTATION,
          response,
          shouldTriggerResearch: false,
          shouldSendFollowUp: false
        }
      }
    }
    
    // Provide more specific prompts based on their industry
    const industryPrompts: Record<string, string> = {
      'technology': "Are you dealing with slow development cycles, manual testing, or data processing bottlenecks?",
      'finance': "Do you have challenges with compliance reporting, risk analysis, or customer onboarding?",
      'healthcare': "Are there issues with patient data management, appointment scheduling, or clinical workflows?",
      'retail': "Do you struggle with inventory management, customer service, or demand forecasting?",
      'manufacturing': "Are there problems with quality control, supply chain visibility, or production planning?"
    }
    
    const industryPrompt = industryPrompts[lead.industry || 'technology'] || 
      "Are there any repetitive tasks, data analysis challenges, or customer service issues?"
    
    return {
      nextStage: ConversationStage.PROBLEM_DISCOVERY,
      response: `I'd love to understand more about the specific challenges ${lead.company || 'your company'} is facing.

${industryPrompt}

The more specific you can be about your pain points, the better I can tailor our AI solutions to your needs.`,
      shouldTriggerResearch: false,
      shouldSendFollowUp: false
    }
  }

  private categorizePainPoint(painPoint: string): string {
    const categories = {
      'manual process': 'process automation',
      'time-consuming': 'efficiency',
      'error-prone': 'accuracy',
      'data silos': 'data integration',
      'customer issues': 'customer experience',
      'scalability': 'growth',
      'compliance': 'regulatory'
    }
    
    for (const [key, value] of Object.entries(categories)) {
      if (painPoint.toLowerCase().includes(key)) {
        return value
      }
    }
    
    return 'operational'
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
    const supabase = await this.getSupabaseClient()
    if (!supabase) {
      console.warn('Supabase not available, skipping database operation')
      return null
    }
    
    const { data, error } = await supabase
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
    const supabase = await this.getSupabaseClient()
    if (!supabase) {
      console.warn('Supabase not available, skipping database operation')
      return null
    }
    
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (error) return null
    return data
  }

  async updateLead(leadId: string, updates: Partial<LeadData>): Promise<void> {
    const supabase = await this.getSupabaseClient()
    if (!supabase) {
      console.warn('Supabase not available, skipping database operation')
      return
    }
    
    const { error } = await supabase
      .from('leads')
      .update({
        ...updates,
        updatedAt: new Date()
      })
      .eq('id', leadId)

    if (error) throw error
  }

  async getLeadsWithActiveSequences(): Promise<LeadData[]> {
    const supabase = await this.getSupabaseClient()
    if (!supabase) {
      console.warn('Supabase not available, skipping database operation')
      return null
    }
    
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .not('followUpSequence', 'is', null)

    if (error) return []
    return data || []
  }

  // ============================================================================
  // STAGE VALIDATION & TRANSITION
  // ============================================================================

  private validateStageTransition(
    currentStage: ConversationStage,
    nextStage: ConversationStage,
    lead: LeadData
  ): { valid: boolean; reason?: string } {
    // Define required data for each stage
    const stageRequirements: Record<ConversationStage, string[]> = {
      [ConversationStage.GREETING]: [],
      [ConversationStage.NAME_COLLECTION]: [],
      [ConversationStage.EMAIL_CAPTURE]: ['name'],
      [ConversationStage.BACKGROUND_RESEARCH]: ['name', 'email'],
      [ConversationStage.PROBLEM_DISCOVERY]: ['name', 'email', 'emailDomain'],
      [ConversationStage.SOLUTION_PRESENTATION]: ['name', 'email', 'painPoints'],
      [ConversationStage.CALL_TO_ACTION]: ['name', 'email', 'painPoints']
    }

    const requiredFields = stageRequirements[nextStage] || []
    const missingFields: string[] = []

    for (const field of requiredFields) {
      const value = lead[field as keyof LeadData]
      if (!value || (Array.isArray(value) && value.length === 0)) {
        missingFields.push(field)
      }
    }

    if (missingFields.length > 0) {
      return {
        valid: false,
        reason: `Cannot proceed to ${nextStage} - missing required data: ${missingFields.join(', ')}`
      }
    }

    // Validate stage progression order
    const stageOrder = [
      ConversationStage.GREETING,
      ConversationStage.NAME_COLLECTION,
      ConversationStage.EMAIL_CAPTURE,
      ConversationStage.BACKGROUND_RESEARCH,
      ConversationStage.PROBLEM_DISCOVERY,
      ConversationStage.SOLUTION_PRESENTATION,
      ConversationStage.CALL_TO_ACTION
    ]

    const currentIndex = stageOrder.indexOf(currentStage)
    const nextIndex = stageOrder.indexOf(nextStage)

    // Allow staying on same stage or moving forward (not backward except for special cases)
    if (nextIndex < currentIndex && nextStage !== ConversationStage.CALL_TO_ACTION) {
      return {
        valid: false,
        reason: `Cannot go back from ${currentStage} to ${nextStage}`
      }
    }

    return { valid: true }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private extractName(message: string): string | null {
    // Enhanced name extraction with full name support
    const namePatterns = [
      /my name is ([a-zA-Z]+(?: [a-zA-Z]+)*)/i,
      /i'm ([a-zA-Z]+(?: [a-zA-Z]+)*)/i,
      /i am ([a-zA-Z]+(?: [a-zA-Z]+)*)/i,
      /call me ([a-zA-Z]+(?: [a-zA-Z]+)*)/i,
      /this is ([a-zA-Z]+(?: [a-zA-Z]+)*)/i,
      /^([a-zA-Z]+(?: [a-zA-Z]+)*)$/i, // Just the name
      /name: ([a-zA-Z]+(?: [a-zA-Z]+)*)/i,
      /([A-Z][a-z]+(?: [A-Z][a-z]+)+)/ // Capitalized full name
    ]
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        const name = match[1].trim()
        // Validate it's a reasonable name (2-50 chars, no numbers)
        if (name.length >= 2 && name.length <= 50 && !/\d/.test(name)) {
          return name
        }
      }
    }
    
    // Try to extract from email-like patterns (e.g., "john.smith speaking")
    const emailNamePattern = /^([a-z]+(?:\.[a-z]+)?)\s+(?:here|speaking|talking)/i
    const emailMatch = message.match(emailNamePattern)
    if (emailMatch) {
      return emailMatch[1].replace('.', ' ').split(' ').map(
        word => word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    
    return null
  }

  private extractEmail(message: string): string | null {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    const match = message.match(emailPattern)
    return match ? match[0] : null
  }

  private extractPainPoints(message: string): string[] {
    const painPoints: string[] = []
    const lowerMessage = message.toLowerCase()
    
    // Enhanced pain point patterns with context
    const painPointPatterns = [
      // Process-related pain points
      { pattern: /(?:we have|there are|dealing with)\s+(\w+\s+)?manual\s+(\w+\s*){0,3}/gi, category: 'manual process' },
      { pattern: /(?:too much|a lot of|excessive)\s+time\s+(?:spent|wasted)\s+(?:on|doing)\s+(\w+\s*){1,3}/gi, category: 'time-consuming' },
      { pattern: /(?:keep|keeps)\s+(?:making|getting)\s+errors?\s+(?:in|with)\s+(\w+\s*){1,3}/gi, category: 'error-prone' },
      { pattern: /(?:have to|need to)\s+(?:repeat|do)\s+(?:the same)\s+(\w+\s*){1,3}/gi, category: 'repetitive' },
      
      // Efficiency pain points
      { pattern: /(?:process|system|workflow)\s+is\s+(?:very|too|really)?\s*slow/gi, category: 'slow process' },
      { pattern: /(?:not|isn't)\s+(?:efficient|effective|productive)/gi, category: 'inefficient' },
      { pattern: /(?:waste|wasting)\s+(?:time|resources|money)/gi, category: 'resource waste' },
      
      // Challenge-based patterns
      { pattern: /(?:biggest|major|main)\s+(?:challenge|problem|issue)\s+is\s+(\w+\s*){1,5}/gi, category: 'major challenge' },
      { pattern: /(?:struggle|struggling)\s+(?:with|to)\s+(\w+\s*){1,3}/gi, category: 'struggling with' },
      { pattern: /(?:difficult|hard)\s+to\s+(\w+\s*){1,3}/gi, category: 'difficulty' },
      
      // Specific business pain points
      { pattern: /(?:customer|client)\s+(?:complaints?|satisfaction|service)/gi, category: 'customer issues' },
      { pattern: /(?:data|information)\s+(?:silos?|scattered|disconnected)/gi, category: 'data silos' },
      { pattern: /(?:lack|lacking)\s+(?:of|in)\s+(?:visibility|insights?|analytics)/gi, category: 'lack of insights' },
      { pattern: /(?:can't|cannot|unable to)\s+(?:scale|grow|expand)/gi, category: 'scalability issues' },
      { pattern: /(?:compliance|regulatory)\s+(?:issues?|challenges?|requirements?)/gi, category: 'compliance' },
    ]
    
    // Extract pain points using patterns
    for (const { pattern, category } of painPointPatterns) {
      const matches = message.matchAll(pattern)
      for (const match of matches) {
        const fullMatch = match[0]
        const context = match[1] ? `${category}: ${fullMatch}` : category
        if (!painPoints.includes(context)) {
          painPoints.push(context)
        }
      }
    }
    
    // Also check for simple keyword mentions
    const simpleKeywords = [
      'bottleneck', 'backlog', 'delay', 'mistake', 'error',
      'inefficiency', 'redundant', 'outdated', 'legacy',
      'complex', 'complicated', 'confusing', 'unclear'
    ]
    
    for (const keyword of simpleKeywords) {
      if (lowerMessage.includes(keyword) && !painPoints.some(p => p.includes(keyword))) {
        // Find context around the keyword
        const regex = new RegExp(`(\\w+\\s+){0,3}${keyword}(\\s+\\w+){0,3}`, 'gi')
        const contextMatch = message.match(regex)
        if (contextMatch) {
          painPoints.push(`${keyword}: ${contextMatch[0].trim()}`)
        }
      }
    }
    
    return painPoints.slice(0, 5) // Return top 5 pain points
  }
}
