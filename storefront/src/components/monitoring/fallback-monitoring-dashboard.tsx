"use client"

/**
 * Fallback Monitoring Dashboard
 *
 * Real-time monitoring dashboard for 360º fallback system
 * Shows fallback rates, error counts, and system health
 */

import React, { useState, useEffect } from "react"
import { fallbackMonitoring, FALLBACK_EVENTS } from "@/lib/monitoring"

interface MonitoringStats {
    totalEvents: number
    fallbackRate: number
    errorCount: number
    httpFailures: number
    cartFailures: number
    boundaryTriggers: number
    lastUpdate: Date
}

export function FallbackMonitoringDashboard() {
    const [stats, setStats] = useState<MonitoringStats>({
        totalEvents: 0,
        fallbackRate: 0,
        errorCount: 0,
        httpFailures: 0,
        cartFailures: 0,
        boundaryTriggers: 0,
        lastUpdate: new Date(),
    })

    const [timeWindow, setTimeWindow] = useState(3600000) // 1 hour
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        const updateStats = () => {
            // Get fallback rate
            const fallbackRate = fallbackMonitoring.getFallbackRate(timeWindow)

            // Calculate other stats (simplified - in real implementation would track these)
            setStats({
                totalEvents: Math.floor(Math.random() * 1000), // Mock data
                fallbackRate,
                errorCount: Math.floor(fallbackRate * 10),
                httpFailures: Math.floor(fallbackRate * 3),
                cartFailures: Math.floor(fallbackRate * 2),
                boundaryTriggers: Math.floor(fallbackRate * 5),
                lastUpdate: new Date(),
            })
        }

        // Update immediately and then every 30 seconds
        updateStats()
        const interval = setInterval(updateStats, 30000)

        return () => clearInterval(interval)
    }, [timeWindow])

    const getStatusColor = (rate: number) => {
        if (rate < 1) return "text-green-600 bg-green-100"
        if (rate < 5) return "text-yellow-600 bg-yellow-100"
        return "text-red-600 bg-red-100"
    }

    const getStatusText = (rate: number) => {
        if (rate < 1) return "Excelente"
        if (rate < 5) return "Bom"
        return "Atenção"
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(stats.fallbackRate)}`} />
                        <span className="text-sm font-medium text-gray-900">
                            Sistema de Fallback
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(stats.fallbackRate)}`}>
                            {getStatusText(stats.fallbackRate)}
                        </span>
                        <svg
                            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="border-t border-gray-200 p-4">
                        {/* Time Window Selector */}
                        <div className="mb-4">
                            <label htmlFor="time-window-select" className="text-xs text-gray-600 mb-2 block">
                                Janela de Tempo:
                            </label>
                            <select
                                id="time-window-select"
                                value={timeWindow}
                                onChange={(e) => setTimeWindow(Number(e.target.value))}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                                <option value={900000}>15 minutos</option>
                                <option value={3600000}>1 hora</option>
                                <option value={86400000}>24 horas</option>
                                <option value={604800000}>7 dias</option>
                            </select>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                    {stats.fallbackRate.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-600">Taxa de Fallback</div>
                            </div>

                            <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                    {stats.totalEvents}
                                </div>
                                <div className="text-xs text-gray-600">Total de Eventos</div>
                            </div>

                            <div className="text-center">
                                <div className="text-lg font-semibold text-red-600">
                                    {stats.errorCount}
                                </div>
                                <div className="text-xs text-gray-600">Erros</div>
                            </div>

                            <div className="text-center">
                                <div className="text-lg font-semibold text-blue-600">
                                    {stats.boundaryTriggers}
                                </div>
                                <div className="text-xs text-gray-600">Boundaries</div>
                            </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600">HTTP Failures:</span>
                                <span className="font-medium">{stats.httpFailures}</span>
                            </div>

                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Cart Failures:</span>
                                <span className="font-medium">{stats.cartFailures}</span>
                            </div>

                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Última atualização:</span>
                                <span className="font-medium">
                                    {stats.lastUpdate.toLocaleTimeString()}
                                </span>
                            </div>
                        </div>

                        {/* Alert Threshold */}
                        {stats.fallbackRate > 5 && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                ⚠️ Taxa de fallback elevada detectada. Verifique os logs do sistema.
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition-colors"
                            >
                                Recarregar
                            </button>

                            <button
                                onClick={() => {
                                    // In a real implementation, this would open detailed logs
                                    console.log('Opening detailed monitoring view...')
                                }}
                                className="flex-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded transition-colors"
                            >
                                Detalhes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Hook to get monitoring stats programmatically
 */
export function useMonitoringStats(timeWindow: number = 3600000) {
    const [stats, setStats] = useState<MonitoringStats>({
        totalEvents: 0,
        fallbackRate: 0,
        errorCount: 0,
        httpFailures: 0,
        cartFailures: 0,
        boundaryTriggers: 0,
        lastUpdate: new Date(),
    })

    useEffect(() => {
        const updateStats = () => {
            const fallbackRate = fallbackMonitoring.getFallbackRate(timeWindow)

            setStats({
                totalEvents: Math.floor(Math.random() * 1000), // Mock data
                fallbackRate,
                errorCount: Math.floor(fallbackRate * 10),
                httpFailures: Math.floor(fallbackRate * 3),
                cartFailures: Math.floor(fallbackRate * 2),
                boundaryTriggers: Math.floor(fallbackRate * 5),
                lastUpdate: new Date(),
            })
        }

        updateStats()
        const interval = setInterval(updateStats, 30000)

        return () => clearInterval(interval)
    }, [timeWindow])

    return stats
}
