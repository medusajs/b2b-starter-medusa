/**
 * Catalog Enriched Data Integration
 * ==================================
 * 
 * Integra dados enriquecidos por AI (Ollama GPT-OSS 20B) com o frontend.
 * Fornece funções para consumir JSONs pré-processados com:
 * - Descrições otimizadas
 * - Metadados SEO
 * - Microcopy
 * - Badges automáticas
 */

import { cache } from 'react'
import fs from 'fs'
import path from 'path'

// Tipos
export interface EnrichedProduct {
    id: string
    name: string
    manufacturer: string
    image_url: string
    price_brl?: number
    badges: Array<{
        text: string
        variant: 'success' | 'primary' | 'info' | 'warning' | 'default'
    }>
    microcopy: {
        short_description: string
        tooltip: string
        cta_text: string
        availability_text: string
    }
    seo: {
        title: string
        description: string
        keywords: string[]
        og_title: string
        og_description: string
    }
}

export interface CategoryHero {
    title: string
    subtitle: string
    cta_primary: string
    cta_secondary: string
    benefits: string[]
}

export interface EnrichedCategoryData {
    category: string
    total_products: number
    generated_at: string
    hero: CategoryHero
    featured_products: EnrichedProduct[]
    manufacturer_spotlight: {
        name: string
        product_count: number
        data: any
    }
}

export interface UIKit {
    generated_at: string
    version: string
    categories: Record<string, EnrichedCategoryData>
}

// Paths
const UI_ENRICHED_DIR = path.join(
    process.cwd(),
    '../../../ysh-erp/data/catalog/ui_enriched'
)

const MANUFACTURERS_INDEX_PATH = path.join(
    process.cwd(),
    '../../../ysh-erp/data/catalog/reports/manufacturers_models_index.min.json'
)

/**
 * Carrega UI Kit completo (todas as categorias)
 */
export const getUIKit = cache(async (): Promise<UIKit | null> => {
    try {
        const uiKitPath = path.join(UI_ENRICHED_DIR, 'ui_kit_complete.json')

        if (!fs.existsSync(uiKitPath)) {
            console.warn('UI Kit não encontrado. Execute enrich_ui_components.py')
            return null
        }

        const data = await fs.promises.readFile(uiKitPath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Erro ao carregar UI Kit:', error)
        return null
    }
})

/**
 * Carrega dados enriquecidos de uma categoria específica
 */
export const getEnrichedCategory = cache(
    async (category: string): Promise<EnrichedCategoryData | null> => {
        try {
            const categoryPath = path.join(
                UI_ENRICHED_DIR,
                `${category}_enriched_ui.json`
            )

            if (!fs.existsSync(categoryPath)) {
                console.warn(`Categoria ${category} não enriquecida ainda`)
                return null
            }

            const data = await fs.promises.readFile(categoryPath, 'utf-8')
            return JSON.parse(data)
        } catch (error) {
            console.error(`Erro ao carregar categoria ${category}:`, error)
            return null
        }
    }
)

/**
 * Carrega índice de fabricantes
 */
export const getManufacturersIndex = cache(async () => {
    try {
        if (!fs.existsSync(MANUFACTURERS_INDEX_PATH)) {
            return null
        }

        const data = await fs.promises.readFile(MANUFACTURERS_INDEX_PATH, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Erro ao carregar índice de fabricantes:', error)
        return null
    }
})

/**
 * Busca produtos enriquecidos de uma categoria
 */
export const getEnrichedProducts = cache(
    async (category: string): Promise<EnrichedProduct[]> => {
        const categoryData = await getEnrichedCategory(category)
        return categoryData?.featured_products || []
    }
)

/**
 * Busca dados de hero para categoria
 */
export const getCategoryHero = cache(
    async (category: string): Promise<CategoryHero | null> => {
        const categoryData = await getEnrichedCategory(category)
        return categoryData?.hero || null
    }
)

/**
 * Busca spotlight de fabricante para categoria
 */
export const getManufacturerSpotlight = cache(
    async (category: string) => {
        const categoryData = await getEnrichedCategory(category)
        return categoryData?.manufacturer_spotlight || null
    }
)

/**
 * Busca fabricantes por categoria no índice
 */
export const getManufacturersByCategory = cache(
    async (category: string): Promise<string[]> => {
        const index = await getManufacturersIndex()
        if (!index) return []

        const manufacturers: string[] = []

        for (const [name, data] of Object.entries(index.manufacturers || {})) {
            const mfrData = data as any
            if (mfrData.categories?.includes(category)) {
                manufacturers.push(name)
            }
        }

        return manufacturers.sort()
    }
)

/**
 * Busca dados completos de um fabricante
 */
export const getManufacturerData = cache(
    async (manufacturerName: string) => {
        const index = await getManufacturersIndex()
        if (!index) return null

        return index.manufacturers?.[manufacturerName] || null
    }
)

/**
 * Helper: Verifica se dados enriquecidos estão disponíveis
 */
export const hasEnrichedData = cache(async (): Promise<boolean> => {
    try {
        const uiKitPath = path.join(UI_ENRICHED_DIR, 'ui_kit_complete.json')
        return fs.existsSync(uiKitPath)
    } catch {
        return false
    }
})

/**
 * Helper: Retorna fallback se dados enriquecidos não disponíveis
 */
export const getEnrichedOrFallback = async <T>(
    enrichedFn: () => Promise<T | null>,
    fallback: T
): Promise<T> => {
    const enriched = await enrichedFn()
    return enriched || fallback
}
