// Types for the Unified AI Service
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  timestamp: string;
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

export interface UserInfo {
  name?: string;
  email?: string;
  companyInfo?: {
    name?: string;
    domain?: string;
    industry?: string;
    analysis?: string;
  };
}

export interface ConversationState {
  sessionId: string;
  stage: string;
  messages: Message[];
  messagesInStage: number;
  name?: string;
  email?: string;
  companyInfo?: {
    name?: string;
    domain?: string;
    industry?: string;
    analysis?: string;
  };
  aiGuidance?: string;
  sidebarActivity?: string;
  isLimitReached?: boolean;
  showBooking?: boolean;
  capabilitiesShown?: string[];
}

export interface ProxyRequestBody {
  action: string;
  prompt?: string;
  conversationState?: Partial<ConversationState>;
  messageCount?: number;
  includeAudio?: boolean;
}

// AI Usage Limits
export const AI_USAGE_LIMITS = {
  maxMessagesPerSession: 15,
  maxImageGenerations: 5,
  maxDocumentAnalyses: 3,
  maxVideoAnalyses: 2,
};

// Conversation Stages
export const CONVERSATION_STAGES = {
  GREETING: 'greeting',
  EMAIL_REQUEST: 'email_request',
  EMAIL_COLLECTED: 'email_collected',
  INITIAL_DISCOVERY: 'initial_discovery',
  DISCOVERY: 'discovery',
  CAPABILITY_INTRODUCTION: 'capability_introduction',
  CAPABILITY_SELECTION: 'capability_selection',
  CAPABILITY_SUGGESTION: 'capability_suggestion',
  POST_CAPABILITY_FEEDBACK: 'post_capability_feedback',
  SOLUTION_DISCUSSION: 'solution_discussion',
  SUMMARY_OFFER: 'summary_offer',
  BOOKING_OFFER: 'booking_offer',
  CONSULTATION_COMPLETE: 'consultation_complete',
} as const;
