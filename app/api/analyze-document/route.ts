import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: NextRequest) {
  try {
    const { data, mimeType } = await request.json()
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }
    
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    
    const prompt = `Analyze this business document and provide:
1. Executive summary in two sentences
2. Key pain points
3. Opportunities for AI automation
4. Suggested next steps
5. ROI considerations

Format your response as a structured analysis with clear sections.`

    const contents = [
      { role: 'user', parts: [{ text: prompt }] },
      { role: 'user', parts: [{ inlineData: { mimeType: mimeType || 'application/pdf', data } }] },
    ]
    
    const result = await genAI.models.generateContent({ 
      model: 'gemini-1.5-flash', 
      config: { responseMimeType: 'text/plain' }, 
      contents 
    })
    
    const summary = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Document analysis failed'
    
    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Document analysis error:', error)
    return NextResponse.json({ error: error.message || 'Failed to analyze document' }, { status: 500 })
  }
} 