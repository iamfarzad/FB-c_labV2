/**
 * Centralized Gemini AI Service
 * Handles all interactions with Google Generative AI
 * Includes error handling, token estimation, and budget enforcement
 */

import { GoogleGenerativeAI, type GenerateContentRequest, type GenerateContentResponse } from '@google/generative-ai'
import { createOptimizedConfig } from '@/lib/gemini-config-enhanced'
import { selectModelForFeature, estimateTokens, estimateTokensForMessages } from '@/lib/model-selector'
import { enforceBudgetAndLog } from '@/lib/token-usage-logger'
import { checkDemoAccess, recordDemoUsage, DemoFeature } from '@/lib/demo-budget-manager'
import { getSupabase } from '@/lib/supabase/server'

export interface GeminiServiceOptions {
  sessionId?: string
  userId?: string
  correlationId?: string
  enableStreaming?: boolean
  maxOutputTokens?: number
  temperature?: number
}

export interface GeminiResponse {
  text?: string
  stream?: AsyncGenerator<string, void, unknown>
  tokens?: {
    input: number
    output: number
    total: number
  }
  cost?: number
  error?: string
}

class GeminiService {
  private client: GoogleGenerativeAI
  private supabase: any

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.supabase = getSupabase()
  }

  /**
   * Generate text response
   */
  async generateText(
    prompt: string,
    options: GeminiServiceOptions = {}
  ): Promise<GeminiResponse> {
    try {
      const { sessionId, userId, correlationId } = options
      
      // Estimate tokens
      const estimatedTokens = estimateTokens(prompt)
      const modelSelection = selectModelForFeature('text_generation', estimatedTokens, !!sessionId)
      
      // Check demo budget if session ID provided
      if (sessionId) {
        const accessCheck = await checkDemoAccess(sessionId, 'text_generation' as DemoFeature, estimatedTokens)
        if (!accessCheck.allowed) {
          return {
            error: accessCheck.reason || 'Demo limit reached'
          }
        }
      }
      
      // Check user budget if authenticated
      if (userId) {
        const budgetCheck = await enforceBudgetAndLog({
          userId,
          sessionId: sessionId || 'default',
          model: modelSelection.model,
          inputTokens: estimatedTokens,
          outputTokens: options.maxOutputTokens || 1000,
          taskType: 'text_generation',
          endpoint: 'generateText'
        })
        
        if (!budgetCheck.allowed) {
          return {
            error: budgetCheck.reason || 'Budget limit exceeded'
          }
        }
      }
      
      // Create optimized config
      const config = createOptimizedConfig('text_generation', {
        maxOutputTokens: options.maxOutputTokens || 1000,
        temperature: options.temperature || 0.7
      })
      
      // Generate content
      const model = this.client.getGenerativeModel({ model: modelSelection.model })
      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ],
        generationConfig: config
      })
      const text = result.response?.text() || ''
      
      // Record usage if demo session
      if (sessionId) {
        await recordDemoUsage(sessionId, 'text_generation' as DemoFeature, estimatedTokens)
      }
      
      return {
        text,
        tokens: {
          input: estimatedTokens,
          output: estimateTokens(text),
          total: estimatedTokens + estimateTokens(text)
        },
        cost: modelSelection.estimatedCost
      }
    } catch (error) {
      console.error('[GeminiService] generateText error:', error)
      return {
        error: error instanceof Error ? error.message : 'Failed to generate text'
      }
    }
  }

  /**
   * Analyze image with text prompt
   */
  async analyzeImage(
    imageData: string,
    prompt: string,
    options: GeminiServiceOptions = {}
  ): Promise<GeminiResponse> {
    try {
      const { sessionId, userId } = options
      
      // Extract base64 data and mime type
      const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData
      const mimeType = imageData.includes('data:') 
        ? imageData.split(';')[0].split(':')[1] 
        : 'image/jpeg'
      
      // Estimate tokens (rough estimate for images)
      const estimatedTokens = estimateTokens(prompt) + 258 // Base image token cost
      const modelSelection = selectModelForFeature('image_analysis', estimatedTokens, !!sessionId)
      
      // Budget checks
      if (sessionId) {
        const accessCheck = await checkDemoAccess(sessionId, 'image_analysis' as DemoFeature, estimatedTokens)
        if (!accessCheck.allowed) {
          return { error: accessCheck.reason || 'Demo limit reached' }
        }
      }
      
      if (userId) {
        const budgetCheck = await enforceBudgetAndLog({
          userId,
          sessionId: sessionId || 'default',
          model: modelSelection.model,
          inputTokens: estimatedTokens,
          outputTokens: 500,
          taskType: 'image_analysis',
          endpoint: 'analyzeImage'
        })
        
        if (!budgetCheck.allowed) {
          return { error: budgetCheck.reason || 'Budget limit exceeded' }
        }
      }
      
      // Create optimized config
      const config = createOptimizedConfig('analysis', {
        maxOutputTokens: 512,
        temperature: 0.3
      })
      
      // Generate analysis
      const model = this.client.getGenerativeModel({ model: modelSelection.model })
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Data } }
            ]
          }
        ],
        generationConfig: config
      })
      const analysis = result.response?.text() || 'No analysis available'
      
      // Record usage
      if (sessionId) {
        await recordDemoUsage(sessionId, 'image_analysis' as DemoFeature, estimatedTokens)
      }
      
      return {
        text: analysis,
        tokens: {
          input: estimatedTokens,
          output: estimateTokens(analysis),
          total: estimatedTokens + estimateTokens(analysis)
        },
        cost: modelSelection.estimatedCost
      }
    } catch (error) {
      console.error('[GeminiService] analyzeImage error:', error)
      return {
        error: error instanceof Error ? error.message : 'Failed to analyze image'
      }
    }
  }

  /**
   * Analyze document (PDF, text, etc.)
   */
  async analyzeDocument(
    documentData: string,
    mimeType: string,
    fileName: string,
    options: GeminiServiceOptions = {}
  ): Promise<GeminiResponse> {
    try {
      const { sessionId, userId } = options
      
      // Build analysis prompt based on file type
      const analysisPrompt = this.buildDocumentAnalysisPrompt(fileName, mimeType)
      
      // Estimate tokens
      const estimatedTokens = estimateTokens(documentData + analysisPrompt)
      const modelSelection = selectModelForFeature('document_analysis', estimatedTokens, !!sessionId)
      
      // Budget checks
      if (sessionId) {
        const accessCheck = await checkDemoAccess(sessionId, 'document_analysis' as DemoFeature, estimatedTokens)
        if (!accessCheck.allowed) {
          return { error: accessCheck.reason || 'Demo limit reached' }
        }
      }
      
      if (userId) {
        const budgetCheck = await enforceBudgetAndLog({
          userId,
          sessionId: sessionId || 'default',
          model: modelSelection.model,
          inputTokens: estimatedTokens,
          outputTokens: 2000,
          taskType: 'document_analysis',
          endpoint: 'analyzeDocument'
        })
        
        if (!budgetCheck.allowed) {
          return { error: budgetCheck.reason || 'Budget limit exceeded' }
        }
      }
      
      // Create optimized config
      const config = createOptimizedConfig('document_analysis', {
        maxOutputTokens: 2000,
        temperature: 0.3
      })
      
      // Generate analysis
      const model = this.client.getGenerativeModel({ model: modelSelection.model })
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: analysisPrompt },
              { inlineData: { mimeType, data: documentData } }
            ]
          }
        ],
        generationConfig: config
      })
      const analysis = result.response?.text() || 'No analysis available'
      
      // Record usage
      if (sessionId) {
        await recordDemoUsage(sessionId, 'document_analysis' as DemoFeature, estimatedTokens)
      }
      
      return {
        text: analysis,
        tokens: {
          input: estimatedTokens,
          output: estimateTokens(analysis),
          total: estimatedTokens + estimateTokens(analysis)
        },
        cost: modelSelection.estimatedCost
      }
    } catch (error) {
      console.error('[GeminiService] analyzeDocument error:', error)
      return {
        error: error instanceof Error ? error.message : 'Failed to analyze document'
      }
    }
  }

  /**
   * Generate ROI report
   */
  async generateRoiReport(
    data: {
      currentCosts: number
      currentRevenue: number
      growthRate: number
      industry: string
      companySize: string
    },
    options: GeminiServiceOptions = {}
  ): Promise<GeminiResponse> {
    const prompt = `
      Generate a detailed ROI analysis for AI implementation:
      
      Current Annual Costs: $${data.currentCosts}
      Current Annual Revenue: $${data.currentRevenue}
      Growth Rate: ${data.growthRate}%
      Industry: ${data.industry}
      Company Size: ${data.companySize}
      
      Calculate:
      1. Expected cost savings from AI automation
      2. Revenue increase potential
      3. Productivity improvements
      4. 3-year ROI projection
      5. Payback period
      
      Format as a professional business report with specific percentages and dollar amounts.
    `
    
    return this.generateText(prompt, {
      ...options,
      maxOutputTokens: 1500,
      temperature: 0.3
    })
  }

  /**
   * Generate video-to-app specification
   */
  async generateVideoAppSpec(
    transcript: string,
    screenshots: string[],
    options: GeminiServiceOptions = {}
  ): Promise<GeminiResponse> {
    const prompt = `
      Based on this video transcript and screenshots, generate a complete app specification:
      
      Transcript: ${transcript}
      
      Create:
      1. App overview and purpose
      2. Core features list
      3. User interface design requirements
      4. Technical architecture
      5. Data models
      6. API endpoints needed
      7. Implementation timeline
      
      Be specific and technical. Format as a professional software specification document.
    `
    
    // Include screenshots if provided
    if (screenshots.length > 0) {
      // For now, just use the first screenshot
      return this.analyzeImage(screenshots[0], prompt, options)
    }
    
    return this.generateText(prompt, {
      ...options,
      maxOutputTokens: 2500,
      temperature: 0.4
    })
  }

  /**
   * Stream text generation
   */
  async *generateTextStream(
    prompt: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
    options: GeminiServiceOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    try {
      const { sessionId, userId } = options
      
      // Convert conversation history
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
      
      // Estimate tokens
      const estimatedTokens = estimateTokensForMessages([...conversationHistory, { role: 'user', content: prompt }])
      const modelSelection = selectModelForFeature('chat', estimatedTokens, !!sessionId)
      
      // Budget checks
      if (sessionId) {
        const accessCheck = await checkDemoAccess(sessionId, 'chat' as DemoFeature, estimatedTokens)
        if (!accessCheck.allowed) {
          yield `Error: ${accessCheck.reason || 'Demo limit reached'}`
          return
        }
      }
      
      // Create optimized config
      const config = createOptimizedConfig('chat', {
        maxOutputTokens: options.maxOutputTokens || 2048,
        temperature: options.temperature || 0.7
      })
      
      // Generate streaming response
      const model = this.client.getGenerativeModel({ model: modelSelection.model })
      const stream = await model.generateContentStream({
        contents: [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
        ],
        generationConfig: config
      })
      for await (const chunk of stream.stream) {
        const text = chunk.text()
        if (text) yield text
      }
      
      // Record usage
      if (sessionId) {
        await recordDemoUsage(sessionId, 'chat' as DemoFeature, estimatedTokens)
      }
    } catch (error) {
      console.error('[GeminiService] generateTextStream error:', error)
      yield `Error: ${error instanceof Error ? error.message : 'Stream generation failed'}`
    }
  }

  /**
   * Build document analysis prompt based on file type
   */
  private buildDocumentAnalysisPrompt(fileName: string, mimeType: string): string {
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    
    const prompts: Record<string, string> = {
      pdf: `Analyze this PDF document and provide:
        1. Document summary
        2. Key points and insights
        3. Important data or statistics
        4. Recommendations or action items
        5. Any critical information that stands out`,
      
      csv: `Analyze this CSV data and provide:
        1. Data structure overview
        2. Key statistics and patterns
        3. Notable trends or anomalies
        4. Data quality assessment
        5. Potential insights for business decisions`,
      
      txt: `Analyze this text document and provide:
        1. Main topics covered
        2. Key information extracted
        3. Document purpose and context
        4. Important details or findings
        5. Summary of content`,
      
      default: `Analyze this document (${fileName}) and provide:
        1. Content overview
        2. Key information and insights
        3. Important details
        4. Relevant findings
        5. Summary and recommendations`
    }
    
    return prompts[fileExtension || ''] || prompts.default
  }
}

// Export singleton instance
export const geminiService = new GeminiService()