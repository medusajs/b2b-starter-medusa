"use client"

import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class HydrationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a hydration error
    const isHydrationError = 
      error.message?.includes('Hydration failed') ||
      error.message?.includes('hydration') ||
      error.message?.includes('server rendered HTML') ||
      error.message?.includes('client')

    if (isHydrationError) {
      // For hydration errors, we'll suppress them and re-render
      console.warn('Hydration error caught and suppressed:', error.message)
      return { hasError: false }
    }

    // For other errors, handle normally
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log hydration errors but don't crash the app
    if (error.message?.includes('Hydration failed')) {
      console.warn('Hydration mismatch detected and handled:', {
        error: error.message,
        errorInfo
      })
      // Force a re-render to resolve the hydration mismatch
      this.setState({ hasError: false })
      return
    }

    // Log other errors normally
    console.error('Error caught by HydrationErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600">Please refresh the page to try again.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
