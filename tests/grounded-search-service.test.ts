import { GroundedSearchService } from '@/lib/grounded-search-service'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => {
  const mockInsert = jest.fn(() => ({
    select: jest.fn(() => ({ single: jest.fn(() => ({ data: null, error: null })) }))
  }))

  const mockSelect = jest.fn(() => ({
    eq: jest.fn(() => ({
      order: jest.fn(() => ({ data: [], error: null }))
    }))
  }))

  const mockFrom = jest.fn(() => ({
    insert: mockInsert,
    select: mockSelect
  }))

  return {
    supabaseService: {
      from: mockFrom
    }
  }
})

describe('GroundedSearchService', () => {
  let service: GroundedSearchService

  beforeEach(() => {
    service = new GroundedSearchService()
    jest.clearAllMocks()
  })

  // Get mocked functions
  const getMockedSupabase = () => {
    const { supabaseService } = require('@/lib/supabase/client')
    return supabaseService
  }

  describe('searchLead', () => {
    const mockParams = {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Test Corp',
      sources: ['linkedin.com', 'google.com'] as const,
      leadId: 'test-lead-id'
    }

    it('should return mock search results for valid input', async () => {
      const results = await service.searchLead(mockParams)

      expect(results).toHaveLength(2)
      expect(results[0]).toMatchObject({
        url: expect.stringContaining('linkedin.com'),
        title: expect.stringContaining('John Doe'),
        source: 'linkedin.com'
      })
      expect(results[1]).toMatchObject({
        url: expect.stringContaining('google.com'),
        title: expect.stringContaining('John Doe'),
        source: 'google.com'
      })
    })

    it('should handle missing company gracefully', async () => {
      const paramsWithoutCompany = { ...mockParams, company: undefined }
      const results = await service.searchLead(paramsWithoutCompany)

      expect(results).toHaveLength(2)
      expect(results[0].snippet).not.toContain('at undefined')
    })

    it('should handle service errors and rethrow', async () => {
      const mockError = new Error('Service error')
      jest.spyOn(service as any, 'saveSearchResults').mockRejectedValue(mockError)

      await expect(service.searchLead(mockParams)).rejects.toThrow('Service error')
    })
  })

  describe('getSearchResults', () => {
    const mockLeadId = 'test-lead-id'

    it('should return empty array when database is not available', async () => {
      const results = await service.getSearchResults(mockLeadId)
      expect(results).toEqual([])
    })
  })

  describe('saveSearchResults', () => {
    it('should handle database errors gracefully', async () => {
      const mockResults = [
        {
          url: 'https://linkedin.com/in/john-doe',
          title: 'John Doe - LinkedIn',
          snippet: 'Professional profile',
          source: 'linkedin.com'
        }
      ]

      // Should not throw error when database is not available
      await expect((service as any).saveSearchResults('test-lead-id', mockResults)).resolves.not.toThrow()
    })
  })
}) 