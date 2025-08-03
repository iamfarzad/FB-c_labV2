/**
 * Enhanced Gemini Configuration with Cost Optimization
 * Implements context caching, token limits, and conversation summarization
 */

export interface EnhancedGenerationConfig {
  maxOutputTokens: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  responseMimeType?: string;
  // Context caching configuration
  cacheConfig?: {
    ttl: number; // Time to live in seconds
    enabled: boolean;
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
  timestamp?: string;
}

export interface OptimizedContent {
  contents: any[];
  estimatedTokens: number;
  usedCache: boolean;
  summary?: string;
}

export class GeminiConfigEnhanced {
  private static instance: GeminiConfigEnhanced;
  private conversationCache = new Map<string, { content: any[], timestamp: number, tokens: number }>();
  private systemPromptCache = new Map<string, { content: string, timestamp: number, tokens: number }>();

  static getInstance(): GeminiConfigEnhanced {
    if (!GeminiConfigEnhanced.instance) {
      GeminiConfigEnhanced.instance = new GeminiConfigEnhanced();
    }
    return GeminiConfigEnhanced.instance;
  }

  /**
   * Create optimized generation config with token limits
   */
  createGenerationConfig(
    feature: 'chat' | 'analysis' | 'document' | 'live' | 'research',
    customLimits?: Partial<EnhancedGenerationConfig>
  ): EnhancedGenerationConfig {
    const baseConfigs = {
      chat: {
        maxOutputTokens: 2048, // Reasonable limit for chat responses
        temperature: 0.7,
        topP: 0.8,
        responseMimeType: 'text/plain',
        cacheConfig: { ttl: 1800, enabled: true } // 30 min cache
      },
      analysis: {
        maxOutputTokens: 1024, // Shorter for analysis
        temperature: 0.3, // More focused
        topP: 0.9,
        responseMimeType: 'text/plain',
        cacheConfig: { ttl: 3600, enabled: true } // 1 hour cache
      },
      document: {
        maxOutputTokens: 1536,
        temperature: 0.4,
        topP: 0.85,
        responseMimeType: 'text/plain',
        cacheConfig: { ttl: 7200, enabled: true } // 2 hour cache
      },
      live: {
        maxOutputTokens: 512, // Short for live responses
        temperature: 0.6,
        topP: 0.8,
        responseMimeType: 'text/plain',
        cacheConfig: { ttl: 300, enabled: true } // 5 min cache
      },
      research: {
        maxOutputTokens: 3072, // Longer for research
        temperature: 0.5,
        topP: 0.9,
        responseMimeType: 'text/plain',
        cacheConfig: { ttl: 3600, enabled: true } // 1 hour cache
      }
    };

    return { ...baseConfigs[feature], ...customLimits };
  }

  /**
   * Optimize conversation history to reduce token usage
   */
  async optimizeConversation(
    messages: ConversationMessage[],
    systemPrompt: string,
    sessionId: string,
    maxHistoryTokens: number = 4000
  ): Promise<OptimizedContent> {
    const cacheKey = `${sessionId}_${this.hashContent(systemPrompt)}`;
    const now = Date.now();

    // Check if we have cached content
    const cached = this.conversationCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < 1800000) { // 30 min cache
      // Use cached content if recent
      const newMessages = messages.slice(-3); // Keep last 3 messages
      const contents = [
        ...cached.content,
        ...this.formatMessages(newMessages)
      ];
      
      return {
        contents,
        estimatedTokens: cached.tokens + this.estimateTokens(newMessages),
        usedCache: true
      };
    }

    // Create optimized content
    const optimizedContent = await this.createOptimizedContent(
      messages, 
      systemPrompt, 
      maxHistoryTokens
    );

    // Cache the system prompt and early conversation
    if (messages.length > 5) {
      const cacheableContent = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...this.formatMessages(messages.slice(0, Math.min(5, messages.length - 3)))
      ];
      
      this.conversationCache.set(cacheKey, {
        content: cacheableContent,
        timestamp: now,
        tokens: this.estimateTokens(messages.slice(0, 5)) + this.estimateTokens([{ content: systemPrompt, role: 'user' }])
      });
    }

