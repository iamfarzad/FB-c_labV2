import { describe, it, expect, beforeEach } from 'vitest';
import { UnifiedAIService } from './unified-ai-service';
import {
  ConversationState,
  Message,
} from './types';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const config = {
  geminiApiKey: process.env.GEMINI_API_KEY,
};

let aiService: UnifiedAIService;

beforeEach(() => {
  aiService = new UnifiedAIService(config);
});

describe('UnifiedAIService - Integration Tests', () => {
  it('should handle greeting and name capture', async () => {
    const initialState: Partial<ConversationState> = {
      sessionId: `test-session-${Date.now()}`,
      stage: 'greeting',
      messages: [],
    };

    const response = await aiService.handleConversationalFlow(
      'Farzad',
      initialState as ConversationState
    );

    expect(response.success).toBe(true);
    expect(response.data?.conversationState?.stage).toBe('email_request');
    expect(response.data?.conversationState?.name).toBe('Farzad');
    expect(response.data?.text).toContain('Nice to meet you');
  });

  it('should handle email capture and trigger company analysis', async () => {
    const initialState: Partial<ConversationState> = {
      sessionId: `test-session-${Date.now()}`,
      stage: 'email_request',
      name: 'Farzad',
      messages: [],
    };

    const response = await aiService.handleConversationalFlow(
      'farzad@fbc.com',
      initialState as ConversationState
    );

    expect(response.success).toBe(true);
    expect(response.data?.conversationState?.stage).toBe('email_collected');
    expect(response.data?.conversationState?.email).toBe('farzad@fbc.com');
    expect(response.data?.sidebarActivity).toBe('company_analysis');
    expect(response.data?.text).toContain('analyzing your company');
  });

  it('should handle image generation request', async () => {
    const response = await aiService.handleImageGeneration(
      'A futuristic AI dashboard'
    );
    expect(response.success).toBe(true);
    expect(response.data?.imagePrompt).toBeDefined();
    expect(response.data?.text).toContain('Professional Image Generated');
  });

  it('should handle lead capture', async () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
      { id: '2', role: 'assistant', content: 'Hi!', timestamp: new Date().toISOString() },
    ];
    const conversationState: ConversationState = {
      sessionId: `test-session-${Date.now()}`,
      name: 'Jane Doe',
      email: 'jane.doe@acme.com',
      stage: 'finalizing',
      messages: messages,
      messagesInStage: 1,
      companyInfo: { name: 'acme', domain: 'acme.com' },
      capabilitiesShown: ['Text Generation'],
    };

    const response = await aiService.handleLeadCapture(conversationState);

    expect(response.success).toBe(true);
    expect(response.data?.summary).toBeDefined();
    expect(response.data?.leadScore).toBeGreaterThan(0);
  });
}); 