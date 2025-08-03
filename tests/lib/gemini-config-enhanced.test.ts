import { GeminiConfigEnhanced, createOptimizedConfig, optimizeConversation } from '@/lib/gemini-config-enhanced';

describe('GeminiConfigEnhanced', () => {
  let geminiConfig: GeminiConfigEnhanced;

  beforeEach(() => {
    // Get a fresh instance for each test
    geminiConfig = GeminiConfigEnhanced.getInstance();
    // Clear any existing cache
    geminiConfig.clearExpiredCache();
  });

  describe('createGenerationConfig', () => {
    it('should create chat configuration with correct defaults', () => {
      const config = geminiConfig.createGenerationConfig('chat');
      
      expect(config.maxOutputTokens).toBe(2048);
      expect(config.temperature).toBe(0.7);
      expect(config.responseMimeType).toBe('text/plain');
      expect(config.cacheConfig?.ttl).toBe(1800);
      expect(config.cacheConfig?.enabled).toBe(true);
    });

    it('should create analysis configuration with lower limits', () => {
      const config = geminiConfig.createGenerationConfig('analysis');
      
      expect(config.maxOutputTokens).toBe(1024);
      expect(config.temperature).toBe(0.3);
      expect(config.cacheConfig?.ttl).toBe(3600);
    });

    it('should create document configuration', () => {
      const config = geminiConfig.createGenerationConfig('document');
      
      expect(config.maxOutputTokens).toBe(1536);
      expect(config.temperature).toBe(0.4);
      expect(config.cacheConfig?.ttl).toBe(7200);
    });

    it('should create live configuration with minimal limits', () => {
      const config = geminiConfig.createGenerationConfig('live');
      
      expect(config.maxOutputTokens).toBe(512);
      expect(config.temperature).toBe(0.6);
      expect(config.cacheConfig?.ttl).toBe(300);
    });

    it('should create research configuration with higher limits', () => {
      const config = geminiConfig.createGenerationConfig('research');
      
      expect(config.maxOutputTokens).toBe(3072);
      expect(config.temperature).toBe(0.5);
      expect(config.cacheConfig?.ttl).toBe(3600);
    });

    it('should allow custom limits override', () => {
      const config = geminiConfig.createGenerationConfig('chat', {
        maxOutputTokens: 4096,
        temperature: 0.9,
        topK: 40
      });
      
      expect(config.maxOutputTokens).toBe(4096);
      expect(config.temperature).toBe(0.9);
      expect(config.topK).toBe(40);
    });
  });

  describe('optimizeConversation', () => {
    const systemPrompt = 'You are a helpful AI assistant.';
    const sessionId = 'test-session-123';

    it('should optimize empty conversation', async () => {
      const result = await geminiConfig.optimizeConversation([], systemPrompt, sessionId);
      
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].role).toBe('user');
      expect(result.contents[0].parts[0].text).toBe(systemPrompt);
      expect(result.estimatedTokens).toBeGreaterThan(0);
      expect(result.usedCache).toBe(false);
      expect(result.summary).toBeUndefined();
    });

    it('should optimize short conversation without summarization', async () => {
      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' },
        { role: 'user' as const, content: 'How are you?' }
      ];
      
      const result = await geminiConfig.optimizeConversation(messages, systemPrompt, sessionId);
      
      expect(result.contents).toHaveLength(4); // system + 3 messages
      expect(result.estimatedTokens).toBeLessThan(100);
      expect(result.summary).toBeUndefined();
    });

    it('should create summary for long conversations', async () => {
      // Create a long conversation that exceeds token limit
      const messages = [];
      for (let i = 0; i < 50; i++) {
        messages.push({
          role: 'user' as const,
          content: `This is a very long message number ${i} with lots of content to ensure we exceed the token limit for testing purposes. It contains many words and sentences.`
        });
        messages.push({
          role: 'assistant' as const,
          content: `This is a detailed response to message ${i} with equally long content to simulate a real conversation that would benefit from summarization.`
        });
      }
      
      const result = await geminiConfig.optimizeConversation(messages, systemPrompt, sessionId, 1000);
      
      expect(result.summary).toBeDefined();
      expect(result.contents.length).toBeLessThan(messages.length + 1);
      // The summary is included in the contents array, not prefixed with [CONVERSATION SUMMARY]
      const hasSummary = result.contents.some(content => 
        content.parts?.[0]?.text?.includes('Previous conversation summary:')
      );
      expect(hasSummary).toBe(true);
    });

    it('should use cache for repeated conversations', async () => {
      // Use a unique session ID for this test
      const testSessionId = 'cache-test-' + Date.now();
      
      // Need more than 5 messages for caching to kick in
      const messages = [
        { role: 'user' as const, content: 'Test message 1' },
        { role: 'assistant' as const, content: 'Test response 1' },
        { role: 'user' as const, content: 'Test message 2' },
        { role: 'assistant' as const, content: 'Test response 2' },
        { role: 'user' as const, content: 'Test message 3' },
        { role: 'assistant' as const, content: 'Test response 3' },
        { role: 'user' as const, content: 'Test message 4' },
        { role: 'assistant' as const, content: 'Test response 4' }
      ];
      
      // Clear cache before test
      geminiConfig.clearExpiredCache();
      
      // First call - should not use cache
      const result1 = await geminiConfig.optimizeConversation(messages, systemPrompt, testSessionId);
      expect(result1.usedCache).toBe(false);
      
      // Add more messages to trigger cache usage on second call
      const extendedMessages = [...messages, 
        { role: 'user' as const, content: 'New message' },
        { role: 'assistant' as const, content: 'New response' }
      ];
      
      // Second call with extended content - should use cache for early messages
      const result2 = await geminiConfig.optimizeConversation(extendedMessages, systemPrompt, testSessionId);
      expect(result2.usedCache).toBe(true);
    });

    it('should handle model role conversion correctly', async () => {
      // Use a unique session ID to avoid cache contamination
      const uniqueSessionId = 'role-conversion-test-' + Date.now();
      
      const messages = [
        { role: 'user' as const, content: 'User message' },
        { role: 'model' as const, content: 'Model response' },
        { role: 'assistant' as const, content: 'Assistant response' }
      ];
      
      const result = await geminiConfig.optimizeConversation(messages, systemPrompt, uniqueSessionId);
      
      // First content is always the system prompt
      expect(result.contents[0].role).toBe('user');
      expect(result.contents[0].parts[0].text).toBe(systemPrompt);
      
      // Check the actual messages - formatMessages logic:
      // - 'assistant' -> 'model'
      // - anything else (including 'model') -> 'user'
      expect(result.contents.length).toBe(4); // system + 3 messages
      expect(result.contents[1].role).toBe('user'); // user stays user
      expect(result.contents[2].role).toBe('user'); // model becomes user (not 'assistant')
      expect(result.contents[3].role).toBe('model'); // assistant converted to model
    });
  });

  describe('cache management', () => {
    it('should clear expired cache entries', async () => {
      const messages = [{ role: 'user' as const, content: 'Test' }];
      
      // Create some cache entries
      await geminiConfig.optimizeConversation(messages, 'Prompt 1', 'session-1');
      await geminiConfig.optimizeConversation(messages, 'Prompt 2', 'session-2');
      
      const statsBefore = geminiConfig.getCacheStats();
      expect(statsBefore.conversationEntries).toBeGreaterThan(0);
      
      // Clear expired (none should be expired yet)
      geminiConfig.clearExpiredCache();
      
      const statsAfter = geminiConfig.getCacheStats();
      expect(statsAfter.conversationEntries).toBe(statsBefore.conversationEntries);
    });

    it('should report cache statistics', async () => {
      // Need more than 5 messages to trigger caching
      const messages = [
        { role: 'user' as const, content: 'Message 1' },
        { role: 'assistant' as const, content: 'Response 1' },
        { role: 'user' as const, content: 'Message 2' },
        { role: 'assistant' as const, content: 'Response 2' },
        { role: 'user' as const, content: 'Message 3' },
        { role: 'assistant' as const, content: 'Response 3' },
        { role: 'user' as const, content: 'Message 4' },
        { role: 'assistant' as const, content: 'Response 4' }
      ];
      
      await geminiConfig.optimizeConversation(messages, 'System prompt for stats', 'session-stats');
      
      const stats = geminiConfig.getCacheStats();
      expect(stats.conversationEntries).toBeGreaterThan(0);
      // System prompt entries might be 0 if not cached separately
      expect(stats.conversationEntries + stats.systemPromptEntries).toBeGreaterThan(0);
      expect(stats.totalMemoryKB).toBeGreaterThan(0);
    });
  });

  describe('utility functions', () => {
    it('should export createOptimizedConfig helper', () => {
      const config = createOptimizedConfig('chat', { maxOutputTokens: 1024 });
      
      expect(config.maxOutputTokens).toBe(1024);
      expect(config.temperature).toBe(0.7);
    });

    it('should export optimizeConversation helper', async () => {
      const messages = [{ role: 'user' as const, content: 'Test' }];
      const result = await optimizeConversation(messages, 'System', 'session');
      
      expect(result.contents).toBeDefined();
      expect(result.estimatedTokens).toBeGreaterThan(0);
    });
  });
});