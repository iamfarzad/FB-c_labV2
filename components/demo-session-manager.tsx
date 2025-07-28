"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Info } from "lucide-react"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"

interface DemoSessionContextType {
  sessionId: string | null
  sessionStatus: any
  isLoading: boolean
  createSession: () => void
  refreshStatus: () => Promise<void>
  refreshStatusWithId: (sessionId: string) => Promise<void>
  clearSession: () => void
  remainingTokens: number
  remainingRequests: number
  featureUsage: Record<
    string,
    { tokensUsed: number; requestsMade: number; remainingTokens: number; remainingRequests: number }
  >
}

const DemoSessionContext = createContext<DemoSessionContextType | undefined>(undefined)

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStatus, setSessionStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [remainingTokens, setRemainingTokens] = useState(50000)
  const [remainingRequests, setRemainingRequests] = useState(50)
  const [featureUsage, setFeatureUsage] = useState<Record<string, any>>({})

  const createSession = () => {
    const newSessionId = Math.random().toString(36).substring(2, 18)
    setSessionId(newSessionId)

    // Store in sessionStorage for proper session isolation
    try {
      sessionStorage.setItem("demo-session-id", newSessionId)
    } catch (error) {
      console.error("Failed to store session ID:", error)
    }

    // Call refreshStatus with the new sessionId directly
    refreshStatusWithId(newSessionId)
  }

  const refreshStatusWithId = async (sessionIdToUse: string) => {
    if (!sessionIdToUse) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/demo-status?sessionId=${sessionIdToUse}`)

      if (response.ok) {
        const data = await response.json()
        setSessionStatus(data)

        // Update remaining tokens and requests
        setRemainingTokens(data.remainingTokens || 50000)
        setRemainingRequests(data.remainingRequests || 50)

        // Update feature usage
        if (data.featureUsage) {
          const usage: Record<
            string,
            { tokensUsed: number; requestsMade: number; remainingTokens: number; remainingRequests: number }
          > = {}
          Object.keys(data.featureUsage).forEach((feature) => {
            const featureData = data.featureUsage[feature]
            const featureLimits = getFeatureLimits(feature)
            usage[feature] = {
              tokensUsed: featureData.tokensUsed || 0,
              requestsMade: featureData.requestsMade || 0,
              remainingTokens: Math.max(0, featureLimits.tokens - (featureData.tokensUsed || 0)),
              remainingRequests: Math.max(0, featureLimits.requests - (featureData.requestsMade || 0)),
            }
          })
          setFeatureUsage(usage)
        }
      }
    } catch (error) {
      console.error("Failed to refresh session status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStatus = async () => {
    if (!sessionId) return
    await refreshStatusWithId(sessionId)
  }

  const clearSession = () => {
    setSessionId(null)
    setSessionStatus(null)
    setRemainingTokens(50000)
    setRemainingRequests(50)
    setFeatureUsage({})

    // Clear sessionStorage
    try {
      sessionStorage.removeItem("demo-session-id")
    } catch (error) {
      console.error("Failed to clear session ID:", error)
    }
  }

  const getFeatureLimits = (feature: string) => {
    const limits = {
      chat: { tokens: 10000, requests: 10 },
      voice_tts: { tokens: 5000, requests: 5 },
      webcam_analysis: { tokens: 5000, requests: 3 },
      screenshot_analysis: { tokens: 5000, requests: 3 },
      document_analysis: { tokens: 10000, requests: 2 },
      video_to_app: { tokens: 15000, requests: 1 },
      lead_research: { tokens: 10000, requests: 2 },
    }
    return limits[feature as keyof typeof limits] || { tokens: 5000, requests: 5 }
  }

  // Load session on mount
  useEffect(() => {
    try {
      const storedSessionId = sessionStorage.getItem("demo-session-id")
      if (storedSessionId) {
        setSessionId(storedSessionId)
        refreshStatusWithId(storedSessionId)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Failed to load session:", error)
      setIsLoading(false)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        sessionStorage.removeItem("demo-session-id")
      } catch (error) {
        console.error("Failed to cleanup session:", error)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  return (
    <DemoSessionContext.Provider
      value={{
        sessionId,
        sessionStatus,
        isLoading,
        createSession,
        refreshStatus,
        refreshStatusWithId,
        clearSession,
        remainingTokens,
        remainingRequests,
        featureUsage,
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

export function DemoSessionStatus() {
  const { sessionId, sessionStatus, isLoading, refreshStatus, remainingTokens, remainingRequests, featureUsage } =
    useDemoSession()
  const { addMessage } = useChatContext()

  if (!sessionId) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Demo Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Start a demo session to explore our AI capabilities with usage limits.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalTokens = 50000
  const totalRequests = 50
  const tokenProgress = ((totalTokens - remainingTokens) / totalTokens) * 100
  const requestProgress = ((totalRequests - remainingRequests) / totalRequests) * 100

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Demo Session
          </span>
          <Button variant="ghost" size="sm" onClick={refreshStatus} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Session ID</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {sessionId.substring(0, 8)}...
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Tokens</span>
              <span>
                {remainingTokens.toLocaleString()} / {totalTokens.toLocaleString()}
              </span>
            </div>
            <Progress value={tokenProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Requests</span>
              <span>
                {remainingRequests} / {totalRequests}
              </span>
            </div>
            <Progress value={requestProgress} className="h-2" />
          </div>
        </div>

        {Object.keys(featureUsage).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Feature Usage</h4>
            <div className="space-y-1">
              {Object.entries(featureUsage).map(([feature, usage]) => (
                <div key={feature} className="flex justify-between text-xs">
                  <span className="capitalize">{feature.replace("_", " ")}</span>
                  <span className="text-muted-foreground">
                    {usage.remainingTokens.toLocaleString()} tokens, {usage.remainingRequests} requests
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sessionStatus?.isComplete && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">🎉 Demo complete! You've explored all our AI capabilities.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
