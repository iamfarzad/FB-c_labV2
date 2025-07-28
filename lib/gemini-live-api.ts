import { GoogleGenAI } from '@google/genai'
import { GroundedSearchService } from './grounded-search-service'

export interface LeadContext {
  name: string
  email: string
  company?: string
  role?: string
  interests?: string
  challenges?: string
}

export class GeminiLiveAPI {
  private apiKey: string
  private groundedSearchService: GroundedSearchService

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY!
    this.groundedSearchService = new GroundedSearchService()
  }

  async performGroundedSearch(leadContext: LeadContext, userMessage: string) {
    try {
      // First, perform real web search
      const searchResults = await this.performRealWebSearch(leadContext)
      
      const ai = new GoogleGenAI({
        apiKey: this.apiKey,
      });

      // Enhanced prompt that uses real search results
      const searchQuery = this.buildEnhancedPrompt(leadContext, userMessage, searchResults)

      const config = {
        responseMimeType: 'text/plain',
      };

      const model = 'gemini-2.5-flash';

      const contents = [
        {
          role: 'user',
          parts: [{ text: searchQuery }]
        }
      ];

      // Use generateContentStream for real-time responses
      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      // Collect full response
      let fullResponse = '';
      for await (const chunk of response) {
        if (chunk.text) {
          fullResponse += chunk.text;
        }
      }

      return fullResponse;

    } catch (error) {
      console.error('Grounded search failed:', error);
      
      // Fallback to enhanced prompt if API fails
      return this.generateFallbackResponse(leadContext, userMessage);
    }
  }

  private async performRealWebSearch(leadContext: LeadContext) {
    try {
      console.log(`🔍 Starting real web search for ${leadContext.name}...`)
      
      // Generate a proper UUID for the lead ID
      const tempLeadId = crypto.randomUUID()
      
      const searchResults = await this.groundedSearchService.searchLead({
        name: leadContext.name,
        email: leadContext.email,
        company: leadContext.company,
        sources: ['linkedin.com', 'google.com'],
        leadId: tempLeadId
      })

      console.log(`🔍 Real web search completed for ${leadContext.name}: ${searchResults.length} results`)
      return searchResults
    } catch (error) {
      console.error('Real web search failed, using fallback:', error)
      return []
    }
  }

  private buildEnhancedPrompt(leadContext: LeadContext, userMessage: string, searchResults: any[]) {
    const searchContext = searchResults.length > 0 
      ? `\n\nSEARCH RESULTS FOUND:\n${searchResults.map(result => 
          `- ${result.source}: ${result.title || result.url}\n  ${result.snippet || 'No snippet available'}`
        ).join('\n')}`
      : '\n\nNOTE: No specific search results found, but proceeding with intelligent analysis based on available information.'

    return `You are F.B/c, Farzad Bayat's AI-powered lead generation assistant. 

PERSON TO RESEARCH:
- Name: ${leadContext.name}
- Email: ${leadContext.email}
- Company: ${leadContext.company || 'Not specified'}
- Role: ${leadContext.role || 'Not specified'}

USER'S QUESTION: ${userMessage}${searchContext}

TASK: Based on the person's information and any available search results, provide a comprehensive analysis. Include:

1. **Professional Background Analysis**: What their role likely involves based on their title and company
2. **Industry Context**: What industry they're in and current trends/challenges
3. **Company Analysis**: Based on the email domain and company name, what type of business this likely is
4. **Pain Points**: Common challenges in their industry and role that AI could help with
5. **AI Opportunities**: Specific ways Farzad's AI services could benefit them
6. **Personalized Recommendations**: Tailored suggestions for their specific situation

IMPORTANT: 
- Use any available search results to enhance your analysis
- Do NOT say you cannot search or access information
- Be specific, actionable, and demonstrate deep industry knowledge
- Show how AI can solve their specific challenges
- Make the response feel personalized and relevant to their situation

RESPONSE FORMAT: Provide a professional, detailed analysis that shows you understand their business context and can offer valuable insights. Address them by name and make it feel like you've done real research on their background.`;
  }

  private async generateFallbackResponse(leadContext: LeadContext, userMessage: string) {
    const genAI = new GoogleGenAI({
      apiKey: this.apiKey,
    })

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are F.B/c, Farzad Bayat's AI-powered lead generation assistant. 

PERSON TO RESEARCH:
- Name: ${leadContext.name}
- Email: ${leadContext.email}
- Company: ${leadContext.company || 'Not specified'}
- Role: ${leadContext.role || 'Not specified'}

USER'S QUESTION: ${userMessage}

TASK: Provide a comprehensive lead analysis that demonstrates deep industry knowledge and AI expertise. Include:

1. **Professional Analysis**: Based on their name, email domain, and role, analyze their likely responsibilities and industry position
2. **Company Intelligence**: What type of business this likely is based on the company name and email domain
3. **Industry Context**: Current trends and challenges in their likely industry
4. **AI Pain Points**: Specific challenges in their role/industry that AI can solve
5. **Value Proposition**: How Farzad's AI services specifically benefit their situation
6. **Next Steps**: Personalized recommendations for engagement

IMPORTANT: Be specific, actionable, and demonstrate expertise. Do NOT say you cannot access information - instead provide intelligent analysis based on the data provided.

RESPONSE FORMAT: Provide a professional, detailed analysis that shows you understand their business context and can offer valuable insights.`
            }
          ]
        }
      ]
    })

    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      return result.candidates[0].content.parts[0].text
    } else {
      throw new Error('No response content found in fallback')
    }
  }
}
