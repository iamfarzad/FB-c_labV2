"use client"

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Play, Square, AlertTriangle, CheckCircle, Activity } from 'lucide-react'
import { useDemoSession } from '@/components/demo-session-manager'

export function DemoSessionCard() {
  const { sessionId, isActive, startSession, endSession, tokensUsed, requestsUsed } = useDemoSession()

  if (!sessionId || !isActive) {
    return (
      <Card className="p-4 bg-gradient-to-br from-card to-card/80 border border-border/30">
        <div className="text-center space-y-3">
          <div className="text-sm font-medium text-foreground">Start Demo Session</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Explore AI capabilities with usage tracking. Perfect for testing our features.
          </p>
          <Button
            onClick={startSession}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            size="sm"
          >
            <Play className="mr-2 w-3 h-3" />
            Start Demo
          </Button>
        </div>
      </Card>
    )
  }

  const maxTokens = 50000
  const maxRequests = 50
  const tokenProgress = Math.min((tokensUsed / maxTokens) * 100, 100)
  const requestProgress = Math.min((requestsUsed / maxRequests) * 100, 100)
  const isNearLimit = tokenProgress > 80 || requestProgress > 80
  const isComplete = tokenProgress >= 100 || requestProgress >= 100

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-card/80 border border-border/30 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          <span className="text-sm font-medium text-foreground">Active Demo</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={endSession}
          className="h-6 w-6 p-0 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          title="End Demo Session"
        >
          <Square className="w-3 h-3" />
        </Button>
      </div>

      {/* Session ID */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Session</span>
        <Badge variant="outline" className="text-xs font-mono">
          {sessionId.split('_')[1]?.substring(0, 8) || sessionId.substring(0, 8)}
        </Badge>
      </div>

      {/* Usage Progress */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Tokens Used</span>
            <span className="text-xs font-medium">
              {tokensUsed.toLocaleString()} / {maxTokens.toLocaleString()}
            </span>
          </div>
          <Progress value={tokenProgress} className="h-2" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Requests Made</span>
            <span className="text-xs font-medium">
              {requestsUsed} / {maxRequests}
            </span>
          </div>
          <Progress value={requestProgress} className="h-2" />
        </div>
      </div>

      {/* Warnings and Status */}
      {isNearLimit && !isComplete && (
        <Alert className="p-2 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-3 w-3 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">
            Demo limit almost reached. Consider booking a consultation.
          </AlertDescription>
        </Alert>
      )}

      {isComplete && (
        <Alert className="p-2 border-green-200 bg-green-50">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <AlertDescription className="text-xs text-green-800">
            🎉 Demo complete! Ready for consultation.
          </AlertDescription>
        </Alert>
      )}

      {/* CTA Button */}
      {(isNearLimit || isComplete) && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs border-accent/30 hover:bg-accent/5 hover:border-accent/50"
          onClick={() => window.open('/contact', '_blank')}
        >
          Book Consultation
        </Button>
      )}

      {/* Demo Features */}
      <div className="pt-2 border-t border-border/20">
        <div className="text-xs text-muted-foreground mb-2">Demo Features Available:</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="text-muted-foreground">• AI Chat</div>
          <div className="text-muted-foreground">• Voice Input</div>
          <div className="text-muted-foreground">• Image Analysis</div>
          <div className="text-muted-foreground">• Screen Share</div>
        </div>
      </div>
    </Card>
  )
}
