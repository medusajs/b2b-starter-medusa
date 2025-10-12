/**
 * Consent Banner Component
 * LGPD/GDPR compliant cookie consent
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'

const CONSENT_COOKIE_KEY = 'ysh_cookie_consent'
const ANALYTICS_CONSENT_KEY = 'analytics_consent'

export type ConsentStatus = 'pending' | 'accepted' | 'rejected' | 'custom'

export interface ConsentPreferences {
    necessary: boolean // Always true
    analytics: boolean
    marketing: boolean
    functional: boolean
}

const defaultPreferences: ConsentPreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
}

export function ConsentBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [preferences, setPreferences] = useState<ConsentPreferences>(defaultPreferences)

    useEffect(() => {
        // Check if consent already given
        const consent = localStorage.getItem(CONSENT_COOKIE_KEY)
        if (!consent) {
            // Delay showing banner for better UX
            setTimeout(() => setIsVisible(true), 1000)
        } else {
            // Load saved preferences
            try {
                const saved = JSON.parse(consent)
                setPreferences(saved)
                updateAnalyticsConsent(saved.analytics)
            } catch {
                // Invalid JSON, show banner
                setIsVisible(true)
            }
        }
    }, [])

    const updateAnalyticsConsent = useCallback((allowed: boolean) => {
        localStorage.setItem(ANALYTICS_CONSENT_KEY, allowed.toString())

        // Update PostHog consent
        if (typeof window !== 'undefined' && (window as any).posthog) {
            if (allowed) {
                (window as any).posthog.opt_in_capturing()
            } else {
                (window as any).posthog.opt_out_capturing()
            }
        }

        // Update Google Analytics consent
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: allowed ? 'granted' : 'denied',
                ad_storage: preferences.marketing ? 'granted' : 'denied',
            })
        }
    }, [preferences.marketing])

    const saveConsent = (prefs: ConsentPreferences) => {
        localStorage.setItem(CONSENT_COOKIE_KEY, JSON.stringify(prefs))
        updateAnalyticsConsent(prefs.analytics)
        setIsVisible(false)
    }

    const handleAcceptAll = () => {
        const allAccepted: ConsentPreferences = {
            necessary: true,
            analytics: true,
            marketing: true,
            functional: true,
        }
        setPreferences(allAccepted)
        saveConsent(allAccepted)
    }

    const handleRejectAll = () => {
        const allRejected: ConsentPreferences = {
            necessary: true, // Can't reject necessary
            analytics: false,
            marketing: false,
            functional: false,
        }
        setPreferences(allRejected)
        saveConsent(allRejected)
    }

    const handleSaveCustom = () => {
        saveConsent(preferences)
    }

    const handleToggle = (key: keyof ConsentPreferences) => {
        if (key === 'necessary') return // Can't toggle necessary cookies
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
    }

    if (!isVisible) return null

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-2xl"
            role="dialog"
            aria-labelledby="consent-banner-title"
            aria-describedby="consent-banner-description"
        >
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {!showDetails ? (
                    // Simplified view
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h2 id="consent-banner-title" className="text-lg font-semibold text-gray-900 mb-2">
                                🍪 Cookies e Privacidade
                            </h2>
                            <p id="consent-banner-description" className="text-sm text-gray-600">
                                Usamos cookies essenciais para o funcionamento do site e, com seu consentimento,
                                cookies analíticos para melhorar sua experiência. Você pode escolher quais aceitar.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setShowDetails(true)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                Personalizar
                            </button>
                            <button
                                onClick={handleRejectAll}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                Rejeitar Todos
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                Aceitar Todos
                            </button>
                        </div>
                    </div>
                ) : (
                    // Detailed view
                    <div>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                                    Configurações de Cookies
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Gerencie suas preferências de privacidade
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Fechar configurações detalhadas"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            {/* Necessary Cookies */}
                            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium text-gray-900">Cookies Necessários</h3>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                            Sempre Ativos
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Essenciais para o funcionamento do site (carrinho, autenticação, segurança).
                                    </p>
                                </div>
                                <div className="ml-4">
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled
                                        className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-not-allowed opacity-50"
                                        aria-label="Cookies necessários (sempre ativos)"
                                    />
                                </div>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 mb-1">Cookies Analíticos</h3>
                                    <p className="text-sm text-gray-600">
                                        Nos ajudam a entender como você usa o site para melhorar a experiência
                                        (PostHog, Google Analytics).
                                    </p>
                                </div>
                                <div className="ml-4">
                                    <input
                                        type="checkbox"
                                        checked={preferences.analytics}
                                        onChange={() => handleToggle('analytics')}
                                        className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                                        aria-label="Cookies analíticos"
                                    />
                                </div>
                            </div>

                            {/* Marketing Cookies */}
                            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 mb-1">Cookies de Marketing</h3>
                                    <p className="text-sm text-gray-600">
                                        Usados para personalizar anúncios e medir a eficácia de campanhas.
                                    </p>
                                </div>
                                <div className="ml-4">
                                    <input
                                        type="checkbox"
                                        checked={preferences.marketing}
                                        onChange={() => handleToggle('marketing')}
                                        className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                                        aria-label="Cookies de marketing"
                                    />
                                </div>
                            </div>

                            {/* Functional Cookies */}
                            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 mb-1">Cookies Funcionais</h3>
                                    <p className="text-sm text-gray-600">
                                        Lembram suas preferências e configurações (tema, idioma, região).
                                    </p>
                                </div>
                                <div className="ml-4">
                                    <input
                                        type="checkbox"
                                        checked={preferences.functional}
                                        onChange={() => handleToggle('functional')}
                                        className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                                        aria-label="Cookies funcionais"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 justify-end border-t border-gray-200 pt-4">
                            <button
                                onClick={handleRejectAll}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                Rejeitar Todos
                            </button>
                            <button
                                onClick={handleSaveCustom}
                                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            >
                                Salvar Preferências
                            </button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                                Você pode alterar suas preferências a qualquer momento acessando as{' '}
                                <Link href="/privacy" className="text-yellow-600 hover:text-yellow-700 underline">
                                    configurações de privacidade
                                </Link>.
                                Leia nossa{' '}
                                <Link href="/privacy-policy" className="text-yellow-600 hover:text-yellow-700 underline">
                                    Política de Privacidade
                                </Link>
                                {' '}para mais informações.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Hook to check if user has given analytics consent
 */
export function useAnalyticsConsent(): boolean {
    const [hasConsent, setHasConsent] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem(ANALYTICS_CONSENT_KEY)
        setHasConsent(consent === 'true')

        // Listen for consent changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === ANALYTICS_CONSENT_KEY) {
                setHasConsent(e.newValue === 'true')
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    return hasConsent
}

/**
 * Utility to check consent status without React
 */
export function hasAnalyticsConsent(): boolean {
    if (typeof window === 'undefined') return false
    try {
        const consent = localStorage.getItem(ANALYTICS_CONSENT_KEY)
        return consent === 'true' || consent === null // Default opt-in for first visit
    } catch {
        return false
    }
}
