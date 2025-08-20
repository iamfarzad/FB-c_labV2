import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: NextRequest) {
  try {
    const { prompt, context } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const systemPrompt = `You are a task generation assistant. Based on the user's request, create a structured task list with specific actionable items.

Context: ${context || 'No additional context provided'}

User Request: ${prompt}

Generate a JSON response with this structure:
{
  "title": "Task List Title",
  "items": [
    {
      "label": "Task description",
      "files": ["relevant-file.pdf", "template.docx"]
    }
  ]
}

Keep tasks specific, actionable, and include relevant file attachments when appropriate.`

    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    const text = response.text()
    
    // Try to parse JSON from the response
    let taskData
    try {
      // Extract JSON from the response (it might be wrapped in markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        taskData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // Fallback: create a simple task structure
      taskData = {
        title: "Generated Tasks",
        items: [
          { label: "Review the request and create action items", files: [] },
          { label: "Research relevant information", files: [] },
          { label: "Prepare deliverables", files: [] }
        ]
      }
    }

    return NextResponse.json({
      success: true,
      output: taskData,
      calculatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Task generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 }
    )
  }
}
