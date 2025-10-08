'use client'

/**
 * Offline Banner Component
 * Exibe aviso quando o backend está offline e o site está em modo fallback
 */

import { useState, useEffect } from 'react'
import { AlertCircle, Wifi, WifiOff, X } from 'lucide-react'

export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)
    const [isChecking, setIsChecking] = useState(false)

    useEffect(() => {
        // Verifica status inicial
        checkHealth()

        // Verifica a cada 30 segundos
        const interval = setInterval(checkHealth, 30000)

        return () => clearInterval(interval)
    }, [])

    async function checkHealth() {
        try {
            const response = await fetch('/api/health', {
                cache: 'no-store'
            })

            const data = await response.json()
            setIsOffline(!data.healthy || data.fallback?.active)
        } catch (error) {
            setIsOffline(true)
        }
    }

    async function handleRetry() {
        setIsChecking(true)
        await checkHealth()
        setIsChecking(false)

        if (!isOffline) {
            setIsDismissed(true)
        }
    }

    if (!isOffline || isDismissed) {
        return null
    }

    return (
        <div className="bg-amber-50 border-b border-amber-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <WifiOff className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-amber-900">
                                Modo Offline Ativo
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Estamos com problemas de conexão. Você pode navegar no catálogo,
                                mas algumas funcionalidades podem estar limitadas.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={handleRetry}
                            disabled={isChecking}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-100 rounded-md hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Wifi className={`h-3.5 w-3.5 ${isChecking ? 'animate-pulse' : ''}`} />
                            {isChecking ? 'Verificando...' : 'Reconectar'}
                        </button>

                        <button
                            onClick={() => setIsDismissed(true)}
                            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md transition-colors"
                            aria-label="Dispensar aviso"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function FallbackBadge() {
    return (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
            <AlertCircle className="h-3 w-3" />
            <span>Catálogo Local</span>
        </div>
    )
}