    return optimizedContent;
  }

  /**
   * Create optimized content with summarization
   */
  private async createOptimizedContent(
    messages: ConversationMessage[],
    systemPrompt: string,
    maxHistoryTokens: number
  ): Promise<OptimizedContent> {
    // Always include system prompt
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] }
    ];

    let totalTokens = this.estimateTokens([{ content: systemPrompt, role: 'user' }]);
    
    if (messages.length <= 6) {
      // For short conversations, include all messages
      const formattedMessages = this.formatMessages(messages);
      contents.push(...formattedMessages);
      totalTokens += this.estimateTokens(messages);
      
      return {
        contents,
        estimatedTokens: totalTokens,
        usedCache: false
      };
    }

    // For long conversations, summarize older messages
    const recentMessages = messages.slice(-4); // Keep last 4 messages
    const olderMessages = messages.slice(0, -4);
    
    // Create summary of older messages
    const summary = this.createConversationSummary(olderMessages);
    const summaryTokens = this.estimateTokens([{ content: summary, role: 'user' }]);
    
    if (summaryTokens < maxHistoryTokens * 0.3) { // Summary should be < 30% of max tokens
      contents.push({ role: 'user', parts: [{ text: `Previous conversation summary: ${summary}` }] });
      totalTokens += summaryTokens;
    }

    // Add recent messages
    const formattedRecent = this.formatMessages(recentMessages);
    contents.push(...formattedRecent);
    totalTokens += this.estimateTokens(recentMessages);

    return {
      contents,
      estimatedTokens: totalTokens,
      usedCache: false,
      summary
    };
  }

  /**
   * Create a summary of conversation messages
   */
  private createConversationSummary(messages: ConversationMessage[]): string {
    if (messages.length === 0) return '';
    
    const topics = new Set<string>();
    const keyPoints: string[] = [];
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Extract potential topics (simple keyword detection)
      if (content.includes('business') || content.includes('company')) topics.add('business');
      if (content.includes('analysis') || content.includes('analyze')) topics.add('analysis');
      if (content.includes('document') || content.includes('file')) topics.add('documents');
      if (content.includes('image') || content.includes('screenshot')) topics.add('images');
      if (content.includes('help') || content.includes('assist')) topics.add('assistance');
      
      // Keep important short messages
      if (msg.content.length < 100 && msg.content.includes('?')) {
        keyPoints.push(msg.content.substring(0, 80));
      }
    });

    const topicList = Array.from(topics).join(', ');
    const summary = `Discussed topics: ${topicList || 'general conversation'}. ${keyPoints.length > 0 ? `Key questions: ${keyPoints.slice(0, 2).join('; ')}` : ''}`;
    
    return summary.length > 200 ? summary.substring(0, 197) + '...' : summary;
  }

  /**
   * Format messages for Gemini API
   */
  private formatMessages(messages: ConversationMessage[]): any[] {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(messages: ConversationMessage[]): number {
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 4); // Rough estimate: 4 chars per token
  }

  /**
   * Create hash for content caching
   */
  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.conversationCache.forEach((value, key) => {
      if (now - value.timestamp > 1800000) { // 30 minutes
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.conversationCache.delete(key);
    });

    console.log(`🧹 Cleared ${expiredKeys.length} expired cache entries`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { conversationEntries: number, systemPromptEntries: number, totalMemoryKB: number } {
    const conversationSize = JSON.stringify([...this.conversationCache.entries()]).length;
    const systemPromptSize = JSON.stringify([...this.systemPromptCache.entries()]).length;
    
    return {
      conversationEntries: this.conversationCache.size,
      systemPromptEntries: this.systemPromptCache.size,
      totalMemoryKB: Math.round((conversationSize + systemPromptSize) / 1024)
    };
  }
}

// Convenience functions
export const geminiConfig = GeminiConfigEnhanced.getInstance();

export const createOptimizedConfig = (feature: 'chat' | 'analysis' | 'document' | 'live' | 'research', customLimits?: Partial<EnhancedGenerationConfig>) => {
  return geminiConfig.createGenerationConfig(feature, customLimits);
};

export const optimizeConversation = (messages: ConversationMessage[], systemPrompt: string, sessionId: string, maxHistoryTokens?: number) => {
  return geminiConfig.optimizeConversation(messages, systemPrompt, sessionId, maxHistoryTokens);
};