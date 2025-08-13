#!/usr/bin/env node

/**
 * Lead Capture Test Script
 * 
 * Tests the lead capture flow to ensure it's working properly
 */

const API_BASE = 'http://localhost:3000'

async function testLeadCapture(): Promise<void> {
  console.info('🧪 Testing Lead Capture Flow...\n')

  try {
    const testData = {
      name: "Test User",
      email: "test@example.com",
      company: "Test Company",
      engagementType: "chat",
      initialQuery: "Testing the lead capture system",
      tcAcceptance: {
        accepted: true,
        timestamp: Date.now(),
        userAgent: "Test Script"
      }
    }

    console.info('📤 Sending test lead data...')
    const response = await fetch(`${API_BASE}/api/lead-capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })

    const responseText = await response.text()
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText)
        console.info('✅ Lead capture successful!')
        console.info('Response:', result)
      } catch (e) {
        console.info('✅ Lead capture responded OK but with non-JSON response')
        console.info('Response:', responseText)
      }
    } else {
      console.info('❌ Lead capture failed')
      console.info('Status:', response.status, response.statusText)
      console.info('Response:', responseText)
    }

    // Test API endpoints
    console.info('\n📡 Testing related API endpoints...')
    
    const endpoints = [
      '/api/intelligence/lead-research',
      '/api/admin/leads',
      '/api/admin/stats'
    ]

    for (const endpoint of endpoints) {
      try {
        const testResponse = await fetch(`${API_BASE}${endpoint}`)
        console.info(`${endpoint}: ${testResponse.status} ${testResponse.statusText}`)
      } catch (error) {
        console.info(`${endpoint}: Connection error`)
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testLeadCapture().catch(console.error)
