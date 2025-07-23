"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ClientErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Client Error Boundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorInfo
    })
    
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent 
            error={this.state.error} 
            resetError={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
          />
        )
      }

      return (
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Something went wrong
            </CardTitle>
            <CardDescription>
              There was an error loading this component. This might be a temporary issue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="space-y-2">
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  <strong>Error:</strong> {this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            <Button 
              onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Reload Page
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
} 