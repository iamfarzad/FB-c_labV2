import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { GeminiLiveAPI } from '../lib/gemini-live-api'

// Mock environment variables
process.env.GEMINI_API_KEY = 'test-api-key'

// Mock the GoogleGenAI class
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContentStream: jest.fn().mockResolvedValue({
        [Symbol.asyncIterator]: async function* () {
          yield { text: 'Mocked response with professional analysis' }
        }
      }),
      generateContent: jest.fn().mockResolvedValue({
        candidates: [{
          content: {
            parts: [{ text: 'Mocked fallback response with insights' }]
          }
        }]
      })
    }
  }))
}))

describe('GeminiLiveAPI', () => {
  let geminiAPI: GeminiLiveAPI

  beforeEach(() => {
    geminiAPI = new GeminiLiveAPI()
  })

  describe('performGroundedSearch', () => {
    it('should generate professional lead analysis with valid context', async () => {
      const leadContext = {
        name: 'John Doe',
        email: 'john@techcorp.com',
        company: 'TechCorp',
        role: 'CTO'
      }
      
      const userMessage = 'Hello, I am interested in AI solutions'
      
      const result = await geminiAPI.performGroundedSearch(leadContext, userMessage)
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(100)
      expect(result).toContain('John')
      expect(result).toContain('TechCorp')
      expect(result).toContain('CTO')
      expect(result).toContain('AI')
    })

    it('should handle missing company and role gracefully', async () => {
      const leadContext = {
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
      
      const userMessage = 'Hi, I need help with automation'
      
      const result = await geminiAPI.performGroundedSearch(leadContext, userMessage)
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(50)
      expect(result).toContain('Jane')
    })

    it('should not say "cannot search" or similar limitations', async () => {
      const leadContext = {
        name: 'Test User',
        email: 'test@company.com',
        company: 'Test Company',
        role: 'Manager'
      }
      
      const userMessage = 'What can AI do for my business?'
      
      const result = await geminiAPI.performGroundedSearch(leadContext, userMessage)
      
      expect(result).not.toContain('cannot')
      expect(result).not.toContain('unable')
      expect(result).not.toContain('limitation')
      expect(result).not.toContain('privacy')
    })

    it('should provide industry-specific insights', async () => {
      const leadContext = {
        name: 'Sarah Johnson',
        email: 'sarah@healthcare.com',
        company: 'Healthcare Solutions',
        role: 'Operations Director'
      }
      
      const userMessage = 'How can AI improve our operations?'
      
      const result = await geminiAPI.performGroundedSearch(leadContext, userMessage)
      
      expect(result).toContain('healthcare')
      expect(result).toContain('operations')
      expect(result).toContain('AI')
      expect(result).toContain('automation')
    })
  })

  describe('LeadContext interface', () => {
    it('should accept all required fields', () => {
      const validContext = {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        role: 'Manager',
        interests: 'AI and automation',
        challenges: 'Manual processes'
      }
      
      expect(validContext.name).toBeDefined()
      expect(validContext.email).toBeDefined()
      expect(validContext.company).toBeDefined()
      expect(validContext.role).toBeDefined()
    })
  })
}) 