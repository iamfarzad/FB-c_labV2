// api/ai-service/types/index.ts

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  audioData?: string;
  sources?: Source[];
  capabilities?: string[];
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

export interface CompanyInfo {
  name?: string;
  domain?: string;
  industry?: string;
  analysis?: string;
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
  capabilitiesShown: string[];
  isLimitReached?: boolean;
  showBooking?: boolean;
}

export interface ProxyRequestBody {
  prompt?: string;
  model?: string;
  conversationHistory?: Message[];
  conversationState?: ConversationState;
  userInfo?: UserInfo;
  action?: string;
  imageData?: string;
  videoUrl?: string;
  audioData?: string;
  documentData?: string;
  urlContext?: string;
  includeAudio?: boolean;
  sessionId?: string;
  messageCount?: number;
  mimeType?: string;
  analysisType?: string;
  businessContext?: string;
  conversationContext?: string;
}

export interface UserInfo {
  name?: string;
  email?: string;
  companyInfo?: CompanyInfo;
}

export interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
  usage?: Usage;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface SidebarActivity {
  activity: string;
  message: string;
  timestamp: number;
  progress?: number;
}

export interface LeadSummary {
  id?: string;
  name: string;
  email: string;
  company_name?: string;
  conversation_summary: string;
  consultant_brief: string;
  lead_score: number;
  ai_capabilities_shown: string[];
  created_at?: Date;
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
  NAME_COLLECTION: 'name_collection',
  EMAIL_REQUEST: 'email_request',
  EMAIL_COLLECTED: 'email_collected',
  INITIAL_DISCOVERY: 'initial_discovery',
  CAPABILITY_INTRODUCTION: 'capability_introduction',
  CAPABILITY_SELECTION: 'capability_selection',
  CAPABILITY_SUGGESTION: 'capability_suggestion',
  POST_CAPABILITY_FEEDBACK: 'post_capability_feedback',
  SOLUTION_DISCUSSION: 'solution_discussion',
  SUMMARY_OFFER: 'summary_offer',
  FINALIZING: 'finalizing',
  LIMIT_REACHED: 'limit_reached',
} as const;

export type ConversationStage = typeof CONVERSATION_STAGES[keyof typeof CONVERSATION_STAGES];

export const AI_CAPABILITIES = {
  TEXT_GENERATION: 'Text Generation',
  IMAGE_GENERATION: 'Image Generation',
  VIDEO_ANALYSIS: 'Video Analysis',
  SPEECH_GENERATION: 'Speech Generation',
  DOCUMENT_UNDERSTANDING: 'Document Understanding',
  CODE_EXECUTION: 'Code Execution',
  URL_ANALYSIS: 'URL Analysis',
  GOOGLE_SEARCH: 'Google Search Integration',
  VOICE_GENERATION: 'Voice Generation',
  LONG_CONTEXT: 'Long Context Memory',
  STRUCTURED_OUTPUT: 'Structured Output',
  THINKING_PROCESS: 'Thinking Process',
  FUNCTION_CALLING: 'Function Calling',
} as const;

export type AICapability = typeof AI_CAPABILITIES[keyof typeof AI_CAPABILITIES];
