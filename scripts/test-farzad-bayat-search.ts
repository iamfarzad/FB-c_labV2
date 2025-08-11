#!/usr/bin/env tsx

/**
 * Specific test to find Farzad Bayat's correct LinkedIn profile
 */

import { GoogleGenAI } from '@google/genai'

async function testFarzadBayatSearch() {
  console.log('🔍 Testing specific search for Farzad Bayat\n')

  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

  const searchQueries = [
    'farzad@talktoeve.com LinkedIn profile',
    'Farzad Bayat talktoeve.com LinkedIn',
    'Farzad Bayat Talk to Eve LinkedIn',
    'farzad bayat linkedin talktoeve.com',
    'Farzad Bayat Oslo Norway LinkedIn'
  ]

  for (const query of searchQueries) {
    console.log(`📋 Testing query: "${query}"`)
    
    try {
      const prompt = `
You are a professional research assistant. Search for this specific person and their LinkedIn profile.

Search query: "${query}"

IMPORTANT: We are looking for Farzad Bayat who works at Talk to Eve and uses the email farzad@talktoeve.com.

Look specifically for:
1. LinkedIn profile URL (linkedin.com/in/...)
2. Full name (should be Farzad Bayat)
3. Professional role and title
4. Company association (should be Talk to Eve)
5. Location (should be Oslo, Norway)

Return ONLY a JSON object:
{
  "found": true/false,
  "fullName": "Full name if found",
  "profileUrl": "LinkedIn URL if found",
  "role": "Professional role if found",
  "company": "Company name if found",
  "location": "Location if found",
  "matchesEmail": true/false
}

If no profile is found or it's not the right person, return:
{
  "found": false,
  "fullName": null,
  "profileUrl": null,
  "role": null,
  "company": null,
  "location": null,
  "matchesEmail": false
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
        
        // Check if this is the right person
        if (searchResult.fullName === 'Farzad Bayat' || searchResult.profileUrl?.includes('farzad-bayat')) {
          console.log('🎯 FOUND THE RIGHT PERSON!')
        }
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
testFarzadBayatSearch()
