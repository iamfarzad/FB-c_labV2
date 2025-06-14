'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** The child components to be wrapped by the error boundary */
  children: ReactNode
  /** 
   * Optional custom fallback UI to display when an error occurs
   * If not provided, a default error UI will be shown
   */
  fallback?: ReactNode
  /**
   * Optional callback function that's called when an error is caught
   * @param error - The error that was caught
   * @param errorInfo - Additional error information from React
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * Internal state for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean
  /** The error that was caught, if any */
  error: Error | null
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
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /** Display name for debugging purposes */
  static displayName = 'ErrorBoundary';
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div 
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center"
        >
          <div className="p-4 mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 
            id="error-boundary-heading"
            className="mb-2 text-2xl font-bold text-gray-900 dark:text-white"
          >
            Something went wrong
          </h2>
          <p 
            id="error-boundary-message"
            aria-labelledby="error-boundary-heading"
            className="mb-6 text-gray-600 dark:text-gray-400"
          >
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            onClick={this.handleReset}
            variant="outline"
            className="inline-flex items-center gap-2"
            aria-label="Retry loading the component"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Try again</span>
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
