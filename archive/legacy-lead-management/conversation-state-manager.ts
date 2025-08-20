import { LeadManager, ConversationStage, LeadData } from './lead-manager'
import { logServerActivity } from './server-activity-logger'
import { getSupabase } from '@/lib/supabase/server'

export interface ConversationState {
  leadId: string
  conversationId?: string  // Add Supabase conversation ID
  currentStage: ConversationStage
  messages: ConversationMessage[]
  context: ConversationContext
  metadata: ConversationMetadata
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  stage: ConversationStage
  metadata?: any
}

export interface ConversationContext {
  leadData: Partial<LeadData>
  painPoints: string[]
  aiReadiness: number
  companyContext?: string
  researchData?: any
}

export interface ConversationMetadata {
  sessionId: string
  startTime: Date
  lastActivity: Date
  totalMessages: number
  stageTransitions: StageTransition[]
}

export interface StageTransition {
  from: ConversationStage
  to: ConversationStage
  timestamp: Date
  trigger: string
}

// Singleton instance to persist state across requests
let conversationManagerInstance: ConversationStateManager | null = null

export class ConversationStateManager {
  private leadManager = new LeadManager()
  private states = new Map<string, ConversationState>()
  
  // Get singleton instance
  static getInstance(): ConversationStateManager {
    if (!conversationManagerInstance) {
      conversationManagerInstance = new ConversationStateManager()
    }
    return conversationManagerInstance
  }

  // ============================================================================
  // CONVERSATION INITIALIZATION
  // ============================================================================

  async initializeConversation(sessionId: string): Promise<ConversationState> {
    const state: ConversationState = {
      leadId: '',
      currentStage: ConversationStage.GREETING,
      messages: [],
      context: {
        leadData: {},
        painPoints: [],
        aiReadiness: 50
      },
      metadata: {
        sessionId,
        startTime: new Date(),
        lastActivity: new Date(),
        totalMessages: 0,
        stageTransitions: []
      }
    }

    this.states.set(sessionId, state)
    
    await logServerActivity({
      type: 'conversation_started',
      title: 'New Conversation Started',
      description: `Initialized conversation session ${sessionId}`,
      status: 'completed',
      metadata: { sessionId }
    })

    return state
  }

  // ============================================================================
  // MESSAGE PROCESSING & STAGE MANAGEMENT
  // ============================================================================

  async processMessage(
    sessionId: string, 
    userMessage: string, 
    leadId?: string
  ): Promise<{
    response: string
    newStage: ConversationStage
    shouldTriggerResearch: boolean
    shouldSendFollowUp: boolean
    updatedState: ConversationState
  }> {
    console.info('📊 ConversationStateManager.processMessage called:', {
      sessionId,
      userMessage: userMessage.substring(0, 50) + '...',
      leadId
    })
    
    const state = this.states.get(sessionId)
    if (!state) {
      throw new Error('Conversation state not found')
    }

    // Update lead ID if provided
    if (leadId && !state.leadId) {
      state.leadId = leadId
    }
    
    // Persist conversation to Supabase if not already created
    const supabase = getSupabase()
    if (!state.conversationId && state.leadId && supabase) {
      try {
        const { data: conv } = await supabase
          .from('conversations')
          .insert({
            lead_id: state.leadId,
            session_id: sessionId,
            stage: state.currentStage,
            status: 'active',
            total_messages: state.metadata.totalMessages
          })
          .select('id')
          .single()
        
        if (conv) {
          state.conversationId = conv.id
        }
      } catch (error) {
        console.error('Error creating conversation:', error)
      }
    }

    // Add user message to conversation
    const userMessageObj: ConversationMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      stage: state.currentStage
    }

    state.messages.push(userMessageObj)
    state.metadata.totalMessages++
    state.metadata.lastActivity = new Date()
    
    // Persist user message to transcripts
    if (state.conversationId && state.leadId && supabase) {
      try {
        await supabase
          .from('transcripts')
          .insert({
            conversation_id: state.conversationId,
            lead_id: state.leadId,
            message_type: 'text',
            role: 'user',
            content: userMessage
          })
      } catch (error) {
        console.error('Error persisting user message:', error)
      }
    }

    // Process the message through the current stage
    // Pass the accumulated lead data to maintain context
    const leadDataToPass = state.leadId || {
      ...state.context.leadData,
      id: state.leadId || `temp_${sessionId}`
    }
    
    const stageResult = await this.leadManager.processConversationStage(
      leadDataToPass,
      userMessage,
      state.currentStage
    )

    // Add assistant response to conversation
    const assistantMessageObj: ConversationMessage = {
      id: `msg_${Date.now()}_resp`,
      role: 'assistant',
      content: stageResult.response,
      timestamp: new Date(),
      stage: stageResult.nextStage
    }

    state.messages.push(assistantMessageObj)
    
