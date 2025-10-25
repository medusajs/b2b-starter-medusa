/**
 * Category Analytics Tracker
 * Client component para rastrear visualizações de categoria
 */

'use client'

import { useEffect } from 'react'
import { trackCategoryView } from '@/lib/sku-analytics'

interface CategoryTrackerProps {
    category: string
}

export default function CategoryTracker({ category }: CategoryTrackerProps) {
    useEffect(() => {
        // Rastreia visualização da categoria
        trackCategoryView({ category, source: 'navigation' })
    }, [category])

    // Componente invisível - apenas tracking
    return null
}
