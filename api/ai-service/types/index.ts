// api/ai-service/types/index.ts

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface CompanyInfo {
  name?: string;
  domain?: string;
  analysis?: string;
}

export interface ConversationState {
  stage: string;
  messages: Message[];
  messagesInStage: number;
  name?: string;
  email?: string;
  companyInfo?: CompanyInfo;
  aiGuidance?: string;
  sidebarActivity?: string;
  sessionId?: string;
  isLimitReached?: boolean;
  showBooking?: boolean;
}

export interface ProxyRequestBody {
  prompt?: string;
  currentConversationState?: ConversationState;
  messageCount?: number;
  includeAudio?: boolean;
  model?: string;
  conversationHistory?: Message[]; // Changed from any[]
  userInfo?: { name?: string; email?: string; companyInfo?: CompanyInfo; [key: string]: any }; // Refined userInfo
  action?: string;
  imageData?: string; // base64
  videoUrl?: string;
  audioData?: string; // base64
  documentData?: string; // base64
  mimeType?: string; // for documentData
  urlContext?: string;
  analysisType?: string;
  businessContext?: string;
  [key: string]: any;
}

export interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
}
