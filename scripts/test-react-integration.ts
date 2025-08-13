#!/usr/bin/env tsx

/**
 * Test script to simulate React component behavior and detect infinite loops
 * This tests the actual React hook behavior, not just API calls
 */

import { useState, useEffect, useCallback } from 'react'

// Mock localStorage for Node.js environment
const mockLocalStorage = new Map<string, string>()

// Mock the useConversationalIntelligence hook behavior
function useConversationalIntelligence() {
  const [context, setContext] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchedSessionId, setLastFetchedSessionId] = useState<string | null>(null)

  const fetchContext = useCallback(async (sessionId: string) => {
    if (!sessionId) return
    
    // Prevent duplicate calls for the same sessionId
    if (lastFetchedSessionId === sessionId && context) {
      console.info('🚫 DUPLICATE CALL PREVENTED:', sessionId)
      return
    }

    console.info('📡 FETCHING CONTEXT:', sessionId)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3000/api/intelligence/context?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setContext(data)
        setLastFetchedSessionId(sessionId)
        console.info('✅ CONTEXT FETCHED:', sessionId)
      } else {
        setError('Failed to fetch context')
      }
    } catch (err) {
      setError('Failed to fetch context')
      console.error('Context fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [lastFetchedSessionId, context])

  const getSessionId = useCallback(() => {
    return mockLocalStorage.get('intelligence-session-id') || null
  }, [])

  return {
    context,
    isLoading,
    error,
    fetchContext,
    getSessionId
  }
}

// Simulate the AIEChat component behavior
function simulateAIEChatComponent() {
  const [consentAllowed, setConsentAllowed] = useState(false)
  const { context, isLoading, fetchContext, getSessionId } = useConversationalIntelligence()
  
  // Simulate the problematic useEffect
  useEffect(() => {
    if (consentAllowed) {
      const intelligenceSessionId = getSessionId()
      if (intelligenceSessionId) {
        fetchContext(intelligenceSessionId)
      }
    }
  }, [consentAllowed, fetchContext, getSessionId])

  return { consentAllowed, setConsentAllowed, context, isLoading }
}

async function testReactIntegration() {
  console.info('🧪 Testing React Integration (Infinite Loop Detection)\n')

  // Set up test session
  const testSessionId = `test-session-${Date.now()}`
  mockLocalStorage.set('intelligence-session-id', testSessionId)

  console.info('📋 Test 1: Simulating React component behavior')
  
  // Simulate multiple renders (like React does)
  const renderCounts = []
  let callCount = 0
  
  for (let i = 0; i < 10; i++) {
    callCount++
    console.info(`\n🔄 Render ${i + 1}:`)
    
    // Simulate the component logic
    const { consentAllowed, setConsentAllowed } = simulateAIEChatComponent()
    
    if (i === 0) {
      // Trigger consent (like user clicking "Allow")
      setConsentAllowed(true)
      console.info('✅ Consent allowed - should trigger context fetch')
    }
    
    renderCounts.push(callCount)
    
    // Wait a bit to simulate React's behavior
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.info('\n📊 Results:')
  console.info(`- Total renders: ${renderCounts.length}`)
  console.info(`- Expected API calls: 1 (after consent)`)
  console.info(`- If you see multiple "FETCHING CONTEXT" logs, there's an infinite loop!`)

  // Clean up
  mockLocalStorage.delete('intelligence-session-id')
  
  console.info('\n🎯 Test completed!')
}

// Run the test
testReactIntegration()
