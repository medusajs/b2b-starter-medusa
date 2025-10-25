"use client"

/**
 * CartSyncIndicator - UI component showing cart sync status
 *
 * Displays:
 * - Pending operations count
 * - Sync progress
 * - Manual retry button
 * - Error states
 * - Integration with PostHog tracking
 */

import { useEffect, useState } from "react"
import { getCartSyncStatus, triggerCartSync, type CartSyncStatus } from "@/lib/cart/resilient-layer"
import { fallbackMonitoring } from "@/lib/monitoring"

export function CartSyncIndicator() {
    const [status, setStatus] = useState<CartSyncStatus | null>(null)
    const [syncing, setSyncing] = useState(false)
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        // Load initial status
        loadStatus()

        // Check online status
        setIsOnline(navigator.onLine)

        // Poll status every 3 seconds
        const statusInterval = setInterval(loadStatus, 3000)

        // Listen for online/offline events
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            clearInterval(statusInterval)
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    const loadStatus = () => {
        const currentStatus = getCartSyncStatus()
        setStatus(currentStatus)
    }

    const handleManualSync = async () => {
        if (!isOnline || syncing) return

        setSyncing(true)

        try {
            // Track manual sync start
            fallbackMonitoring.track("manual_sync_triggered", {
                queue_size: status?.queueSize || 0,
                context: "cart_sync_indicator",
            })

            await triggerCartSync()
            loadStatus()

            // Track success
            fallbackMonitoring.track("manual_sync_success", {
                queue_size: status?.queueSize || 0,
                context: "cart_sync_indicator",
            })

            // Show success feedback (you can integrate with toast system)
            console.log("✅ Carrinho sincronizado com sucesso!")
        } catch (error) {
            console.error("Manual sync failed:", error)

            // Track failure
            fallbackMonitoring.track("manual_sync_failed", {
                queue_size: status?.queueSize || 0,
                error: error instanceof Error ? error.message : "Unknown",
                context: "cart_sync_indicator",
            })
        } finally {
            setSyncing(false)
        }
    }

    // Don't show if no pending operations and online
    if (!status || (!status.hasPendingOperations && isOnline)) {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {!isOnline ? (
                        <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 5.636l-12.728 12.728m0 0L12 12m-6.364 6.364L12 12m6.364-6.364L12 12"
                            />
                        </svg>
                    ) : syncing ? (
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
                            className="h-5 w-5 text-yellow-500"
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
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                        {!isOnline
                            ? "Modo Offline"
                            : syncing
                                ? "Sincronizando carrinho"
                                : "Carrinho não sincronizado"
                        }
                    </h3>

                    <p className="text-xs text-gray-600 mt-1">
                        {!isOnline
                            ? "Suas alterações serão sincronizadas quando voltar online"
                            : status.queueSize === 1
                                ? "1 operação pendente"
                                : `${status.queueSize} operações pendentes`
                        }
                    </p>

                    {status.lastSyncAttempt && (
                        <p className="text-xs text-gray-500 mt-1">
                            Última tentativa: {new Date(status.lastSyncAttempt).toLocaleTimeString()}
                        </p>
                    )}

                    {isOnline && status.hasPendingOperations && (
                        <button
                            onClick={handleManualSync}
                            disabled={syncing}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {syncing ? "Sincronizando..." : "Tentar agora"}
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setStatus(null)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                    title="Fechar indicador"
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
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                        Operações pendentes:
                    </p>
                    <ul className="space-y-1">
                        {status.operations.slice(0, 3).map((op) => (
                            <li key={op.id} className="text-xs text-gray-600 flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${op.attempts > 0 ? 'bg-yellow-400' : 'bg-blue-400'
                                    }`} />
                                <span className="capitalize">{op.type}</span>
                                <span className="text-gray-400">
                                    ({op.attempts}/{op.maxAttempts})
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
