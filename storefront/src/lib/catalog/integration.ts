/**
 * Catalog Integration Module
 * 
 * Integrates YSH catalog (kits, inverters, panels, batteries) with Finance Module
 * Provides CAPEX calculation from product compositions
 */

// ============================================================================
// Types
// ============================================================================

export interface CatalogKit {
    id: string
    name: string
    type: string
    potencia_kwp: number
    price_brl: number
    panels: Array<{
        brand: string
        power_w: number
        quantity: number
        description: string
    }>
    inverters: Array<{
        brand: string
        power_kw: number
        quantity: number
        description: string
    }>
    batteries: Array<{
        brand?: string
        capacity_ah?: number
        quantity: number
        description?: string
    }>
    structures: any[]
    total_panels: number
    total_inverters: number
    total_power_w: number
    distributor: string
    image_url?: string
    pricing: {
        price: number
        price_brl: number
        currency: string
    }
}

export interface CatalogInverter {
    id: string
    name: string
    manufacturer: string
    category: 'inverters'
    price_brl?: number
    pricing?: {
        price: number
        price_brl: number
        currency: string
    }
    technical_specs?: {
        power_kw?: number
        power_w?: number
        type?: string
        voltage_v?: number
        phases?: string
    }
    availability: boolean
    image_url?: string
}

export interface CatalogPanel {
    id: string
    name: string
    manufacturer: string
    category: 'panels'
    price_brl?: number
    pricing?: {
        price: number
        price_brl: number
        currency: string
    }
    technical_specs?: {
        power_w?: number
        technology?: string
        efficiency?: number
    }
    availability: boolean
    image_url?: string
}

export interface CatalogBattery {
    id: string
    name: string
    manufacturer: string
    category: 'batteries'
    price_brl?: number
    pricing?: {
        price: number
        price_brl: number
        currency: string
    }
    technical_specs?: {
        capacity_ah?: number
        voltage_v?: number
        technology?: string
    }
    availability: boolean
    image_url?: string
}

// ============================================================================
// CAPEX Calculation from Catalog
// ============================================================================

/**
 * Calculate CAPEX from a kit composition
 */
export interface KitCAPEXCalculation {
    kit_id: string
    kit_name: string
    kit_base_price: number
    breakdown: {
        kit: number
        labor: number
        technical_docs: number
        homologation: number
        shipping: number
        project_docs: number
        total: number
    }
    system_kwp: number
    composition: {
        panels_count: number
        panels_total_w: number
        inverters_count: number
        batteries_count: number
    }
    distributor: string
}

/**
 * Calculate CAPEX from a kit
 * 
 * Applies standard percentages for additional costs:
 * - Labor: 15% of kit price
 * - Technical docs (ART/TRT): R$ 800
 * - Homologation: R$ 500
 * - Shipping: 5% of kit price
 * - Project docs: R$ 300
 */
export function calculateKitCAPEX(kit: CatalogKit): KitCAPEXCalculation {
    const kitPrice = kit.price_brl || kit.pricing?.price_brl || 0

    // Standard costs
    const labor = kitPrice * 0.15 // 15% labor
    const technicalDocs = 800 // ART/TRT
    const homologation = 500 // Utility company fees
    const shipping = kitPrice * 0.05 // 5% shipping
    const projectDocs = 300 // Project documentation

    const total = kitPrice + labor + technicalDocs + homologation + shipping + projectDocs

    return {
        kit_id: kit.id,
        kit_name: kit.name,
        kit_base_price: kitPrice,
        breakdown: {
            kit: kitPrice,
            labor: Math.round(labor * 100) / 100,
            technical_docs: technicalDocs,
            homologation: homologation,
            shipping: Math.round(shipping * 100) / 100,
            project_docs: projectDocs,
            total: Math.round(total * 100) / 100,
        },
        system_kwp: kit.potencia_kwp,
        composition: {
            panels_count: kit.total_panels,
            panels_total_w: kit.total_power_w,
            inverters_count: kit.total_inverters,
            batteries_count: kit.batteries?.length || 0,
        },
        distributor: kit.distributor,
    }
}

/**
 * Calculate CAPEX from custom composition
 */
export interface CustomSystemCAPEX {
    panels: Array<{ id: string; quantity: number; unit_price: number }>
    inverters: Array<{ id: string; quantity: number; unit_price: number }>
    batteries?: Array<{ id: string; quantity: number; unit_price: number }>
    structures?: Array<{ id: string; quantity: number; unit_price: number }>
}

