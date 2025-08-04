"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, MessageCircle, Wifi, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ErrorHandlerProps {
  error: Error | null
  onRetry?: () => void
  onReset?: () => void
  context?: 'chat' | 'api' | 'network' | 'general'
}

export function ErrorHandler({ error, onRetry, onReset, context = 'general' }: ErrorHandlerProps) {
  const { toast } = useToast()

  if (!error) return null

  const getErrorInfo = (error: Error, context: string) => {
    const message = error.message.toLowerCase()
    
    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
      return {
        icon: Wifi,
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a moment and try again'
        ],
        type: 'network' as const
      }
    }
    
    // API errors
    if (message.includes('500') || message.includes('internal server error')) {
      return {
        icon: AlertTriangle,
        title: 'Server Error',
        description: 'The server encountered an error. Our team has been notified.',
        suggestions: [
          'Try again in a few moments',
          'Contact support if the problem persists',
          'Check our status page for updates'
        ],
        type: 'server' as const
      }
    }
    
    // Rate limiting
    if (message.includes('rate limit') || message.includes('429')) {
      return {
        icon: Clock,
        title: 'Rate Limit Exceeded',
        description: 'Too many requests. Please wait before trying again.',
        suggestions: [
          'Wait a few minutes before retrying',
          'Reduce the frequency of requests',
          'Consider upgrading your plan for higher limits'
        ],
        type: 'rate_limit' as const
      }
    }
    
    // Chat specific errors
    if (context === 'chat') {
      return {
        icon: MessageCircle,
        title: 'Chat Error',
        description: 'There was an issue processing your message.',
        suggestions: [
          'Try sending your message again',
          'Check if your message is too long',
          'Refresh the page if the problem continues'
        ],
        type: 'chat' as const
      }
    }
    
    // Generic error
    return {
      icon: AlertTriangle,
      title: 'Something went wrong',
      description: 'An unexpected error occurred.',
      suggestions: [
        'Try refreshing the page',
        'Clear your browser cache',
        'Contact support if the issue persists'
      ],
      type: 'general' as const
    }
  }

  const errorInfo = getErrorInfo(error, context)
  const Icon = errorInfo.icon

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
    } else {
      window.location.reload()
    }
  }

  const copyErrorDetails = () => {
    const errorDetails = {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
    toast({
      title: 'Error details copied',
      description: 'Error information has been copied to your clipboard',
      variant: 'default'
    })
  }

  return (
    <Card className="mx-auto max-w-md border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Icon className="h-5 w-5" />
          {errorInfo.title}
        </CardTitle>
        <CardDescription>
          {errorInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Suggestions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">What you can try:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-xs mt-1">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="space-y-2">
            <details className="text-xs">
              <summary className="cursor-pointer font-medium">Technical Details</summary>
              <pre className="mt-2 bg-muted p-2 rounded overflow-auto whitespace-pre-wrap">
                {error.message}
                {error.stack && (
                  <>
                    {'\n\nStack trace:'}
                    {error.stack}
                  </>
                )}
              </pre>
            </details>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <Button onClick={handleRetry} className="w-full" variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          {onReset && (
            <Button onClick={handleReset} className="w-full" variant="outline">
              Reset
            </Button>
          )}
          
          <Button 
            onClick={copyErrorDetails} 
            className="w-full" 
            variant="ghost"
            size="sm"
          >
            Copy Error Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for showing error toasts
export function useErrorToast() {
  const { toast } = useToast()
  
  const showError = React.useCallback((error: Error | string, context?: string) => {
    const message = typeof error === 'string' ? error : error.message
    
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    })
  }, [toast])
  
  const showNetworkError = React.useCallback(() => {
    toast({
      title: 'Connection Error',
      description: 'Unable to connect to the server. Please check your internet connection.',
      variant: 'destructive',
    })
  }, [toast])
  
  const showSuccess = React.useCallback((message: string) => {
    toast({
      title: 'Success',
      description: message,
      variant: 'default',
    })
  }, [toast])
  
  return {
    showError,
    showNetworkError,
    showSuccess
  }
}