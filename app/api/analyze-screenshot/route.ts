import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { selectModelForFeature, estimateTokens } from '@/lib/model-selector'
import { enforceBudgetAndLog } from '@/lib/token-usage-logger'
import { checkDemoAccess, recordDemoUsage, DemoFeature } from '@/lib/demo-budget-manager'

export async function POST(request: NextRequest) {
  try {
    const { imageData, description, context } = await request.json()
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }
    
    if (!imageData) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 })
    }

    // Get session ID for demo budget tracking
    const sessionId = request.headers.get('x-demo-session-id') || undefined
    const userId = request.headers.get('x-user-id') || undefined

    // Estimate tokens for the analysis
    const estimatedTokens = estimateTokens(description || '') + 2000 // Base tokens for image analysis
    const modelSelection = selectModelForFeature('screenshot_analysis', estimatedTokens, !!sessionId)

    // Check demo budget
    if (sessionId) {
      const accessCheck = await checkDemoAccess(sessionId, 'screenshot_analysis' as DemoFeature, estimatedTokens)
      
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
        'screenshot_analysis',
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
    
    const prompt = `Analyze this screenshot and provide business insights:

${description ? `Description: ${description}` : ''}
${context ? `Context: ${context}` : ''}

Please provide:
1. What you see in the screenshot
2. Potential issues or inefficiencies
3. Opportunities for AI automation or process improvement
4. Specific recommendations for optimization
5. Estimated impact on productivity or cost savings

Focus on identifying business process improvements and automation opportunities.`

    const model = genAI.models.generateContentStream

    let actualInputTokens = 0
    let actualOutputTokens = 0
    let analysisResult = ''

    try {
      const result = await model({
        model: modelSelection.model,
        config: { responseMimeType: 'text/plain' },
        contents: [
          { 
            role: 'user', 
            parts: [
              { text: prompt },
              { 
                inlineData: { 
                  mimeType: 'image/jpeg', 
                  data: imageData 
                } 
              }
            ] 
          }
        ]
      })

      // Collect the full response
      for await (const chunk of result) {
        analysisResult += chunk.text || ''
      }

      // Estimate actual token counts
      actualInputTokens = estimatedTokens
      actualOutputTokens = estimateTokens(analysisResult)
    } catch (error: any) {
      console.error('Screenshot analysis failed:', error)
      return NextResponse.json({ 
        error: 'Screenshot analysis failed', 
        message: error.message || 'Failed to analyze screenshot'
      }, { status: 500 })
    }

    // Record usage
    if (sessionId) {
      await recordDemoUsage(sessionId, 'screenshot_analysis' as DemoFeature, actualInputTokens + actualOutputTokens, 1)
    }

    if (userId) {
      await enforceBudgetAndLog(
        userId,
        sessionId,
        'screenshot_analysis',
        modelSelection.model,
        actualInputTokens,
        actualOutputTokens,
        true,
        undefined,
        { description, context, modelSelection: modelSelection.reason }
      )
    }

    return NextResponse.json({
      analysis: analysisResult,
      modelUsed: modelSelection.model,
      tokensUsed: actualInputTokens + actualOutputTokens,
      estimatedCost: modelSelection.estimatedCost
    })

  } catch (error: any) {
    console.error('Screenshot analysis error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    }, { status: 500 })
  }
} 