export function calculateCustomCAPEX(system: CustomSystemCAPEX): KitCAPEXCalculation['breakdown'] {
    // Calculate equipment total
    const panelsTotal = system.panels.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0)
    const invertersTotal = system.inverters.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0)
    const batteriesTotal = system.batteries?.reduce((sum, b) => sum + (b.quantity * b.unit_price), 0) || 0
    const structuresTotal = system.structures?.reduce((sum, s) => sum + (s.quantity * s.unit_price), 0) || 0

    const equipmentTotal = panelsTotal + invertersTotal + batteriesTotal + structuresTotal

    // Apply standard costs
    const labor = equipmentTotal * 0.15
    const technicalDocs = 800
    const homologation = 500
    const shipping = equipmentTotal * 0.05
    const projectDocs = 300

    const total = equipmentTotal + labor + technicalDocs + homologation + shipping + projectDocs

    return {
        kit: equipmentTotal,
        labor: Math.round(labor * 100) / 100,
        technical_docs: technicalDocs,
        homologation: homologation,
        shipping: Math.round(shipping * 100) / 100,
        project_docs: projectDocs,
        total: Math.round(total * 100) / 100,
    }
}

// ============================================================================
// Catalog Data Loading
// ============================================================================

let cachedKits: CatalogKit[] = []
let cachedInverters: CatalogInverter[] = []
let cachedPanels: CatalogPanel[] = []
let cachedBatteries: CatalogBattery[] = []

let catalogLoaded = false

/**
 * Load catalog data from unified schemas
 */
export async function loadCatalog(): Promise<{
    kits: CatalogKit[]
    inverters: CatalogInverter[]
    panels: CatalogPanel[]
    batteries: CatalogBattery[]
}> {
    if (catalogLoaded) {
        return {
            kits: cachedKits,
            inverters: cachedInverters,
            panels: cachedPanels,
            batteries: cachedBatteries,
        }
    }

    try {
        console.log('[Catalog] Loading from unified schemas...')

        // In production, these would be API calls
        // For now, we'll load from static files

        // Load kits
        const kitsResponse = await fetch('/api/catalog/kits')
        if (kitsResponse.ok) {
            cachedKits = await kitsResponse.json()
        }

        // Load inverters
        const invertersResponse = await fetch('/api/catalog/inverters')
        if (invertersResponse.ok) {
            cachedInverters = await invertersResponse.json()
        }

        // Load panels
        const panelsResponse = await fetch('/api/catalog/panels')
        if (panelsResponse.ok) {
            cachedPanels = await panelsResponse.json()
        }

        // Load batteries
        const batteriesResponse = await fetch('/api/catalog/batteries')
        if (batteriesResponse.ok) {
            cachedBatteries = await batteriesResponse.json()
        }

        catalogLoaded = true

        console.log(`[Catalog] Loaded: ${cachedKits.length} kits, ${cachedInverters.length} inverters, ${cachedPanels.length} panels, ${cachedBatteries.length} batteries`)

        return {
            kits: cachedKits,
            inverters: cachedInverters,
            panels: cachedPanels,
            batteries: cachedBatteries,
        }

    } catch (error) {
        console.error('[Catalog] Error loading:', error)
        return {
            kits: [],
            inverters: [],
            panels: [],
            batteries: [],
        }
    }
}

/**
 * Search kits by power range
 */
export function searchKitsByPower(
    minKwp: number,
    maxKwp: number,
    kits: CatalogKit[] = cachedKits
): CatalogKit[] {
    return kits.filter(kit =>
        kit.potencia_kwp >= minKwp &&
        kit.potencia_kwp <= maxKwp
    ).sort((a, b) => a.price_brl - b.price_brl) // Cheapest first
}

/**
 * Search kits by price range
 */
export function searchKitsByPrice(
    minPrice: number,
    maxPrice: number,
    kits: CatalogKit[] = cachedKits
): CatalogKit[] {
    return kits.filter(kit => {
        const price = kit.price_brl || kit.pricing?.price_brl || 0
        return price >= minPrice && price <= maxPrice
    }).sort((a, b) => a.potencia_kwp - b.potencia_kwp) // Lowest power first
}

/**
 * Get kit by ID
 */
export function getKitById(kitId: string, kits: CatalogKit[] = cachedKits): CatalogKit | null {
    return kits.find(kit => kit.id === kitId) || null
}

/**
 * Get recommended kits for a target kWp
 */
export function getRecommendedKits(
    targetKwp: number,
    tolerance: number = 0.2,
    kits: CatalogKit[] = cachedKits
): CatalogKit[] {
    const minKwp = targetKwp * (1 - tolerance)
    const maxKwp = targetKwp * (1 + tolerance)

    return searchKitsByPower(minKwp, maxKwp, kits)
        .slice(0, 5) // Top 5 cheapest
}

// ============================================================================
// Price Helpers
// ============================================================================

/**
 * Extract price from product
 */
export function getProductPrice(
    product: CatalogKit | CatalogInverter | CatalogPanel | CatalogBattery
): number {
    if ('price_brl' in product && product.price_brl) {
        return product.price_brl
    }

    if ('pricing' in product && product.pricing) {
        return product.pricing.price_brl || product.pricing.price || 0
    }

    return 0
}

/**
 * Format price to BRL
 */
export function formatPriceBRL(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(price)
}

// ============================================================================
// Export helpers
// ============================================================================

export function clearCatalogCache(): void {
    cachedKits = []
    cachedInverters = []
    cachedPanels = []
    cachedBatteries = []
    catalogLoaded = false
}
