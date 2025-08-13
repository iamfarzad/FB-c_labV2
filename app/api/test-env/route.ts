import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const geminiApiKey = process.env.GEMINI_API_KEY
  const googleApiKey = process.env.GOOGLE_API_KEY
  
  let apiTest = 'NOT_TESTED'
  let apiError = null
  
  if (geminiApiKey || googleApiKey) {
    try {
      // Dynamic import to avoid build issues
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(geminiApiKey || googleApiKey || '')
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
      const result = await model.generateContent("Hello, this is a test.")
      const response = await result.response
      const text = response.text()
      
      apiTest = text ? 'SUCCESS' : 'NO_RESPONSE'
    } catch (error) {
      apiTest = 'ERROR'
      apiError = error instanceof Error ? error.message : 'Unknown error'
    }
  } else {
    apiTest = 'NO_API_KEY'
  }

  return NextResponse.json({
    adminPassword: process.env.ADMIN_PASSWORD || 'NOT_SET',
    jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT_SET',
    nodeEnv: process.env.NODE_ENV,
    geminiApiKey: geminiApiKey ? 'SET' : 'NOT_SET',
    googleApiKey: googleApiKey ? 'SET' : 'NOT_SET',
    apiTest,
    apiError,
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('ADMIN') || 
      key.includes('JWT') || 
      key.includes('GOOGLE') || 
      key.includes('GEMINI')
    )
  })
}
