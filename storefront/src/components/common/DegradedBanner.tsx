/**
 * 🟡 Degraded State Banner
 * Shows when API returns stale/estimated data
 */

import { AlertTriangle, RefreshCw } from 'lucide-react'

interface DegradedBannerProps {
  message?: string
  onRetry?: () => void
  retrying?: boolean
}

export function DegradedBanner({
  message = 'Exibindo dados estimados ou desatualizados',
  onRetry,
  retrying = false,
}: DegradedBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span>{message}</span>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="flex items-center gap-1 rounded px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:text-amber-100 dark:hover:bg-amber-900"
          aria-label="Tentar novamente"
        >
          <RefreshCw
            className={`h-3 w-3 ${retrying ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          {retrying ? 'Tentando...' : 'Tentar novamente'}
        </button>
      )}
    </div>
  )
}