    // Persist assistant response to transcripts
    if (state.conversationId && state.leadId && supabase) {
      try {
        await supabase
          .from('transcripts')
          .insert({
            conversation_id: state.conversationId,
            lead_id: state.leadId,
            message_type: 'text',
            role: 'assistant',
            content: stageResult.response
          })
      } catch (error) {
        console.error('Error persisting assistant message:', error)
      }
    }

    // Update conversation stage
    const previousStage = state.currentStage
    state.currentStage = stageResult.nextStage
    
    // Update conversation in database
    if (state.conversationId && supabase) {
      try {
        await supabase
          .from('conversations')
          .update({
            stage: state.currentStage,
            total_messages: state.metadata.totalMessages + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', state.conversationId)
      } catch (error) {
        console.error('Error updating conversation:', error)
      }
    }

    // Record stage transition
    state.metadata.stageTransitions.push({
      from: previousStage,
      to: stageResult.nextStage,
      timestamp: new Date(),
      trigger: userMessage.substring(0, 50) + '...'
    })

    // Update lead data from stage result
    if (stageResult.updatedLeadData) {
      state.context.leadData = {
        ...state.context.leadData,
        ...stageResult.updatedLeadData
      }
    }
    
    // Update context based on the PREVIOUS stage (where the message was processed)
    await this.updateConversationContext(state, userMessage, stageResult, previousStage)

    // Log stage transition
    await logServerActivity({
      type: 'stage_transition',
      title: 'Conversation Stage Advanced',
      description: `Advanced from ${previousStage} to ${stageResult.nextStage}`,
      status: 'completed',
      metadata: {
        sessionId,
        leadId: state.leadId,
        fromStage: previousStage,
        toStage: stageResult.nextStage,
        userMessage: userMessage.substring(0, 100)
      }
    })

    return {
      response: stageResult.response,
      newStage: stageResult.nextStage,
      shouldTriggerResearch: stageResult.shouldTriggerResearch,
      shouldSendFollowUp: stageResult.shouldSendFollowUp,
      updatedState: state
    }
  }

  // ============================================================================
  // CONTEXT MANAGEMENT
  // ============================================================================

  private async updateConversationContext(
    state: ConversationState,
    userMessage: string,
    stageResult: any,
    previousStage: ConversationStage
  ): Promise<void> {
    switch (previousStage) {
      case ConversationStage.NAME_COLLECTION:
        const name = this.extractName(userMessage)
        if (name) {
          state.context.leadData.name = name
        }
        break

      case ConversationStage.EMAIL_CAPTURE:
        const email = this.extractEmail(userMessage)
        if (email) {
          state.context.leadData.email = email
          
          // Analyze email domain
          const domainAnalysis = await this.leadManager.analyzeEmailDomain(email)
          state.context.leadData.emailDomain = domainAnalysis.domain
          state.context.leadData.companySize = domainAnalysis.companySize
          state.context.leadData.industry = domainAnalysis.industry
          state.context.leadData.decisionMaker = domainAnalysis.decisionMaker
          state.context.aiReadiness = domainAnalysis.aiReadiness
        }
        break

      case ConversationStage.PROBLEM_DISCOVERY:
        const painPoints = this.extractPainPoints(userMessage)
        if (painPoints.length > 0) {
          state.context.painPoints = [...state.context.painPoints, ...painPoints]
        }
        break
    }
  }

  // ============================================================================
  // RESEARCH INTEGRATION
  // ============================================================================

  async integrateResearchData(
    sessionId: string, 
    researchData: any
  ): Promise<void> {
    const state = this.states.get(sessionId)
    if (!state) return

    state.context.researchData = researchData
    
    // Extract company context from research
    if (researchData.companyInfo) {
      state.context.companyContext = researchData.companyInfo.summary
      state.context.leadData.company = researchData.companyInfo.name
    }

    // Update AI readiness based on research
    if (researchData.industryAnalysis) {
      const industryScore = this.calculateIndustryAIScore(researchData.industryAnalysis)
      state.context.aiReadiness = Math.max(state.context.aiReadiness, industryScore)
    }

    await logServerActivity({
      type: 'research_integrated',
      title: 'Research Data Integrated',
      description: 'Company research data integrated into conversation context',
      status: 'completed',
      metadata: {
        sessionId,
        leadId: state.leadId,
        companyName: state.context.leadData.company
      }
    })
  }

  private calculateIndustryAIScore(industryAnalysis: any): number {
    // Calculate AI readiness score based on industry characteristics
    let score = 50

    if (industryAnalysis.techAdoption) {
      score += industryAnalysis.techAdoption * 20
    }

    if (industryAnalysis.digitalTransformation) {
      score += industryAnalysis.digitalTransformation * 15
    }

    if (industryAnalysis.processAutomation) {
      score += industryAnalysis.processAutomation * 10
    }

    return Math.min(100, score)
  }

  // ============================================================================
  // CONVERSATION COMPLETION
  // ============================================================================

  async completeConversation(sessionId: string): Promise<{
    leadData: LeadData
    conversationSummary: string
    nextSteps: string[]
  }> {
    const state = this.states.get(sessionId)
    if (!state) {
      throw new Error('Conversation state not found')
    }

    // Create or update lead in database
    let leadData: LeadData
    if (state.leadId) {
      // Update existing lead
      await this.leadManager.updateLead(state.leadId, {
        conversationStage: state.currentStage,
        totalInteractions: state.metadata.totalMessages,
        lastInteraction: new Date()
      })
      leadData = await this.leadManager.getLead(state.leadId) as LeadData
    } else {
      // Create new lead
      leadData = await this.leadManager.createLead({
        ...state.context.leadData,
        conversationStage: state.currentStage,
        totalInteractions: state.metadata.totalMessages,
        engagementScore: this.calculateEngagementScore(state)
      })
    }

    // Generate conversation summary
    const conversationSummary = this.generateConversationSummary(state)

    // Determine next steps
    const nextSteps = this.determineNextSteps(state, leadData)

    // Log conversation completion
    await logServerActivity({
      type: 'conversation_completed',
      title: 'Conversation Completed',
      description: `Completed conversation with ${leadData.name}`,
      status: 'completed',
      metadata: {
        sessionId,
        leadId: leadData.id,
        totalMessages: state.metadata.totalMessages,
        finalStage: state.currentStage
      }
    })

    // Clean up state
    this.states.delete(sessionId)

    return {
      leadData,
      conversationSummary,
      nextSteps
    }
  }

  private generateConversationSummary(state: ConversationState): string {
    const summary = {
      participant: state.context.leadData.name,
      company: state.context.leadData.company,
      painPoints: state.context.painPoints,
      aiReadiness: state.context.aiReadiness,
      stageReached: state.currentStage,
      totalMessages: state.metadata.totalMessages,
      duration: this.calculateConversationDuration(state)
    }

    return JSON.stringify(summary, null, 2)
  }

  private determineNextSteps(state: ConversationState, leadData: LeadData): string[] {
    const nextSteps = []

    if (state.currentStage === ConversationStage.CALL_TO_ACTION) {
      nextSteps.push('Schedule consultation call')
      nextSteps.push('Send follow-up email sequence')
      nextSteps.push('Prepare custom AI strategy proposal')
    } else if (state.currentStage === ConversationStage.SOLUTION_PRESENTATION) {
      nextSteps.push('Follow up with solution details')
      nextSteps.push('Send case study examples')
      nextSteps.push('Schedule discovery call')
    } else {
      nextSteps.push('Continue conversation to gather more information')
      nextSteps.push('Send educational content')
      nextSteps.push('Follow up with personalized insights')
    }

    return nextSteps
  }

  private calculateEngagementScore(state: ConversationState): number {
    let score = 0

    // Base score from message count
    score += Math.min(state.metadata.totalMessages * 5, 30)

    // Bonus for reaching advanced stages
    if (state.currentStage === ConversationStage.CALL_TO_ACTION) {
      score += 40
    } else if (state.currentStage === ConversationStage.SOLUTION_PRESENTATION) {
      score += 30
    } else if (state.currentStage === ConversationStage.PROBLEM_DISCOVERY) {
      score += 20
    }

    // Bonus for providing detailed information
    if (state.context.painPoints.length > 0) {
      score += state.context.painPoints.length * 5
    }

    return Math.min(100, score)
  }

  private calculateConversationDuration(state: ConversationState): number {
    const duration = state.metadata.lastActivity.getTime() - state.metadata.startTime.getTime()
    return Math.round(duration / 1000 / 60) // Duration in minutes
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private extractName(message: string): string | null {
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
      // Current keywords (keep these)
      'manual', 'time-consuming', 'error-prone', 'repetitive',
      'slow', 'inefficient', 'tedious', 'boring', 'frustrating',
      'challenge', 'problem', 'issue', 'difficulty', 'struggle',
      
      // ADD FOR CONSULTING LEAD GENERATION:
      'struggling', 'pain', 'headache', 'nightmare', 'broken', 'failing',
      'expensive', 'costly', 'waste', 'wasting', 'losing', 'behind',
      'stuck', 'blocked', 'overwhelmed', 'stressed', 'unable', 'cannot',
      'can\'t', 'difficult', 'hard', 'impossible', 'lack', 'missing',
      'bottleneck', 'backlog', 'delay', 'mistake', 'error', 'outdated',
      'legacy', 'chaos', 'mess', 'disaster', 'need', 'help', 'fix',
      
      // Business impact words for consulting opportunities
      'revenue', 'profit', 'cost', 'budget', 'money', 'time', 'resources',
      'customers', 'clients', 'team', 'staff', 'employees', 'process',
      'system', 'workflow', 'operations', 'management'
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

  // ============================================================================
  // STATE RETRIEVAL
  // ============================================================================

  getConversationState(sessionId: string): ConversationState | undefined {
    return this.states.get(sessionId)
  }

  getAllActiveConversations(): ConversationState[] {
    return Array.from(this.states.values())
  }

  getConversationHistory(sessionId: string): ConversationMessage[] {
    const state = this.states.get(sessionId)
    return state ? state.messages : []
  }
}
