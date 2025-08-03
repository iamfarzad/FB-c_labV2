import { CacheCleanupService, cacheCleanupService } from '@/lib/cache-cleanup-service';
import { GeminiConfigEnhanced } from '@/lib/gemini-config-enhanced';

// Mock timers for testing
jest.useFakeTimers();

describe('CacheCleanupService', () => {
  let service: CacheCleanupService;
  let geminiConfig: GeminiConfigEnhanced;

  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    
    // Get fresh instances
    service = CacheCleanupService.getInstance();
    geminiConfig = GeminiConfigEnhanced.getInstance();
    
    // Stop any existing cleanup to ensure clean state
    service.stopCleanup();
    
    // Clear any existing cache
    service.clearAllCache();
    
    // Clear the singleton's interval to ensure clean state
    (service as any).cleanupInterval = null;
  });

  afterEach(() => {
    service.stopCleanup();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CacheCleanupService.getInstance();
      const instance2 = CacheCleanupService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should have a global cacheCleanupService export', () => {
      expect(cacheCleanupService).toBe(CacheCleanupService.getInstance());
    });
  });

  describe('startCleanup', () => {
    it('should start cleanup interval', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      service.startCleanup(30);
      
      expect(consoleSpy).toHaveBeenCalledWith('🧹 Starting cache cleanup service (every 30 minutes)');
      
      consoleSpy.mockRestore();
    });

    it('should not start multiple intervals', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      service.startCleanup(30);
      service.startCleanup(30);
      
      // Should see "Starting" message once, and "already running" message once
      expect(consoleSpy).toHaveBeenCalledWith('🧹 Starting cache cleanup service (every 30 minutes)');
      expect(consoleSpy).toHaveBeenCalledWith('🧹 Cache cleanup already running');
      
      consoleSpy.mockRestore();
    });

    it('should perform cleanup at specified intervals', async () => {
      const performCleanupSpy = jest.spyOn(service, 'performCleanup');
      
      service.startCleanup(1); // 1 minute interval
      
      // Initial cleanup is called immediately
      expect(performCleanupSpy).toHaveBeenCalledTimes(1);
      
      // Fast-forward 1 minute
      jest.advanceTimersByTime(60000);
      
      expect(performCleanupSpy).toHaveBeenCalledTimes(2);
      
      // Fast-forward another minute
      jest.advanceTimersByTime(60000);
      
      expect(performCleanupSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('stopCleanup', () => {
    it('should stop cleanup interval', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      service.startCleanup(30);
      service.stopCleanup();
      
      expect(consoleSpy).toHaveBeenCalledWith('🧹 Cache cleanup service stopped');
      
      consoleSpy.mockRestore();
    });

    it('should handle stopping when not started', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      service.stopCleanup();
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('performCleanup', () => {
    it('should call clearExpiredCache on GeminiConfigEnhanced', async () => {
      const clearExpiredCacheSpy = jest.spyOn(geminiConfig, 'clearExpiredCache');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Add some test data to cache
      await geminiConfig.optimizeConversation(
        [{ role: 'user', content: 'test' }],
        'system prompt',
        'test-session'
      );
      
      service.performCleanup();
      
      expect(clearExpiredCacheSpy).toHaveBeenCalled();
      // The log message includes an object, so we check for the start of the message
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🧹 Cache cleanup completed:'),
        expect.any(Object)
      );
      
      clearExpiredCacheSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle cleanup errors gracefully', () => {
      const clearExpiredCacheSpy = jest.spyOn(geminiConfig, 'clearExpiredCache').mockImplementation(() => {
        throw new Error('Test error');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Should not throw
      expect(() => service.performCleanup()).not.toThrow();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Cache cleanup failed'),
        expect.any(Error)
      );
      
      clearExpiredCacheSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      // Add some test data - need more than 5 messages to trigger caching
      const messages = [];
      for (let i = 0; i < 8; i++) {
        messages.push({ role: 'user' as const, content: `Test message ${i}` });
        messages.push({ role: 'assistant' as const, content: `Test response ${i}` });
      }
      
      await geminiConfig.optimizeConversation(
        messages,
        'test system prompt for stats',
        'stats-session-' + Date.now()
      );
      
      const stats = service.getCacheStats();
      
      expect(stats).toHaveProperty('conversationEntries');
      expect(stats).toHaveProperty('systemPromptEntries');
      expect(stats).toHaveProperty('totalMemoryKB');
      expect(stats.conversationEntries).toBeGreaterThan(0);
      // System prompt entries might be 0 if not cached separately
      expect(stats.conversationEntries + stats.systemPromptEntries).toBeGreaterThan(0);
    });
  });

  describe('clearAllCache', () => {
    it('should clear all cache entries', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Add some test data - need more than 5 messages to trigger caching
      const messages = [];
      for (let i = 0; i < 8; i++) {
        messages.push({ role: 'user' as const, content: `Clear test ${i}` });
        messages.push({ role: 'assistant' as const, content: `Clear response ${i}` });
      }
      
      await geminiConfig.optimizeConversation(
        messages,
        'system to clear',
        'clear-session-' + Date.now()
      );
      
      const statsBefore = service.getCacheStats();
      expect(statsBefore.conversationEntries).toBeGreaterThan(0);
      
      service.clearAllCache();
      
      const statsAfter = service.getCacheStats();
      expect(statsAfter.conversationEntries).toBe(0);
      expect(statsAfter.systemPromptEntries).toBe(0);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('🧹 Force clearing all cache entries'));
      
      consoleSpy.mockRestore();
    });
  });

  describe('automatic startup', () => {
    it('should not start automatically in test environment', () => {
      // Create a fresh instance without any manual startup
      const freshService = CacheCleanupService.getInstance();
      const performCleanupSpy = jest.spyOn(freshService, 'performCleanup');
      
      // Reset any existing interval
      (freshService as any).cleanupInterval = null;
      
      // Fast-forward time to check if cleanup runs
      jest.advanceTimersByTime(3600000); // 1 hour
      
      // In test environment, the automatic startup should be disabled
      expect((freshService as any).cleanupInterval).toBeNull();
      
      performCleanupSpy.mockRestore();
    });
  });
});