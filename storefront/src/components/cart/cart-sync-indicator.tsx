"use client"

/**
 * CartSyncIndicator - UI component showing cart sync status
 * 
 * Displays:
 * - Pending operations count
 * - Sync progress
 * - Manual retry button
 * - Error states
 */

import { useEffect, useState } from "react"
import { getCartSyncStatus, triggerCartSync, type CartSyncStatus } from "@/lib/cart"

export function CartSyncIndicator() {
  const [status, setStatus] = useState<CartSyncStatus | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    // Load initial status
    loadStatus()

    // Poll status every 5 seconds
    const interval = setInterval(loadStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const loadStatus = () => {
    const currentStatus = getCartSyncStatus()
    setStatus(currentStatus)
  }

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      await triggerCartSync()
      loadStatus()
    } catch (error) {
      console.error("Manual sync failed:", error)
    } finally {
      setSyncing(false)
    }
  }

  if (!status || !status.hasPendingOperations) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {syncing ? (
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
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
          ) : (
            <svg
              className="h-5 w-5 text-blue-500"
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
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            Sincronizando carrinho
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {status.queueSize} {status.queueSize === 1 ? "operação pendente" : "operações pendentes"}
          </p>
          
          {status.lastSyncAttempt && (
            <p className="text-xs text-gray-500 mt-1">
              Última tentativa: {new Date(status.lastSyncAttempt).toLocaleTimeString()}
            </p>
          )}

          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
          >
            {syncing ? "Sincronizando..." : "Tentar agora"}
          </button>
        </div>

        <button
          onClick={() => setStatus(null)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {status.operations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Operações pendentes:
          </p>
          <ul className="space-y-1">
            {status.operations.slice(0, 3).map((op) => (
              <li key={op.id} className="text-xs text-gray-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span className="capitalize">{op.type}</span>
                <span className="text-gray-400">
                  ({op.attempts}/{op.maxAttempts} tentativas)
                </span>
              </li>
            ))}
            {status.operations.length > 3 && (
              <li className="text-xs text-gray-500">
                +{status.operations.length - 3} mais
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
