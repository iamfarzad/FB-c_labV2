#!/usr/bin/env tsx

/**
 * Test script to verify Phase 2 implementation
 * Tests: TC Card → Session Init → Context Fetch → Personalized Greeting
 */

async function testPhase2() {
  console.info('🧪 Testing Phase 2: TC Card → Intelligence Pipeline\n')

  // Test 1: Consent API
  console.info('📋 Test 1: Consent API')
  try {
    const consentRes = await fetch('http://localhost:3000/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'farzad@talktoeve.com', 
        companyUrl: 'https://talktoeve.com', 
        policyVersion: 'v1' 
      })
    })
    
    if (consentRes.ok) {
      console.info('✅ Consent recorded successfully')
    } else {
      console.info('❌ Consent failed:', await consentRes.text())
    }
  } catch (error) {
    console.error('❌ Consent test failed:', error)
  }

  console.info('\n---\n')

  // Test 2: Session Init API
  console.info('📋 Test 2: Session Init API')
  try {
    const sessionInitRes = await fetch('http://localhost:3000/api/intelligence/session-init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'farzad@talktoeve.com', 
        name: 'Farzad', 
        companyUrl: 'https://talktoeve.com' 
      })
    })
    
    if (sessionInitRes.ok) {
      const sessionData = await sessionInitRes.json()
      console.info('✅ Session init successful:', {
        sessionId: sessionData.sessionId,
        contextReady: sessionData.contextReady,
        hasSnapshot: !!sessionData.snapshot
      })
      
      // Store sessionId for next test
      const sessionId = sessionData.sessionId
      
      // Test 3: Context Fetch
      console.info('\n📋 Test 3: Context Fetch')
      const contextRes = await fetch(`http://localhost:3000/api/intelligence/context?sessionId=${sessionId}`)
      
      if (contextRes.ok) {
        const contextData = await contextRes.json()
        console.info('✅ Context fetched successfully:', {
          hasCompany: !!contextData.company,
          hasPerson: !!contextData.person,
          role: contextData.role,
          roleConfidence: contextData.roleConfidence
        })
        
        // Test 4: Personalized Greeting Generation
        console.info('\n📋 Test 4: Personalized Greeting')
        const greeting = generatePersonalizedGreeting(contextData)
        console.info('✅ Generated greeting:', greeting)
        
      } else {
        console.info('❌ Context fetch failed:', await contextRes.text())
      }
      
    } else {
      console.info('❌ Session init failed:', await sessionInitRes.text())
    }
  } catch (error) {
    console.error('❌ Session init test failed:', error)
  }

  console.info('\n🎉 Phase 2 test completed!')
}

function generatePersonalizedGreeting(context: any): string {
  if (!context) {
    return "Hi! I'm here to help you explore AI capabilities. What would you like to work on today?"
  }

  const { company, person, role, roleConfidence } = context

  // If we have high confidence role and company info, use personalized greeting
  if (roleConfidence && roleConfidence >= 0.7 && company && person) {
    return `Hi ${person.fullName} at ${company.name}! As ${role}, I'm excited to help you explore AI capabilities that can enhance your ${company.industry.toLowerCase()} business. What would you like to work on today?`
  }

  // If we have company info but lower confidence role
  if (company && person) {
    return `Hi ${person.fullName} at ${company.name}! I'm here to help you explore AI capabilities for your ${company.industry.toLowerCase()} business. What would you like to work on today?`
  }

  // Fallback to basic personalized greeting
  if (person) {
    return `Hi ${person.fullName}! I'm here to help you explore AI capabilities. What would you like to work on today?`
  }

  // Default greeting
  return "Hi! I'm here to help you explore AI capabilities. What would you like to work on today?"
}

// Run the test
testPhase2()
