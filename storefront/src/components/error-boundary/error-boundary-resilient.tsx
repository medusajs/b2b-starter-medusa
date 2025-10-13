"use client"

/**
 * ErrorBoundaryResilient - React Error Boundary with graceful fallback UI
 *
 * Features:
 * - Catches React rendering errors
 * - Shows user-friendly fallback UI
 * - PostHog error tracking
 * - Manual retry actions
 * - Recovery strategies
 * - Deployed in critical routes
 */

import React, { Component, ErrorInfo, ReactNode } from "react"
import { triggerCartSync } from "@/lib/cart"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showRetry?: boolean
  context?: string // e.g., "cart", "checkout", "quotes"
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
  isRetrying: boolean
}

export class ErrorBoundaryResilient extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
      isRetrying: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, context = "unknown" } = this.props

    // Track error to PostHog
    this.trackError(error, errorInfo, context)

    // Call custom error handler
    onError?.(error, errorInfo)

    // Update state with error info
    this.setState({
      errorInfo,
    })
  }

  private trackError(error: Error, errorInfo: ErrorInfo, context: string) {
    if (typeof window !== "undefined" && (window as any).posthog) {
      ;(window as any).posthog.capture("error_boundary_triggered", {
        error_message: error.message,
        error_stack: error.stack,
        error_component_stack: errorInfo.componentStack,
        context,
        retry_count: this.state.retryCount,
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      })
    }

    // Also log to console for debugging
    console.error("[ErrorBoundaryResilient]", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context,
      retryCount: this.state.retryCount,
    })
  }

  private handleRetry = async () => {
    const { context = "unknown" } = this.props
    const { retryCount } = this.state

    if (retryCount >= this.maxRetries) {
      console.warn("[ErrorBoundaryResilient] Max retries reached")
      return
    }

    this.setState({ isRetrying: true })

    try {
      // Track retry attempt
      if (typeof window !== "undefined" && (window as any).posthog) {
        ;(window as any).posthog.capture("error_boundary_retry", {
          context,
          retry_count: retryCount + 1,
          max_retries: this.maxRetries,
        })
      }

      // Try to recover cart sync if in cart context
      if (context === "cart" || context === "checkout") {
        await triggerCartSync()
      }

      // Reset error state to retry rendering
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: retryCount + 1,
        isRetrying: false,
      })

      // Track successful retry
      if (typeof window !== "undefined" && (window as any).posthog) {
        ;(window as any).posthog.capture("error_boundary_retry_success", {
          context,
          retry_count: retryCount + 1,
        })
      }
    } catch (retryError) {
      console.error("[ErrorBoundaryResilient] Retry failed:", retryError)

      // Track failed retry
      if (typeof window !== "undefined" && (window as any).posthog) {
        ;(window as any).posthog.capture("error_boundary_retry_failed", {
          context,
          retry_count: retryCount + 1,
          error: retryError instanceof Error ? retryError.message : "Unknown",
        })
      }

      this.setState({ isRetrying: false })
    }
  }

  private handleReload = () => {
    const { context = "unknown" } = this.props

    // Track reload action
    if (typeof window !== "undefined" && (window as any).posthog) {
      ;(window as any).posthog.capture("error_boundary_reload", {
        context,
        retry_count: this.state.retryCount,
      })
    }

    // Reload the page
    window.location.reload()
  }

  render() {
    const { hasError, error, retryCount, isRetrying } = this.state
    const { fallback, showRetry = true, context = "unknown" } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-lg shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Algo deu errado
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  {context === "cart" && "Houve um problema ao carregar seu carrinho."}
                  {context === "checkout" && "Houve um problema ao processar seu pedido."}
                  {context === "quotes" && "Houve um problema ao carregar as cotações."}
                  {!["cart", "checkout", "quotes"].includes(context) && "Houve um problema ao carregar esta página."}
                </p>

                {process.env.NODE_ENV === "development" && error && (
                  <details className="mb-4">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Detalhes do erro (desenvolvimento)
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                      {error.message}
                      {error.stack && `\n\n${error.stack}`}
                    </pre>
                  </details>
                )}

                <div className="flex gap-3">
                  {showRetry && retryCount < this.maxRetries && (
                    <button
                      onClick={this.handleRetry}
                      disabled={isRetrying}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
                    >
                      {isRetrying ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Tentando...
                        </>
                      ) : (
                        <>
                          <svg
                            className="-ml-1 mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Tentar novamente
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={this.handleReload}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <svg
                      className="-ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Recarregar página
                  </button>
                </div>

                {retryCount > 0 && (
                  <p className="text-xs text-gray-500 mt-3">
                    Tentativas: {retryCount}/{this.maxRetries}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC to wrap components with ErrorBoundaryResilient
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryResilient {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundaryResilient>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

/**
 * Hook to manually trigger error boundary (for testing)
 */
export function useErrorBoundary() {
  const [, setState] = React.useState()

  return React.useCallback((error: Error) => {
    setState(() => {
      throw error
    })
  }, [])
}
