"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Simple demo session context - no complex budget management
interface DemoSessionContextType {
  sessionId: string | null
  isActive: boolean
  startSession: () => void
  endSession: () => void
  tokensUsed: number
  requestsUsed: number
  incrementUsage: (tokens: number, requests?: number) => void
}

const DemoSessionContext = createContext<DemoSessionContextType | undefined>(undefined)

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [tokensUsed, setTokensUsed] = useState(0)
  const [requestsUsed, setRequestsUsed] = useState(0)

  const startSession = () => {
    const newSessionId = `demo_${Date.now()}`
    setSessionId(newSessionId)
    setIsActive(true)
    setTokensUsed(0)
    setRequestsUsed(0)
  }

  const endSession = () => {
    setSessionId(null)
    setIsActive(false)
    setTokensUsed(0)
    setRequestsUsed(0)
  }

  const incrementUsage = (tokens: number, requests: number = 1) => {
    setTokensUsed(prev => prev + tokens)
    setRequestsUsed(prev => prev + requests)
  }

  return (
    <DemoSessionContext.Provider
      value={{
        sessionId,
        isActive,
        startSession,
        endSession,
        tokensUsed,
        requestsUsed,
        incrementUsage,
      }}
    >
      {children}
    </DemoSessionContext.Provider>
  )
}

export function useDemoSession() {
  const context = useContext(DemoSessionContext)
  if (context === undefined) {
    throw new Error("useDemoSession must be used within a DemoSessionProvider")
  }
  return context
}
