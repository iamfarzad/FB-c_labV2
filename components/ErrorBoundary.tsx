'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home, MessageSquare } from 'lucide-react'
import Link from 'next/link'

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
  /**
   * Optional custom error handler function
   * If provided, it will be called when an error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /**
   * Optional array of keys or values to reset the error boundary
   * If provided, the error boundary will reset when any of these keys or values change
   */
  resetKeys?: Array<string | number>
  /**
   * Optional boolean to reset the error boundary when the component props change
   * If true, the error boundary will reset when any of the component props change
   */
  resetOnPropsChange?: boolean
  /**
   * Optional boolean to show error details in development
   * If true, error details will be shown in development
   */
  showErrorDetails?: boolean
  /**
   * Optional className to add to the error boundary component
   * If provided, it will be added to the error boundary component
   */
  className?: string
}

/**
 * Internal state for the ErrorBoundary component
 */
interface State {
  /** Whether an error has been caught */
  hasError: boolean
  /** The error that was caught, if any */
  error: Error | null
  /** The error info that was caught, if any */
  errorInfo: ErrorInfo | null
  /** The number of retry attempts */
  retryCount: number
  /** The unique ID of the error */
  errorId: string
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
 * // With custom fallback and error handling
 * <ErrorBoundary
 *   fallback={<CustomErrorComponent />}
 *   onError={(error, errorInfo) => {
 *     // Log to error reporting service
 *     trackError(error);
 *   }}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  /** Display name for debugging purposes */
  static displayName = 'ErrorBoundary';
  private retryTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error for monitoring
    this.logError(error, errorInfo)

    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && resetOnPropsChange) {
      if (resetKeys?.some((key, index) => key !== prevProps.resetKeys?.[index])) {
        this.resetErrorBoundary()
      }
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      window.clearTimeout(this.retryTimeoutId)
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Error Report:', errorReport)
      console.groupEnd()
    }

    // In production, you would send this to your error monitoring service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    if (process.env.NODE_ENV === 'production') {
      // window.gtag?.('event', 'exception', {
      //   description: error.message,
      //   fatal: false
      // })
      
      // Example: Send to monitoring service
      // fetch('/api/error-reporting', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // }).catch(console.error)
    }
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: ''
    })
  }

  private handleRetry = () => {
    const { retryCount } = this.state
    
    if (retryCount >= 3) {
      // Max retries reached, don't allow more retries
      return
    }

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }))

    // Add a small delay before retry for better UX
    this.retryTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary()
    }, 1000)
  }

  private renderErrorFallback = () => {
    const { error, errorInfo, retryCount, errorId } = this.state
    const { showErrorDetails = process.env.NODE_ENV === 'development' } = this.props
    const maxRetries = 3

    return (
      <div className={`min-h-[400px] flex items-center justify-center p-8 ${this.props.className || ''}`}>
        <div className="max-w-md w-full text-center space-y-6">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We encountered an unexpected error. Don't worry, this has been reported and we're working on it.
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {showErrorDetails && error && (
            <div className="text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-mono text-red-600 dark:text-red-400">
                {error.message}
              </p>
              {errorInfo?.componentStack && (
                <details className="text-xs text-gray-600 dark:text-gray-400">
                  <summary className="cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                    Component Stack
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap font-mono">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Error ID: {errorId}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {retryCount < maxRetries ? (
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={retryCount >= maxRetries}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
              </button>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Maximum retry attempts reached
              </p>
            )}

            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Report Issue
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            If this problem persists, please contact support with Error ID: {errorId}
          </p>
        </div>
      </div>
    )
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderErrorFallback()
    }

    return this.props.children
  }
}

// HOC wrapper for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary
