import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { selectModelForFeature, estimateTokens } from '@/lib/model-selector'
import { enforceBudgetAndLog } from '@/lib/token-usage-logger'
import { checkDemoAccess, recordDemoUsage, DemoFeature } from '@/lib/demo-budget-manager'

export async function POST(request: NextRequest) {
  try {
    const { data, mimeType, fileName } = await request.json()
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }
    
    if (!data) {
      return NextResponse.json({ error: 'No document data provided' }, { status: 400 })
    }

    // Get session ID for demo budget tracking
    const sessionId = request.headers.get('x-demo-session-id') || undefined
    const userId = request.headers.get('x-user-id') || undefined

    // Estimate tokens for the document content
    const estimatedTokens = estimateTokens(data)
    const modelSelection = selectModelForFeature('document_analysis', estimatedTokens, !!sessionId)

    // Check demo budget
    if (sessionId) {
      const accessCheck = await checkDemoAccess(sessionId, 'document_analysis' as DemoFeature, estimatedTokens)
      
      if (!accessCheck.allowed) {
        return NextResponse.json({
          error: 'Demo limit reached',
          message: accessCheck.reason,
          remainingTokens: accessCheck.remainingTokens,
          remainingRequests: accessCheck.remainingRequests
        }, { status: 429 })
      }
    }

    // Check user budget if authenticated
    if (userId) {
      const budgetCheck = await enforceBudgetAndLog(
        userId,
        sessionId,
        'document_analysis',
        modelSelection.model,
        estimatedTokens,
        estimatedTokens * 0.5, // Estimate output tokens
        true
      )

      if (!budgetCheck.allowed) {
        return NextResponse.json({
          error: 'Budget limit reached',
          message: budgetCheck.reason,
          suggestedModel: budgetCheck.suggestedModel
        }, { status: 429 })
      }
    }
    
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    
    // Customize prompt based on file type
    let prompt = `Analyze this business document and provide:
1. Executive summary in two sentences
2. Key pain points or challenges identified
3. Opportunities for AI automation or process improvement
4. Suggested next steps for implementation
5. Estimated ROI potential

Document: ${fileName}
Content: ${data}

Please provide a structured analysis with clear sections.`

    // Add file type specific instructions
    if (mimeType.includes('pdf')) {
      prompt += '\n\nNote: This appears to be a PDF document. Focus on extracting key business insights and actionable recommendations.'
    } else if (mimeType.includes('text')) {
      prompt += '\n\nNote: This is a text document. Provide detailed analysis of the content and business implications.'
    } else if (mimeType.includes('image')) {
      prompt += '\n\nNote: This appears to be an image document. Analyze any visible text and provide insights based on the visual content.'
    }

    let actualInputTokens = 0
    let actualOutputTokens = 0
    let analysisResult = ''

    try {
      const config = {
        responseMimeType: "text/plain",
      }

      const result = await genAI.models.generateContent({
        model: modelSelection.model,
        config,
        contents: [{ 
          role: 'user', 
          parts: [{ text: prompt }] 
        }]
      })

      analysisResult = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available'

      // Estimate actual token counts
      actualInputTokens = estimatedTokens
      actualOutputTokens = estimateTokens(analysisResult)
    } catch (error: any) {
      console.error('Document analysis failed:', error)
      return NextResponse.json({ 
        error: 'Document analysis failed', 
        message: error.message || 'Failed to analyze document'
      }, { status: 500 })
    }

    // Record usage
    if (sessionId) {
      await recordDemoUsage(sessionId, 'document_analysis' as DemoFeature, actualInputTokens + actualOutputTokens, 1)
    }

    if (userId) {
      await enforceBudgetAndLog(
        userId,
        sessionId,
        'document_analysis',
        modelSelection.model,
        actualInputTokens,
        actualOutputTokens,
        true,
        undefined,
        { fileName, mimeType, modelSelection: modelSelection.reason }
      )
    }

    return NextResponse.json({
      analysis: analysisResult,
      fileName,
      modelUsed: modelSelection.model,
      tokensUsed: actualInputTokens + actualOutputTokens,
      estimatedCost: modelSelection.estimatedCost
    })

  } catch (error: any) {
    console.error('Document analysis error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    }, { status: 500 })
  }
}
