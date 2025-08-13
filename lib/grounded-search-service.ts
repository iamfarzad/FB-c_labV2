import { supabaseService } from './supabase/client'

interface SearchLeadParams {
  name: string
  email: string
  company?: string
  sources: readonly string[]
  leadId: string
}

interface SearchResult {
  url: string
  title?: string
  snippet?: string
  source: string
  metadata?: Record<string, unknown>
}

export class GroundedSearchService {
  async searchLead(params: SearchLeadParams): Promise<SearchResult[]> {
    try {
      console.info(`🔍 Starting grounded search for ${params.name} (${params.email})`)
      
      // For now, return mock search results
      // In a real implementation, this would integrate with search APIs
      const mockResults: SearchResult[] = [
        {
          url: `https://linkedin.com/in/${params.name.toLowerCase().replace(/\s+/g, '-')}`,
          title: `${params.name} - LinkedIn Profile`,
          snippet: `Professional profile for ${params.name}${params.company ? ` at ${params.company}` : ''}`,
          source: 'linkedin.com'
        },
        {
          url: `https://google.com/search?q=${encodeURIComponent(`${params.name} ${params.company || ''}`)}`,
          title: `Google Search Results for ${params.name}`,
          snippet: `Search results for ${params.name}${params.company ? ` at ${params.company}` : ''}`,
          source: 'google.com'
        }
      ]

      // Save search results to database
      if (mockResults.length > 0) {
        await this.saveSearchResults(params.leadId, mockResults)
      }

      console.info(`✅ Found ${mockResults.length} search results for ${params.name}`)
      return mockResults

    } catch (error) {
      console.error('❌ Grounded search failed:', error)
      throw error
    }
  }

  private async saveSearchResults(leadId: string, results: SearchResult[]): Promise<void> {
    try {
      // Save to lead_search_results table
      const searchRecords = results.map(result => ({
        lead_id: leadId,
        source: result.source,
        url: result.url,
        title: result.title,
        snippet: result.snippet,
        raw: { ...result }
      }))

      const { error } = await supabaseService
        .from('lead_search_results')
        .insert(searchRecords)

      if (error) {
        console.error('Failed to save search results:', error)
      } else {
        console.info(`💾 Saved ${results.length} search results to database`)
      }

    } catch (error) {
      console.error('Error saving search results:', error)
    }
  }

  async getSearchResults(leadId: string): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabaseService
        .from('lead_search_results')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch search results:', error)
        return []
      }

      return data?.map(item => ({
        url: item.url,
        title: item.title,
        snippet: item.snippet,
        source: item.source
      })) || []

    } catch (error) {
      console.error('Error fetching search results:', error)
      return []
    }
  }
}
