import { GoogleGenAI } from '@google/genai'

export type GroundedCitation = { uri: string; title?: string; description?: string }
export type GroundedAnswer = { text: string; citations: GroundedCitation[]; raw?: any }

export class GoogleGroundingProvider {
  private genAI: GoogleGenAI

  constructor() {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured')
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }

  async groundedAnswer(query: string): Promise<GroundedAnswer> {
    try {
      const res = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: query }]}],
        config: { tools: [{ googleSearch: {} }] as any },
      } as any)

      const text = typeof (res as any).text === 'function'
        ? (res as any).text()
        : (res as any).text
          ?? (((res as any).candidates?.[0]?.content?.parts || [])
                .map((p: any) => p.text || '').filter(Boolean).join('\n'))

      const chunks = (res as any).candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
      const citations: GroundedCitation[] = chunks
        .map((c: any) => c.web)
        .filter(Boolean)
        .map((w: any) => ({ uri: w.uri, title: w.title, description: w.snippet }))

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
