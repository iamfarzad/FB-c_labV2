"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/**
 * Props for the ErrorBoundary component
 */
interface Props {
  /** The child components to be wrapped by the error boundary */
  children: ReactNode
  /**
   * Optional custom fallback UI to display when an error occurs
   * If not provided, a default error UI will be shown
   */
  fallback?: ReactNode
}

/**
 * Internal state for the ErrorBoundary component
 */
interface State {
  /** Whether an error has been caught */
  hasError: boolean
  /** The error that was caught, if any */
  error?: Error
  /** The error info that was caught, if any */
  errorInfo?: ErrorInfo
}

/**
 * A reusable error boundary component that catches JavaScript errors in its child component tree.
 *
 * @component
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorComponent />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  /** Display name for debugging purposes */
  static displayName = "ErrorBoundary"

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-red-600">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">The chat interface encountered an error. Please try refreshing the page.</p>

            {this.state.error && (
              <details className="bg-gray-100 p-4 rounded">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
              <Button
                variant="outline"
                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
