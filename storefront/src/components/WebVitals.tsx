/**
 * Web Vitals Reporter
 * Collects and reports Core Web Vitals metrics
 */

'use client'

import { useEffect } from 'react'
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
    useReportWebVitals((metric) => {
        // Check if analytics is available and user has consented
        const hasConsent = checkAnalyticsConsent()
        if (!hasConsent) return

        // Send to PostHog
        if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture('web_vitals', {
                metric_name: metric.name,
                metric_value: metric.value,
                metric_rating: metric.rating,
                metric_delta: metric.delta,
                metric_id: metric.id,
                metric_navigation_type: metric.navigationType,
            })
        }

        // Send to Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: metric.name,
                value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                metric_id: metric.id,
                metric_rating: metric.rating,
                metric_delta: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
                non_interaction: true,
            })
        }

        // Send to Vercel Analytics (if available)
        if (typeof window !== 'undefined' && (window as any).va) {
            (window as any).va('event', {
                name: 'web_vitals',
                data: {
                    metric: metric.name,
                    value: metric.value,
                    rating: metric.rating,
                },
            })
        }

        // Console log in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Web Vitals] ${metric.name}:`, {
                value: metric.value,
                rating: metric.rating,
                delta: metric.delta,
                id: metric.id,
            })
        }
    })

    // Additional client-side monitoring
    useEffect(() => {
        // Monitor long tasks (for INP insights)
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const hasConsent = checkAnalyticsConsent()
                    if (!hasConsent) return

                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) { // Long task threshold
                            if (typeof window !== 'undefined' && (window as any).posthog) {
                                (window as any).posthog.capture('long_task', {
                                    duration: entry.duration,
                                    start_time: entry.startTime,
                                    entry_type: entry.entryType,
                                })
                            }
                        }
                    }
                })

                observer.observe({ entryTypes: ['longtask'] })

                return () => observer.disconnect()
            } catch (e) {
                // PerformanceObserver not supported or error
                console.warn('PerformanceObserver not available:', e)
            }
        }
    }, [])

    return null // This component doesn't render anything
}

function checkAnalyticsConsent(): boolean {
    if (typeof window === 'undefined') return false
    try {
        const consent = localStorage.getItem('analytics_consent')
        return consent === 'true' || consent === null // Default opt-in
    } catch {
        return false
    }
}

/**
 * Utility to manually report custom performance metrics
 */
export function reportCustomMetric(name: string, value: number, metadata?: Record<string, any>) {
    const hasConsent = checkAnalyticsConsent()
    if (!hasConsent) return

    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('custom_metric', {
            metric_name: name,
            metric_value: value,
            ...metadata,
        })
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'custom_metric', {
            event_category: 'Performance',
            event_label: name,
            value: Math.round(value),
            ...metadata,
        })
    }

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Custom Metric] ${name}:`, value, metadata)
    }
}
