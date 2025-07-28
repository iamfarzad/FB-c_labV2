"use client"

import { Component, ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Admin Error Boundary caught an error:", error, errorInfo)
    this.setState({ error, errorInfo })
    
    // Log error to monitoring service (in production)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error monitoring service
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return <AdminErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false })} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  onRetry: () => void
}

function AdminErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const router = useRouter()

  const handleRetry = () => {
    onRetry()
  }

  const handleGoHome = () => {
    router.push('/admin')
  }

  const handleGoToLogin = () => {
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            An error occurred while loading the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <strong>Error:</strong> {error.message}
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button variant="ghost" onClick={handleGoToLogin} className="w-full">
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for functional components
export function useAdminErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Admin Error [${context || 'Unknown'}]:`, error)
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      })
    }
  }

  const handleAsyncError = (promise: Promise<any>, context?: string) => {
    return promise.catch((error) => {
      handleError(error, context)
      throw error
    })
  }

  return { handleError, handleAsyncError }
}
