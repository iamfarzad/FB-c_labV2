"use client"

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { RefreshCw, Info, Play } from 'lucide-react'
import { useDemoSession } from '@/components/demo-session-manager'
import { cn } from '@/lib/utils'

interface DemoSessionCardProps {
  isTablet?: boolean
}

export function DemoSessionCard({ isTablet = false }: DemoSessionCardProps) {
  const { sessionId, sessionStatus, isLoading, refreshStatus, remainingTokens, remainingRequests, createSession } = useDemoSession()

  if (!sessionId) {
    return (
      <div className={cn(
        "p-3 border-t border-border/20 bg-muted/10",
        isTablet && "p-2"
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Info className={cn("text-muted-foreground", isTablet ? "w-3 h-3" : "w-4 h-4")} />
          <span className={cn("text-xs font-medium", isTablet ? "text-xs" : "text-sm")}>
            Demo Session
          </span>
        </div>
        <p className={cn("text-xs text-muted-foreground mb-3", isTablet && "text-xs")}>
          Start exploring AI capabilities
        </p>
        <Button
          onClick={createSession}
          size="sm"
          className={cn(
            "w-full btn-primary",
            isTablet ? "h-6 text-xs" : "h-7 text-xs"
          )}
        >
          <Play className={cn("mr-1", isTablet ? "w-2 h-2" : "w-3 h-3")} />
          Start Demo
        </Button>
      </div>
    )
  }

  const totalTokens = 50000
  const totalRequests = 50
  const tokenProgress = ((totalTokens - remainingTokens) / totalTokens) * 100
  const requestProgress = ((totalRequests - remainingRequests) / totalRequests) * 100

  return (
    <div className={cn(
      "p-3 border-t border-border/20 bg-muted/10",
      isTablet && "p-2"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Info className={cn("text-muted-foreground", isTablet ? "w-3 h-3" : "w-4 h-4")} />
          <span className={cn("text-xs font-medium", isTablet ? "text-xs" : "text-sm")}>
            Demo Session
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshStatus}
          disabled={isLoading}
          className={cn(
            "h-5 w-5 p-0",
            isTablet && "h-4 w-4"
          )}
        >
          <RefreshCw className={cn(
            "text-muted-foreground",
            isLoading && "animate-spin",
            isTablet ? "w-2 h-2" : "w-3 h-3"
          )} />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={cn("text-xs text-muted-foreground", isTablet && "text-xs")}>
            Tokens
          </span>
          <Badge variant="secondary" className={cn("text-xs", isTablet && "text-xs px-1")}>
            {remainingTokens.toLocaleString()}
          </Badge>
        </div>
        <Progress value={tokenProgress} className={cn("h-1", isTablet && "h-1")} />
        
        <div className="flex justify-between items-center">
          <span className={cn("text-xs text-muted-foreground", isTablet && "text-xs")}>
            Requests
          </span>
          <Badge variant="secondary" className={cn("text-xs", isTablet && "text-xs px-1")}>
            {remainingRequests}
          </Badge>
        </div>
        <Progress value={requestProgress} className={cn("h-1", isTablet && "h-1")} />
      </div>

      {sessionStatus?.isComplete && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
          🎉 Demo complete! Ready for consultation.
        </div>
      )}
    </div>
  )
}
