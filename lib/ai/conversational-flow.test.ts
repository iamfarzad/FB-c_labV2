import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConversationalFlowHandler } from './conversational-flow';
import { 
  CONVERSATION_STAGES, 
  AI_USAGE_LIMITS,
  ConversationState,
  ProxyRequestBody 
} from '@/api/ai-service/types';

// Mock the Google Generative AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => 'Mock AI response',
          candidates: [{
            groundingMetadata: {
              groundingAttributions: [{
                content: { parts: [{ text: 'Search result' }] },
                sourceId: { groundingPassage: { passage: { content: 'https://example.com' } } }
              }]
            }
          }]
        }
      })
    })
  }))
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    channel: vi.fn().mockReturnValue({
      send: vi.fn().mockResolvedValue(undefined)
    })
  })
}));

describe('ConversationalFlowHandler', () => {
  let handler: ConversationalFlowHandler;
  const mockApiKey = 'test-api-key';
  const mockSupabaseUrl = 'https://test.supabase.co';
  const mockSupabaseKey = 'test-supabase-key';

  beforeEach(() => {
    handler = new ConversationalFlowHandler(mockApiKey, mockSupabaseUrl, mockSupabaseKey);
  });

  describe('handleConversationalFlow', () => {
    it('should return error if no prompt provided', async () => {
      const body: ProxyRequestBody = {};
      const result = await handler.handleConversationalFlow(body);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No prompt provided');
      expect(result.status).toBe(400);
    });

    it('should enforce usage limits', async () => {
      const body: ProxyRequestBody = {
        prompt: 'Hello',
        messageCount: AI_USAGE_LIMITS.maxMessagesPerSession + 1
      };
      const result = await handler.handleConversationalFlow(body);
      
      expect(result.success).toBe(true);
      expect(result.data.isLimitReached).toBe(true);
      expect(result.data.showBooking).toBe(true);
    });

    it('should handle greeting stage properly', async () => {
      const conversationState: ConversationState = {
        sessionId: 'test-session',
        stage: CONVERSATION_STAGES.GREETING,
        messages: [],
        messagesInStage: 0,
        capabilitiesShown: []
      };

      const body: ProxyRequestBody = {
        prompt: 'Hello',
        conversationState
      };

      const result = await handler.handleConversationalFlow(body);
      
      expect(result.success).toBe(true);
      expect(result.data.text).toBe('Mock AI response');
      expect(result.data.conversationState.stage).toBe(CONVERSATION_STAGES.GREETING);
    });

    it('should transition from greeting to email request when name is provided', async () => {
      const conversationState: ConversationState = {
        sessionId: 'test-session',
        stage: CONVERSATION_STAGES.GREETING,
        messages: [],
        messagesInStage: 0,
        capabilitiesShown: []
      };

      const body: ProxyRequestBody = {
        prompt: 'John',
        conversationState
      };

      const result = await handler.handleConversationalFlow(body);
      
      expect(result.success).toBe(true);
      expect(result.data.conversationState.stage).toBe(CONVERSATION_STAGES.EMAIL_REQUEST);
      expect(result.data.conversationState.name).toBe('John');
    });

    it('should transition from email request to email collected when valid email is provided', async () => {
      const conversationState: ConversationState = {
        sessionId: 'test-session',
        stage: CONVERSATION_STAGES.EMAIL_REQUEST,
        messages: [],
        messagesInStage: 0,
        name: 'John',
        capabilitiesShown: []
      };

      const body: ProxyRequestBody = {
        prompt: 'john@company.com',
        conversationState
      };

      const result = await handler.handleConversationalFlow(body);
      
      expect(result.success).toBe(true);
      expect(result.data.conversationState.stage).toBe(CONVERSATION_STAGES.EMAIL_COLLECTED);
      expect(result.data.conversationState.email).toBe('john@company.com');
      expect(result.data.conversationState.companyInfo?.domain).toBe('company.com');
      expect(result.data.sidebarActivity).toBe('company_analysis');
    });

    it('should not transition if invalid email is provided', async () => {
      const conversationState: ConversationState = {
        sessionId: 'test-session',
        stage: CONVERSATION_STAGES.EMAIL_REQUEST,
        messages: [],
        messagesInStage: 0,
        name: 'John',
        capabilitiesShown: []
      };

      const body: ProxyRequestBody = {
        prompt: 'not-an-email',
        conversationState
      };

      const result = await handler.handleConversationalFlow(body);
      
      expect(result.success).toBe(true);
      expect(result.data.conversationState.stage).toBe(CONVERSATION_STAGES.EMAIL_REQUEST);
      expect(result.data.conversationState.email).toBeUndefined();
    });

    it('should extract grounding sources when available', async () => {
      const body: ProxyRequestBody = {
        prompt: 'Tell me about AI',
        conversationState: {
          sessionId: 'test-session',
          stage: CONVERSATION_STAGES.INITIAL_DISCOVERY,
          messages: [],
          messagesInStage: 0,
          capabilitiesShown: []
        }
      };

      const result = await handler.handleConversationalFlow(body);
      
      expect(result.success).toBe(true);
      expect(result.data.sources).toHaveLength(1);
      expect(result.data.sources[0]).toEqual({
        title: 'Search result',
        url: 'https://example.com',
        snippet: 'Search result'
      });
    });

    it('should calculate usage and cost', async () => {
      const body: ProxyRequestBody = {
        prompt: 'Hello world',
        conversationState: {
          sessionId: 'test-session',
          stage: CONVERSATION_STAGES.GREETING,
          messages: [],
          messagesInStage: 0,
          capabilitiesShown: []
        }
      };

      const result = await handler.handleConversationalFlow(body);
      
      expect(result.success).toBe(true);
      expect(result.usage).toBeDefined();
      expect(result.usage?.inputTokens).toBeGreaterThan(0);
      expect(result.usage?.outputTokens).toBeGreaterThan(0);
      expect(result.usage?.cost).toBeGreaterThan(0);
    });

    it('should handle capability selection stage', async () => {
      const conversationState: ConversationState = {
        sessionId: 'test-session',
        stage: CONVERSATION_STAGES.CAPABILITY_SELECTION,
        messages: [],
        messagesInStage: 0,
        name: 'John',
        email: 'john@company.com',
        capabilitiesShown: []
      };

      const body: ProxyRequestBody = {
        prompt: 'Show me image generation',
        conversationState
      };

      const result = await handler.handleConversationalFlow(body);
      
      expect(result.success).toBe(true);
      expect(result.data.conversationState.stage).toBe(CONVERSATION_STAGES.POST_CAPABILITY_FEEDBACK);
    });

    it('should transition to summary offer after solution discussion', async () => {
      const conversationState: ConversationState = {
        sessionId: 'test-session',
        stage: CONVERSATION_STAGES.SOLUTION_DISCUSSION,
        messages: [],
        messagesInStage: 2,
        name: 'John',
        email: 'john@company.com',
        capabilitiesShown: ['Text Generation']
      };

      const body: ProxyRequestBody = {
        prompt: 'That sounds great for our business',
        conversationState
      };

      const result = await handler.handleConversationalFlow(body);
      
      expect(result.success).toBe(true);
      expect(result.data.conversationState.stage).toBe(CONVERSATION_STAGES.SUMMARY_OFFER);
    });

    it('should transition to finalizing when summary is accepted', async () => {
      const conversationState: ConversationState = {
        sessionId: 'test-session',
        stage: CONVERSATION_STAGES.SUMMARY_OFFER,
        messages: [],
        messagesInStage: 0,
        name: 'John',
        email: 'john@company.com',
        capabilitiesShown: ['Text Generation', 'Image Generation']
      };

      const body: ProxyRequestBody = {
        prompt: 'Yes, please generate the summary',
        conversationState
      };

      const result = await handler.handleConversationalFlow(body);
      
      expect(result.success).toBe(true);
      expect(result.data.conversationState.stage).toBe(CONVERSATION_STAGES.FINALIZING);
      expect(result.data.sidebarActivity).toBe('summary_generation');
    });

    it('should handle errors gracefully', async () => {
      // Mock an error in the AI generation
      const errorHandler = new ConversationalFlowHandler('invalid-key');
      
      const body: ProxyRequestBody = {
        prompt: 'Hello',
        conversationState: {
          sessionId: 'test-session',
          stage: CONVERSATION_STAGES.GREETING,
          messages: [],
          messagesInStage: 0,
          capabilitiesShown: []
        }
      };

      // Force an error by mocking the generateContent to throw
      vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await errorHandler.handleConversationalFlow(body);
      
      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
    });
  });
});