'use client'

/**
 * PostHog Analytics Provider
 * Fornece analytics e error tracking para a aplicação
 */

import React, { useEffect, Suspense } from 'react'
import posthog from 'posthog-js'
import { usePathname, useSearchParams } from 'next/navigation'

interface PostHogProviderProps {
    children: React.ReactNode
}

function PostHogTracking() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Capturar mudanças de rota
    useEffect(() => {
        if (pathname && typeof window !== 'undefined') {
            const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`

            posthog.capture('$pageview', {
                $current_url: url
            })
        }
    }, [pathname, searchParams])

    return null
}

export function PostHogProvider({ children }: PostHogProviderProps) {

    useEffect(() => {
        // Inicializar PostHog apenas no cliente
        if (typeof window !== 'undefined') {
            const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
            const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

            if (posthogKey && posthogHost) {
                posthog.init(posthogKey, {
                    api_host: posthogHost,
                    capture_pageview: false, // Vamos capturar manualmente
                    capture_pageleave: true,
                    persistence: 'localStorage',
                    loaded: (posthog) => {
                        if (process.env.NODE_ENV === 'development') {
                            console.log('[PostHog] Initialized')
                        }
                    }
                })

                // Capturar pageview inicial
                posthog.capture('$pageview', {
                    $current_url: window.location.href
                })
            } else {
                console.warn('[PostHog] Missing NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST')
            }
        }

        return () => {
            // Cleanup se necessário
        }
    }, [])

    return (
        <>
            <Suspense fallback={null}>
                <PostHogTracking />
            </Suspense>
            {children}
        </>
    )
}

// Hook para usar PostHog em componentes
export function usePostHog() {
    return {
        capture: (event: string, properties?: Record<string, any>) => {
            posthog.capture(event, properties)
        },

        identify: (userId: string, properties?: Record<string, any>) => {
            posthog.identify(userId, properties)
        },

        reset: () => {
            posthog.reset()
        },

        // Eventos específicos da aplicação
        trackProductView: (productId: string, productName: string, category?: string) => {
            posthog.capture('product_view', {
                product_id: productId,
                product_name: productName,
                category,
                timestamp: new Date().toISOString()
            })
        },

        trackAddToCart: (productId: string, quantity: number, price: number) => {
            posthog.capture('add_to_cart', {
                product_id: productId,
                quantity,
                price,
                timestamp: new Date().toISOString()
            })
        },

        trackSearch: (query: string, resultsCount: number) => {
            posthog.capture('search', {
                query,
                results_count: resultsCount,
                timestamp: new Date().toISOString()
            })
        },

        trackSolarCalculation: (input: any, success: boolean, error?: string) => {
            posthog.capture('solar_calculation', {
                ...input,
                success,
                error,
                timestamp: new Date().toISOString()
            })
        },

        trackError: (error: Error, context?: Record<string, any>) => {
            posthog.capture('error', {
                error_message: error.message,
                error_stack: error.stack,
                ...context,
                timestamp: new Date().toISOString()
            })
        }
    }
}

// Hook para error boundary
export function useErrorTracking() {
    return {
        captureException: (error: Error, context?: Record<string, any>) => {
            console.error('[Error Tracking]', error, context)
            posthog.capture('exception', {
                error_message: error.message,
                error_stack: error.stack,
                ...context,
                timestamp: new Date().toISOString()
            })
        }
    }
}

export default PostHogProvider
