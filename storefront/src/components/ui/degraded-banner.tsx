"use client"

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

export interface DegradedBannerProps {
  message?: string
  onRetry?: () => void
  className?: string
}

/**
 * Banner para exibir quando dados estão em cache/stale
 * Usado quando meta.stale=true ou erro 503/504 tratado
 */
export function DegradedBanner({ 
  message = "Exibindo dados em cache. Alguns preços podem estar desatualizados.",
  onRetry,
  className = ""
}: DegradedBannerProps) {
  return (
    <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">{message}</p>
          {onRetry && (
            <button 
              onClick={onRetry} 
              className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600 underline focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              aria-label="Tentar carregar dados atualizados novamente"
            >
              Tentar novamente →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
