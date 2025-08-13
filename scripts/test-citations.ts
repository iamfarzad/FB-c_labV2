#!/usr/bin/env tsx

/**
 * Test script to demonstrate the citation system
 */

import { GoogleGroundingProvider } from '../lib/intelligence/providers/search/google-grounding'

async function testCitations() {
  console.info('🔍 Testing Citation System\n')

  const groundingProvider = new GoogleGroundingProvider()

  // Test 1: Company search
  console.info('📋 Test 1: Company Search')
  console.info('Searching for: "Talk to EVE company information"\n')
  
  try {
    const companyResult = await groundingProvider.searchCompany('talktoeve.com')
    console.info('✅ Company Search Result:')
    console.info('Text:', companyResult.text.substring(0, 200) + '...')
    console.info('Citations:', companyResult.citations.length)
    companyResult.citations.forEach((citation, index) => {
      console.info(`  ${index + 1}. ${citation.title || citation.uri}`)
      console.info(`     URL: ${citation.uri}`)
    })
  } catch (error) {
    console.error('❌ Company search failed:', error)
  }

  console.info('\n---\n')

  // Test 2: Person search
  console.info('📋 Test 2: Person Search')
  console.info('Searching for: "Farzad Bayat professional information"\n')
  
  try {
    const personResult = await groundingProvider.searchPerson('Farzad Bayat', 'Talk to EVE')
    console.info('✅ Person Search Result:')
    console.info('Text:', personResult.text.substring(0, 200) + '...')
    console.info('Citations:', personResult.citations.length)
    personResult.citations.forEach((citation, index) => {
      console.info(`  ${index + 1}. ${citation.title || citation.uri}`)
      console.info(`     URL: ${citation.uri}`)
    })
  } catch (error) {
    console.error('❌ Person search failed:', error)
  }

  console.info('\n---\n')

  // Test 3: Role search
  console.info('📋 Test 3: Role Search')
  console.info('Searching for: "Farzad Bayat role at Talk to EVE"\n')
  
  try {
    const roleResult = await groundingProvider.searchRole('Farzad Bayat', 'talktoeve.com')
    console.info('✅ Role Search Result:')
    console.info('Text:', roleResult.text.substring(0, 200) + '...')
    console.info('Citations:', roleResult.citations.length)
    roleResult.citations.forEach((citation, index) => {
      console.info(`  ${index + 1}. ${citation.title || citation.uri}`)
      console.info(`     URL: ${citation.uri}`)
    })
  } catch (error) {
    console.error('❌ Role search failed:', error)
  }

  console.info('\n🎉 Citation system test completed!')
}

// Run the test
testCitations()
