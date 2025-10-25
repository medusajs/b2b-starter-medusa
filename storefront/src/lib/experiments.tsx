/**
 * A/B Testing Hooks & Utilities
 * Uses experiment bucket from middleware cookie
 */

'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export type ExperimentBucket = 'A' | 'B'
export type ExperimentVariant<T = any> = {
    A: T
    B: T
}

const EXP_BUCKET_COOKIE = '_ysh_exp_bucket'

/**
 * Hook to get current experiment bucket
 * Returns 'A' or 'B' from middleware-set cookie
 */
export function useExperiment(): ExperimentBucket {
    const [bucket, setBucket] = useState<ExperimentBucket>('A')

    useEffect(() => {
        // Read cookie set by middleware
        const cookieBucket = Cookies.get(EXP_BUCKET_COOKIE)
        if (cookieBucket === 'A' || cookieBucket === 'B') {
            setBucket(cookieBucket)
        } else {
            // Fallback if cookie not set (shouldn't happen with middleware)
            setBucket(Math.random() < 0.5 ? 'A' : 'B')
        }
    }, [])

    return bucket
}

/**
 * Hook to get variant for current bucket
 * @example
 * const text = useVariant({ A: 'Buy Now', B: 'Add to Cart' })
 */
export function useVariant<T>(variants: ExperimentVariant<T>): T {
    const bucket = useExperiment()
    return variants[bucket]
}

/**
 * Hook to conditionally render based on bucket
 * @example
 * const showNewFeature = useExperimentFlag('B')
 */
export function useExperimentFlag(targetBucket: ExperimentBucket): boolean {
    const bucket = useExperiment()
    return bucket === targetBucket
}

/**
 * Component to render different variants
 */
export function ExperimentVariant({
    variants
}: {
    variants: ExperimentVariant<React.ReactNode>
}) {
    const bucket = useExperiment()
    return <>{variants[bucket]}</>
}

/**
 * Track experiment conversion/event
 */
export function trackExperimentEvent(
    experimentName: string,
    eventName: string,
    metadata?: Record<string, any>
) {
    const bucket = Cookies.get(EXP_BUCKET_COOKIE) || 'unknown'

    // Send to PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('experiment_event', {
            experiment_name: experimentName,
            experiment_bucket: bucket,
            event_name: eventName,
            ...metadata,
        })
    }

    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'experiment', {
            event_category: 'A/B Test',
            event_label: `${experimentName} - ${eventName}`,
            experiment_bucket: bucket,
            ...metadata,
        })
    }

    if (process.env.NODE_ENV === 'development') {
        console.log('[Experiment]', experimentName, eventName, bucket, metadata)
    }
}

/**
 * Utility to get bucket without React
 */
export function getExperimentBucket(): ExperimentBucket {
    if (typeof window === 'undefined') return 'A'
    const bucket = Cookies.get(EXP_BUCKET_COOKIE)
    return bucket === 'B' ? 'B' : 'A'
}
