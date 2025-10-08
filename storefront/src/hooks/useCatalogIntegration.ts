/**
 * useCatalogIntegration Hook
 * 
 * Integrates Viability → Catalog → Finance flow
 * Provides kit search and selection from viability analysis
 */

import { useState, useEffect, useCallback } from 'react'
import type { ViabilityOutput } from '@/modules/viability/types'
import type { CatalogKit } from '@/lib/catalog/integration'
import type { KitRecommendation, KitSearchCriteria } from '@/modules/viability/catalog-integration'
import {
    viabilityToKitSearch,
    rankKitsByViability,
    kitToFinanceInput,
} from '@/modules/viability/catalog-integration'

export interface UseCatalogIntegrationOptions {
    viability?: ViabilityOutput | null
    oversizingScenario?: 114 | 130 | 145 | 160
    autoSearch?: boolean
}

export interface UseCatalogIntegrationReturn {
    // Search state
    criteria: KitSearchCriteria | null
    kits: CatalogKit[]
    recommendations: KitRecommendation[]
    loading: boolean
    error: string | null

    // Actions
    searchKits: (criteria?: KitSearchCriteria) => Promise<void>
    selectKit: (kit: CatalogKit) => void
    clearSelection: () => void

    // Selected kit
    selectedKit: CatalogKit | null
    financeInput: ReturnType<typeof kitToFinanceInput> | null

    // Stats
    totalKits: number
    hasMore: boolean
}

export function useCatalogIntegration(
    options: UseCatalogIntegrationOptions = {}
): UseCatalogIntegrationReturn {
    const {
        viability,
        oversizingScenario = 114,
        autoSearch = true
    } = options

    // State
    const [criteria, setCriteria] = useState<KitSearchCriteria | null>(null)
    const [kits, setKits] = useState<CatalogKit[]>([])
    const [recommendations, setRecommendations] = useState<KitRecommendation[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedKit, setSelectedKit] = useState<CatalogKit | null>(null)
    const [totalKits, setTotalKits] = useState(0)
    const [hasMore, setHasMore] = useState(false)

    // Generate finance input from selected kit
    const financeInput = selectedKit && viability
        ? kitToFinanceInput(selectedKit, viability, oversizingScenario)
        : null

    // Search kits
    const searchKits = useCallback(async (customCriteria?: KitSearchCriteria) => {
        const searchCriteria = customCriteria || criteria

        if (!searchCriteria) {
            setError('No search criteria provided')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Build query params
            const params = new URLSearchParams({
                minPower: searchCriteria.minKwp.toFixed(2),
                maxPower: searchCriteria.maxKwp.toFixed(2),
                limit: '50',
                offset: '0',
            })

            if (searchCriteria.type !== 'all') {
                params.set('type', searchCriteria.type)
            }

            // Fetch kits
            const response = await fetch(`/api/catalog/kits?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch kits')
            }

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Failed to load kits')
            }

            const fetchedKits = data.data.kits || []
            setKits(fetchedKits)
            setTotalKits(data.data.pagination.total || 0)
            setHasMore(data.data.pagination.hasMore || false)

            // Rank kits if viability is available
            if (viability && fetchedKits.length > 0) {
                const ranked = rankKitsByViability(fetchedKits, viability, oversizingScenario)
                setRecommendations(ranked)
            } else {
                setRecommendations([])
            }

            console.log(`[Catalog] Found ${fetchedKits.length} kits matching criteria`)

        } catch (err: any) {
            console.error('[Catalog] Search error:', err)
            setError(err.message || 'Failed to search kits')
            setKits([])
            setRecommendations([])
        } finally {
            setLoading(false)
        }
    }, [criteria, viability, oversizingScenario])

    // Select kit
    const selectKit = useCallback((kit: CatalogKit) => {
        setSelectedKit(kit)
        console.log('[Catalog] Selected kit:', kit.id, kit.name)
    }, [])

    // Clear selection
    const clearSelection = useCallback(() => {
        setSelectedKit(null)
    }, [])

    // Auto-search when viability changes
    useEffect(() => {
        if (viability && autoSearch) {
            const newCriteria = viabilityToKitSearch(viability, oversizingScenario)
            setCriteria(newCriteria)
            searchKits(newCriteria)
        }
    }, [viability, oversizingScenario, autoSearch]) // Don't include searchKits in deps

    return {
        // Search state
        criteria,
        kits,
        recommendations,
        loading,
        error,

        // Actions
        searchKits,
        selectKit,
        clearSelection,

        // Selected kit
        selectedKit,
        financeInput,

        // Stats
        totalKits,
        hasMore,
    }
}
