#!/usr/bin/env node

/**
 * Lead Capture Test Script
 * 
 * Tests the lead capture flow to ensure it's working properly
 */

const API_BASE = 'http://localhost:3000'

async function testLeadCapture(): Promise<void> {
  console.log('🧪 Testing Lead Capture Flow...\n')

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

    console.log('📤 Sending test lead data...')
    const response = await fetch(`${API_BASE}/api/lead-capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })

    const responseText = await response.text()
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText)
        console.log('✅ Lead capture successful!')
        console.log('Response:', result)
      } catch (e) {
        console.log('✅ Lead capture responded OK but with non-JSON response')
        console.log('Response:', responseText)
      }
    } else {
      console.log('❌ Lead capture failed')
      console.log('Status:', response.status, response.statusText)
      console.log('Response:', responseText)
    }

    // Test API endpoints
    console.log('\n📡 Testing related API endpoints...')
    
    const endpoints = [
      '/api/lead-research',
      '/api/admin/leads',
      '/api/admin/stats'
    ]

    for (const endpoint of endpoints) {
      try {
        const testResponse = await fetch(`${API_BASE}${endpoint}`)
        console.log(`${endpoint}: ${testResponse.status} ${testResponse.statusText}`)
      } catch (error) {
        console.log(`${endpoint}: Connection error`)
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testLeadCapture().catch(console.error)
