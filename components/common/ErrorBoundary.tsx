"use client"

import React from 'react'

interface ErrorBoundaryProps {
  fallback: (error: Error, reset: () => void) => React.ReactNode
  children: React.ReactNode
}

interface ErrorBoundaryState { error: Error | null }

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
    this.reset = this.reset.bind(this)
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    try { console.error('Chat ErrorBoundary', error, info) } catch {}
  }

  reset() {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error, this.reset)
    }
    return this.props.children
  }
}

export default ErrorBoundary


