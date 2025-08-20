import { GoogleGenAI } from '@google/genai'

export type GroundedCitation = { uri: string; title?: string; description?: string; source?: 'url' | 'search' }
export type GroundedAnswer = { text: string; citations: GroundedCitation[]; raw?: any }

export class GoogleGroundingProvider {
  private genAI: GoogleGenAI

  constructor() {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured')
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }

  /**
   * Extract citations from Gemini response metadata
   */
  private extractCitations(candidate: any): GroundedCitation[] {
    const citations: GroundedCitation[] = []

    // Search grounding citations
    const chunks = candidate?.groundingMetadata?.groundingChunks ?? []
    const searchCitations: GroundedCitation[] = (Array.isArray(chunks) ? chunks : [])
      .map((c: any) => c.web)
      .filter(Boolean)
      .map((w: any) => ({ uri: w.uri, title: w.title, description: w.snippet, source: 'search' as const }))

    // URL Context citations (if available)
    const urlMeta = candidate?.urlContextMetadata?.urlMetadata ?? []
    const urlCitations: GroundedCitation[] = (Array.isArray(urlMeta) ? urlMeta : [])
      .map((m: any) => ({ uri: m.retrievedUrl || m.url || m.uri, title: m.title, description: m.snippet, source: 'url' as const }))

    citations.push(...urlCitations, ...searchCitations)
    return citations
  }

  /**
   * Generate a grounded answer using Google Search and optional URL Context.
   * If urls are provided, the urlContext tool will be enabled and Gemini will
   * fetch content directly from those URLs to ground its response. When no URLs
   * are provided, we fall back to Search-only grounding.
   */
  async groundedAnswer(query: string, urls?: string[]): Promise<GroundedAnswer> {
    try {
      const useUrls = Array.isArray(urls) && urls.length > 0
      const tools: any[] = [{ googleSearch: {} }]
      if (useUrls) tools.unshift({ urlContext: {} })

      // When urlContext is enabled, Gemini uses any URLs present in contents.
      // Provide the URLs inline to the model so it can fetch them.
      const prompt = useUrls
        ? `Use these URLs as context (if relevant):\n${urls!.slice(0, 20).join('\n')}\n\nQuestion: ${query}`
        : query

      const res = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }]}],
        config: { tools },
      } as any)

      const text = typeof (res as any).text === 'function'
        ? (res as any).text()
        : (res as any).text
          ?? (((res as any).candidates?.[0]?.content?.parts || [])
                .map((p: any) => p.text || '').filter(Boolean).join('\n'))

      const candidate = (res as any).candidates?.[0] || {}

      // Extract citations using helper function
      const citations = this.extractCitations(candidate)

      return { text, citations, raw: res }
    } catch (error) {
      console.error('Google grounding search failed:', error)
      return {
        text: `I couldn't find specific information about "${query}". Please try rephrasing your question or provide more context.`,
        citations: [],
        raw: null,
      }
    }
  }

  async searchCompany(domain: string): Promise<GroundedAnswer> {
    const query = `Find information about the company at ${domain}. Include: company name, industry, size, location, main products/services, and company description.`
    return this.groundedAnswer(query)
  }

  async searchPerson(name: string, company?: string): Promise<GroundedAnswer> {
    const companyFilter = company ? ` at ${company}` : ''
    const query = `Find professional information about ${name}${companyFilter}. Include: full name, current role, company, LinkedIn profile if available, and professional background.`
    return this.groundedAnswer(query)
  }

  async searchRole(name: string, domain: string): Promise<GroundedAnswer> {
    const query = `What is ${name}'s current role and position at ${domain}? Find their professional title, seniority level, and responsibilities.`
    return this.groundedAnswer(query)
  }
}
