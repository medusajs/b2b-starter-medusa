/**
 * Degraded Banner Component
 * Shows when API returns stale/estimated data
 */

import * as React from "react"

interface DegradedBannerProps {
  message?: string
  onRetry?: () => void
  className?: string
}export function DegradedBanner({
    message = "Exibindo dados em cache. Alguns preços podem estar desatualizados.",
    onRetry,
    className = ""
}: DegradedBannerProps) {
    return (
        <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`} role="alert">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">{message}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600 underline focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            aria-label="Tentar carregar dados atualizados novamente"
                        >
                            Tentar novamente
                        </button>
                    )}
                </div>
            </div>
        </div >
    )
}
