#!/usr/bin/env tsx

/**
 * Test script to specifically search for Farzad's LinkedIn profile
 */

import { GoogleGenAI } from '@google/genai'

async function testSpecificSearch() {
  console.log('🔍 Testing specific LinkedIn search for Farzad\n')

  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

  const searchQueries = [
    'Farzad Talk To Eve LinkedIn founder CEO',
    'Farzad talktoeve.com LinkedIn profile',
    'Farzad founder CEO Talk To Eve conversational AI',
    'Farzad @talktoeve.com LinkedIn'
  ]

  for (const query of searchQueries) {
    console.log(`📋 Testing query: "${query}"`)
    
    try {
      const prompt = `
You are a professional research assistant. Search for this specific person and their LinkedIn profile.

Search query: "${query}"

Look specifically for:
1. LinkedIn profile URL (linkedin.com/in/...)
2. Professional role and title
3. Company association

Return ONLY a JSON object:
{
  "found": true/false,
  "profileUrl": "LinkedIn URL if found",
  "role": "Professional role if found",
  "company": "Company name if found"
}

If no profile is found, return:
{
  "found": false,
  "profileUrl": null,
  "role": null,
  "company": null
}
`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const searchResult = JSON.parse(jsonMatch[0])
        console.log('✅ Result:', searchResult)
      } else {
        console.log('❌ No JSON found in response')
      }
      
    } catch (error) {
      console.error('❌ Search failed:', error)
    }
    
    console.log('---\n')
  }
}

// Run the test
testSpecificSearch()
