"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

interface SystemStatus {
  leadCapture: "healthy" | "warning" | "error"
  aiIntegration: "healthy" | "warning" | "error"
  database: "healthy" | "warning" | "error"
  voiceFeatures: "healthy" | "warning" | "error"
}

export function TestStatusIndicator() {
  const [status, setStatus] = useState<SystemStatus>({
    leadCapture: "healthy",
    aiIntegration: "healthy",
    database: "healthy",
    voiceFeatures: "healthy",
  })
  const [isChecking, setIsChecking] = useState(false)

  const checkSystemHealth = async () => {
    setIsChecking(true)

    // Simulate health checks
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setStatus({
      leadCapture: "healthy",
      aiIntegration: "healthy",
      database: "healthy",
      voiceFeatures: "warning", // Browser compatibility varies
    })

    setIsChecking(false)
  }

  const getStatusIcon = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: "healthy" | "warning" | "error") => {
    const variants = {
      healthy: "default",
      warning: "secondary",
      error: "destructive",
    } as const

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  useEffect(() => {
    checkSystemHealth()
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">System Status</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={checkSystemHealth}
            disabled={isChecking}
            className="gap-2 bg-transparent"
          >
            {isChecking ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Check
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.leadCapture)}
              <span className="text-sm">Lead Capture Flow</span>
            </div>
            {getStatusBadge(status.leadCapture)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.aiIntegration)}
              <span className="text-sm">AI Integration</span>
            </div>
            {getStatusBadge(status.aiIntegration)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.database)}
              <span className="text-sm">Database Connection</span>
            </div>
            {getStatusBadge(status.database)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.voiceFeatures)}
              <span className="text-sm">Voice Features</span>
            </div>
            {getStatusBadge(status.voiceFeatures)}
          </div>
        </div>

        {status.voiceFeatures === "warning" && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
            Voice features may not work in all browsers. Chrome/Edge recommended.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
