'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getDemoSession, getDemoStatus, DemoFeature } from '@/lib/demo-budget-manager'

interface DemoSessionContextType {
  sessionId: string | null
  sessionStatus: any
  isLoading: boolean
  createSession: () => void
  refreshStatus: () => void
}

const DemoSessionContext = createContext<DemoSessionContextType | undefined>(undefined)

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStatus, setSessionStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const createSession = () => {
    const newSessionId = Math.random().toString(36).substring(2, 18)
    setSessionId(newSessionId)
    
    // Store in localStorage
    localStorage.setItem('demo-session-id', newSessionId)
    
    // Set cookie
    document.cookie = `demo-session-id=${newSessionId}; path=/; max-age=${24 * 60 * 60}` // 24 hours
  }

  const refreshStatus = async () => {
    if (!sessionId) return
    
    try {
      const status = await getDemoStatus(sessionId)
      setSessionStatus(status)
    } catch (error) {
      console.error('Failed to get demo status:', error)
    }
  }

  useEffect(() => {
    // Try to get existing session from localStorage or cookies
    const existingSessionId = localStorage.getItem('demo-session-id') || 
                             document.cookie.split('; ').find(row => row.startsWith('demo-session-id='))?.split('=')[1]
    
    if (existingSessionId) {
      setSessionId(existingSessionId)
    } else {
      createSession()
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (sessionId) {
      refreshStatus()
    }
  }, [sessionId])

  return (
    <DemoSessionContext.Provider value={{
      sessionId,
      sessionStatus,
      isLoading,
      createSession,
      refreshStatus
    }}>
      {children}
    </DemoSessionContext.Provider>
  )
}

export function useDemoSession() {
  const context = useContext(DemoSessionContext)
  if (context === undefined) {
    throw new Error('useDemoSession must be used within a DemoSessionProvider')
  }
  return context
}

export function DemoStatusIndicator() {
  const { sessionStatus, isLoading } = useDemoSession()

  if (isLoading || !sessionStatus) {
    return null
  }

  const { overallProgress, isComplete, featureStatus } = sessionStatus

  if (isComplete) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🎉</span>
          <div>
            <div className="font-semibold">Demo Complete!</div>
            <div className="text-sm opacity-90">Ready to schedule a consultation?</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4">
          <div className="w-full h-full border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div>
          <div className="font-semibold">Demo Progress</div>
          <div className="text-sm opacity-90">{overallProgress}% complete</div>
        </div>
      </div>
    </div>
  )
}

export function DemoBudgetWarning({ feature, estimatedTokens }: { feature: DemoFeature, estimatedTokens: number }) {
  const { sessionStatus } = useDemoSession()

  if (!sessionStatus) return null

  const featureStatus = sessionStatus.featureStatus[feature]
  if (!featureStatus) return null

  const { remainingTokens, isComplete } = featureStatus

  if (isComplete) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <div className="flex items-center">
          <span className="text-yellow-500 mr-2">⚠️</span>
          <div>
            <div className="font-semibold">Feature Limit Reached</div>
            <div className="text-sm">You've reached the limit for this demo feature. Try another feature or schedule a consultation.</div>
          </div>
        </div>
      </div>
    )
  }

  if (estimatedTokens > remainingTokens) {
    return (
      <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4">
        <div className="flex items-center">
          <span className="text-orange-500 mr-2">⚠️</span>
          <div>
            <div className="font-semibold">Large Request</div>
            <div className="text-sm">This request may exceed your remaining budget ({remainingTokens} tokens left).</div>
          </div>
        </div>
      </div>
    )
  }

  return null
} 