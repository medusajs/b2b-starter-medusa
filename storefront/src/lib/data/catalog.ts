/**
 * Catalog Data Loader
 * 
 * Provides data fetching functions for product catalog pages:
 * - listCatalog: Fetch products by category with filters
 * - listManufacturers: Get all unique manufacturers
 * - getCategoryInfo: Get metadata for category pages
 * 
 * @module lib/data/catalog
 */

'use server'

import { getAuthHeaders, getCacheOptions } from "@/lib/data/cookies"

/**
 * Filters for catalog listing
 */
export type CatalogFilters = {
    manufacturer?: string
    minPrice?: string
    maxPrice?: string
    availability?: string
    sort?: string
    limit?: string
    page?: string
}

/**
 * Response from catalog API
 */
export type CatalogResponse = {
    products: any[]
    total: number
    page: number
    limit: number
    facets?: {
        manufacturers?: string[]
        priceRange?: { min: number; max: number }
    }
}

/**
 * Category metadata for hero sections
 */
export type CategoryInfo = {
    title: string
    description: string
    icon: string
    keywords?: string[]
}

/**
 * Fetch products by category with optional filters
 * 
 * @param category - Category slug (panels, inverters, kits, etc.)
 * @param filters - Optional filters (manufacturer, price range, availability, sort, pagination)
 * @returns CatalogResponse with products, total count, and pagination info
 * 
 * @example
 * ```typescript
 * const { products, total } = await listCatalog('panels', {
 *   manufacturer: 'Canadian Solar',
 *   minPrice: '500',
 *   maxPrice: '1000',
 *   page: '1',
 *   limit: '24'
 * })
 * ```
 */
export async function listCatalog(
    category: string,
    filters: CatalogFilters = {}
): Promise<CatalogResponse> {
    try {
        const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

        if (!backend) {
            console.error('[Catalog] NEXT_PUBLIC_MEDUSA_BACKEND_URL not configured')
            return {
                products: [],
                total: 0,
                page: 1,
                limit: Number(filters.limit) || 24,
            }
        }

        const qs = new URLSearchParams({
            limit: filters.limit || "24",
            page: filters.page || "1",
        })

        // Add optional filters
        if (filters.manufacturer) qs.set("manufacturer", filters.manufacturer)
        if (filters.minPrice) qs.set("minPrice", filters.minPrice)
        if (filters.maxPrice) qs.set("maxPrice", filters.maxPrice)
        if (filters.availability) qs.set("availability", filters.availability)
        if (filters.sort) qs.set("sort", filters.sort)

        const headers = await getAuthHeaders()
        const cacheOptions = await getCacheOptions("catalog")

        const res = await fetch(
            `${backend}/store/catalog/${category}?${qs.toString()}`,
            {
                credentials: "include",
                headers,
                next: {
                    ...cacheOptions,
                    revalidate: 600, // ISR: 10 minutes
                    tags: ["catalog", `catalog-${category}`],
                },
                cache: "force-cache",
            }
        )

        if (!res.ok) {
            console.error(
                `[Catalog] Failed to fetch catalog for ${category}: ${res.status} ${res.statusText}`
            )
            return {
                products: [],
                total: 0,
                page: 1,
                limit: Number(filters.limit) || 24,
            }
        }

        const data = await res.json()

        return {
            products: data.products || [],
            total: data.total || 0,
            page: Number(data.page) || 1,
            limit: Number(data.limit) || 24,
            facets: data.facets,
        }
    } catch (error) {
        console.error(`[Catalog] Error fetching catalog for ${category}:`, error)
        return {
            products: [],
            total: 0,
            page: 1,
            limit: Number(filters.limit) || 24,
        }
    }
}

/**
 * Fetch all unique manufacturers from catalog
 * 
 * @returns Array of manufacturer names
 * 
 * @example
 * ```typescript
 * const manufacturers = await listManufacturers()
 * // ['Canadian Solar', 'Jinko Solar', 'Trina Solar', ...]
 * ```
 */
export async function listManufacturers(): Promise<string[]> {
    try {
        const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

        if (!backend) {
            console.error('[Catalog] NEXT_PUBLIC_MEDUSA_BACKEND_URL not configured')
            return []
        }

        const res = await fetch(`${backend}/store/catalog/manufacturers`, {
            next: {
                revalidate: 3600, // Cache for 1 hour
                tags: ["manufacturers"],
            },
            cache: "force-cache",
        })

        if (!res.ok) {
            console.error(
                `[Catalog] Failed to fetch manufacturers: ${res.status} ${res.statusText}`
            )
            return []
        }

        const json = await res.json()
        return json.manufacturers || []
    } catch (error) {
        console.error("[Catalog] Error fetching manufacturers:", error)
        return []
    }
}

/**
 * Get category metadata for hero sections and SEO
 * 
 * @param category - Category slug
 * @returns CategoryInfo with title, description, icon, and keywords
 * 
 * @example
 * ```typescript
 * const info = await getCategoryInfo('panels')
 * // { title: 'Painéis Solares', description: '...', icon: 'solar-panel' }
 * ```
 */
export async function getCategoryInfo(category: string): Promise<CategoryInfo> {
    const categoryMap: Record<string, CategoryInfo> = {
        kits: {
            title: "Kits Fotovoltaicos",
            description: "Soluções completas para instalação imediata com painéis, inversores e estruturas",
            icon: "package",
            keywords: ["kit solar", "kit fotovoltaico", "sistema completo", "instalação rápida"],
        },
        panels: {
            title: "Painéis Solares",
            description: "Painéis fotovoltaicos de alta eficiência para máxima geração de energia",
            icon: "solar-panel",
            keywords: ["painel solar", "módulo fotovoltaico", "célula solar", "geração solar"],
        },
        inverters: {
            title: "Inversores Solares",
            description: "Inversores de string e microinversores para todos os tipos de instalação",
            icon: "cpu",
            keywords: ["inversor solar", "microinversor", "string inverter", "conversão energia"],
        },
        batteries: {
            title: "Baterias de Armazenamento",
            description: "Sistemas de armazenamento para backup e independência energética",
            icon: "battery-charging",
            keywords: ["bateria solar", "armazenamento energia", "backup", "off-grid"],
        },
        structures: {
            title: "Estruturas de Fixação",
            description: "Estruturas para telhados cerâmicos, metálicos e instalações em solo",
            icon: "component",
            keywords: ["estrutura solar", "fixação painel", "suporte telhado", "trilho"],
        },
        accessories: {
            title: "Acessórios e Componentes",
            description: "Cabos, conectores, proteções e acessórios para instalação fotovoltaica",
            icon: "plug",
            keywords: ["cabo solar", "conector MC4", "string box", "disjuntor DC"],
        },
    }

    return (
        categoryMap[category] || {
            title: "Catálogo Solar",
            description: "Produtos para energia solar fotovoltaica",
            icon: "box",
            keywords: ["energia solar", "fotovoltaico", "sustentável"],
        }
    )
}

/**
 * Get all available categories
 * 
 * @returns Array of category slugs
 * 
 * @example
 * ```typescript
 * const categories = await listCategories()
 * // ['kits', 'panels', 'inverters', 'batteries', 'structures', 'accessories']
 * ```
 */
export async function listCategories(): Promise<string[]> {
    return ['kits', 'panels', 'inverters', 'batteries', 'structures', 'accessories']
}
