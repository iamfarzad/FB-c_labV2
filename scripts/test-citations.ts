#!/usr/bin/env tsx

/**
 * Test script to demonstrate the citation system
 */

import { GoogleGroundingProvider } from '../lib/intelligence/providers/search/google-grounding'

async function testCitations() {
  console.log('🔍 Testing Citation System\n')

  const groundingProvider = new GoogleGroundingProvider()

  // Test 1: Company search
  console.log('📋 Test 1: Company Search')
  console.log('Searching for: "Talk to EVE company information"\n')
  
  try {
    const companyResult = await groundingProvider.searchCompany('talktoeve.com')
    console.log('✅ Company Search Result:')
    console.log('Text:', companyResult.text.substring(0, 200) + '...')
    console.log('Citations:', companyResult.citations.length)
    companyResult.citations.forEach((citation, index) => {
      console.log(`  ${index + 1}. ${citation.title || citation.uri}`)
      console.log(`     URL: ${citation.uri}`)
    })
  } catch (error) {
    console.error('❌ Company search failed:', error)
  }

  console.log('\n---\n')

  // Test 2: Person search
  console.log('📋 Test 2: Person Search')
  console.log('Searching for: "Farzad Bayat professional information"\n')
  
  try {
    const personResult = await groundingProvider.searchPerson('Farzad Bayat', 'Talk to EVE')
    console.log('✅ Person Search Result:')
    console.log('Text:', personResult.text.substring(0, 200) + '...')
    console.log('Citations:', personResult.citations.length)
    personResult.citations.forEach((citation, index) => {
      console.log(`  ${index + 1}. ${citation.title || citation.uri}`)
      console.log(`     URL: ${citation.uri}`)
    })
  } catch (error) {
    console.error('❌ Person search failed:', error)
  }

  console.log('\n---\n')

  // Test 3: Role search
  console.log('📋 Test 3: Role Search')
  console.log('Searching for: "Farzad Bayat role at Talk to EVE"\n')
  
  try {
    const roleResult = await groundingProvider.searchRole('Farzad Bayat', 'talktoeve.com')
    console.log('✅ Role Search Result:')
    console.log('Text:', roleResult.text.substring(0, 200) + '...')
    console.log('Citations:', roleResult.citations.length)
    roleResult.citations.forEach((citation, index) => {
      console.log(`  ${index + 1}. ${citation.title || citation.uri}`)
      console.log(`     URL: ${citation.uri}`)
    })
  } catch (error) {
    console.error('❌ Role search failed:', error)
  }

  console.log('\n🎉 Citation system test completed!')
}

// Run the test
testCitations()
