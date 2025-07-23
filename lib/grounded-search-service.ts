import { GoogleGenAI } from "@google/genai"
import { getSupabase } from "@/lib/supabase/server"
import { logActivity } from "@/lib/activity-logger"

interface SearchResult {
  url: string
  title?: string
  snippet?: string
  source: string
}

interface GroundedSearchOptions {
  name: string
  email: string
  company?: string
  sources?: string[]
  leadId?: string
}

export class GroundedSearchService {
  private genAI: GoogleGenAI
  private supabase: any

  constructor() {
    this.genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    })
    this.supabase = getSupabase()
  }

  /**
   * Perform grounded search for a lead
   */
  async searchLead(options: GroundedSearchOptions): Promise<SearchResult[]> {
    const { name, email, company, sources = ['linkedin.com'], leadId } = options

    try {
      // Log search start
      await logActivity({
        type: "search",
        title: "Grounded Search Started",
        description: `Searching for ${name} using grounded search`,
        status: "in_progress",
        metadata: { name, email, company, sources }
      })

      // Build search prompt
      const searchPrompt = this.buildSearchPrompt(name, email, company)
      
      // Perform grounded search
      const searchResults = await this.performGroundedSearch(searchPrompt, sources)
      
      // Store results in database if leadId provided
      if (leadId && searchResults.length > 0) {
        await this.storeSearchResults(leadId, searchResults)
      }

      // Log search completion
      await logActivity({
        type: "search",
        title: "Grounded Search Completed",
        description: `Found ${searchResults.length} results for ${name}`,
        status: "completed",
        metadata: { 
          name, 
          email, 
          company, 
          resultCount: searchResults.length 
        }
      })

      return searchResults

    } catch (error) {
      console.error('Grounded search error:', error)
      
      // Log search error
      await logActivity({
        type: "error",
        title: "Grounded Search Failed",
        description: `Search failed for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: "failed",
        metadata: { name, email, company, error: error instanceof Error ? error.message : 'Unknown error' }
      })
      
      throw error
    }
  }

  /**
   * Build search prompt for the lead
   */
  private buildSearchPrompt(name: string, email: string, company?: string): string {
    let prompt = `Find the LinkedIn profile URL and headline for ${name}`
    
    if (company) {
      prompt += ` who works at ${company}`
    }
    
    prompt += `. Also search for any recent professional activity, company information, and industry insights.`
    
    return prompt
  }

  /**
   * Perform the actual grounded search using Gemini
   */
  private async performGroundedSearch(prompt: string, sources: string[]): Promise<SearchResult[]> {
    try {
      // Use grounded search model - try different model names
      const model = "gemini-2.0-flash-exp" // Alternative model name
      
      const config = {
        grounding: {
          sources: sources,
          web: true
        },
        temperature: 0.0, // Deterministic results
        responseMimeType: "application/json" // Request structured output
      }

      const response = await this.genAI.models.generateContent({
        model,
        config,
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      })

      const content = response.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (!content) {
        throw new Error('No content received from grounded search')
      }

      // Parse the response
      return this.parseSearchResults(content)

    } catch (error) {
      console.error('Grounded search API error:', error)
      
      // Fallback to regular search if grounded search fails
      return this.fallbackSearch(prompt, sources)
    }
  }

  /**
   * Parse search results from Gemini response
   */
  private parseSearchResults(content: string): SearchResult[] {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content)
      
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          url: item.url || '',
          title: item.title || '',
          snippet: item.snippet || '',
          source: this.detectSource(item.url || '')
        }))
      }
      
      // If it's an object with results array
      if (parsed.results && Array.isArray(parsed.results)) {
        return parsed.results.map((item: any) => ({
          url: item.url || '',
          title: item.title || '',
          snippet: item.snippet || '',
          source: this.detectSource(item.url || '')
        }))
      }

      // If it's a single result
      if (parsed.url) {
        return [{
          url: parsed.url,
          title: parsed.title || '',
          snippet: parsed.snippet || '',
          source: this.detectSource(parsed.url)
        }]
      }

    } catch (parseError) {
      console.warn('Failed to parse search results as JSON:', parseError)
    }

    // Fallback: extract URLs from text
    return this.extractUrlsFromText(content)
  }

  /**
   * Extract URLs from text content as fallback
   */
  private extractUrlsFromText(content: string): SearchResult[] {
    const urlRegex = /https?:\/\/[^\s]+/g
    const urls = content.match(urlRegex) || []
    
    return urls.map(url => ({
      url,
      title: '',
      snippet: '',
      source: this.detectSource(url)
    }))
  }

  /**
   * Detect source from URL
   */
  private detectSource(url: string): string {
    if (url.includes('linkedin.com')) return 'linkedin'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
    if (url.includes('facebook.com')) return 'facebook'
    if (url.includes('instagram.com')) return 'instagram'
    if (url.includes('github.com')) return 'github'
    if (url.includes('crunchbase.com')) return 'crunchbase'
    return 'web'
  }

  /**
   * Fallback search using regular Gemini model
   */
  private async fallbackSearch(prompt: string, sources: string[]): Promise<SearchResult[]> {
    console.log('Using fallback search method')
    
    const model = "gemini-2.5-flash"
    
    const config = {
      tools: [{ urlContext: {} }],
      temperature: 0.0,
      responseMimeType: "text/plain"
    }

    const response = await this.genAI.models.generateContent({
      model,
      config,
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })

    const content = response.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    return this.extractUrlsFromText(content)
  }

  /**
   * Store search results in database
   */
  private async storeSearchResults(leadId: string, results: SearchResult[]): Promise<void> {
    try {
      if (results.length === 0) {
        console.log('No search results to store')
        return
      }

      // Use the LeadManagementService for storing results
      const { LeadManagementService } = await import('./lead-management')
      const leadManagementService = new LeadManagementService()
      
      await leadManagementService.storeSearchResults(leadId, results)
      
      console.log(`Stored ${results.length} search results for lead ${leadId}`)
    } catch (error) {
      console.error('Error storing search results:', error)
      throw error
    }
  }

  /**
   * Get search results for a lead
   */
  async getSearchResults(leadId: string): Promise<SearchResult[]> {
    try {
      const { data, error } = await this.supabase
        .from('lead_search_results')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch search results:', error)
        throw error
      }

      return data || []

    } catch (error) {
      console.error('Error fetching search results:', error)
      throw error
    }
  }
} 