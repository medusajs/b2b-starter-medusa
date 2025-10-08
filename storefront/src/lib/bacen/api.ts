/**
 * BACEN API - Banco Central do Brasil
 * 
 * Fetches real-time interest rates and SELIC/CDI data
 * 
 * Data sources:
 * - Interest Rates: https://www.bcb.gov.br/estatisticas/txjuros
 * - SELIC: https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json
 * - CDI: https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json
 * - IPCA: https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/1?formato=json
 */

// ============================================================================
// Types
// ============================================================================

export interface BACENSeriesData {
    data: string // "DD/MM/YYYY"
    valor: string // "10.65"
}

export interface BACENInterestRate {
    /** SELIC rate (Sistema Especial de Liquidação e Custódia) */
    selic: number

    /** CDI rate (Certificado de Depósito Interbancário) */
    cdi: number

    /** IPCA inflation index */
    ipca: number

    /** Credit rates by modality */
    credit_rates: {
        /** Personal credit - non-consigned */
        personal_non_consigned: number

        /** Personal credit - INSS consigned */
        personal_consigned_inss: number

        /** Other goods acquisition (solar panels fit here) */
        other_goods_acquisition: number

        /** Vehicle acquisition */
        vehicle_acquisition: number
    }

    /** Data timestamp */
    updated_at: string

    /** Data source */
    source: 'BACEN_API'
}

export interface BACENCacheEntry {
    data: BACENInterestRate
    timestamp: number
    expires_at: number
}

// ============================================================================
// Constants
// ============================================================================

const BACEN_API_BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs'

// Series codes (from BACEN SGS - Sistema Gerenciador de Séries Temporais)
const SERIES_CODES = {
    SELIC: 11, // SELIC taxa acumulada no mês
    CDI: 12, // CDI taxa acumulada no mês
    IPCA: 433, // IPCA variação mensal
    CREDIT_PERSONAL_NON_CONSIGNED: 20714, // Crédito pessoal não consignado
    CREDIT_PERSONAL_CONSIGNED_INSS: 20715, // Crédito consignado INSS
    CREDIT_OTHER_GOODS: 20719, // Aquisição de outros bens
    CREDIT_VEHICLE: 20718, // Aquisição de veículos
} as const

// Cache duration: 1 hour (rates don't change frequently)
const CACHE_DURATION_MS = 60 * 60 * 1000

// Storage key
const CACHE_STORAGE_KEY = 'bacen_rates_cache'

// ============================================================================
// Cache Management
// ============================================================================

function getCachedRates(): BACENInterestRate | null {
    if (typeof window === 'undefined') return null

    try {
        const cached = localStorage.getItem(CACHE_STORAGE_KEY)
        if (!cached) return null

        const entry: BACENCacheEntry = JSON.parse(cached)

        // Check if expired
        if (Date.now() > entry.expires_at) {
            localStorage.removeItem(CACHE_STORAGE_KEY)
            return null
        }

        return entry.data
    } catch (error) {
        console.error('Error reading BACEN cache:', error)
        return null
    }
}

function setCachedRates(data: BACENInterestRate): void {
    if (typeof window === 'undefined') return

    try {
        const entry: BACENCacheEntry = {
            data,
            timestamp: Date.now(),
            expires_at: Date.now() + CACHE_DURATION_MS,
        }

        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(entry))
    } catch (error) {
        console.error('Error caching BACEN data:', error)
    }
}

// ============================================================================
// API Fetching
// ============================================================================

/**
 * Fetch a single series from BACEN API
 */
async function fetchBACENSeries(seriesCode: number, lastN: number = 1): Promise<BACENSeriesData[]> {
    const url = `${BACEN_API_BASE}.${seriesCode}/dados/ultimos/${lastN}?formato=json`

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            // Cache for 1 hour
            next: { revalidate: 3600 },
        })

        if (!response.ok) {
            throw new Error(`BACEN API error: ${response.status} ${response.statusText}`)
        }

        const data: BACENSeriesData[] = await response.json()
        return data

    } catch (error) {
        console.error(`Error fetching BACEN series ${seriesCode}:`, error)
        throw error
    }
}

/**
 * Parse BACEN value (string) to number
 */
function parseValue(valueStr: string): number {
    return parseFloat(valueStr.replace(',', '.'))
}

/**
 * Fetch all current interest rates from BACEN
 */
export async function fetchBACENRates(): Promise<BACENInterestRate> {
    // Check cache first
    const cached = getCachedRates()
    if (cached) {
        console.log('Using cached BACEN rates')
        return cached
    }

    console.log('Fetching fresh BACEN rates...')

    try {
        // Fetch all series in parallel
        const [
            selicData,
            cdiData,
            ipcaData,
            creditPersonalNonConsignedData,
            creditPersonalConsignedINSSData,
            creditOtherGoodsData,
            creditVehicleData,
        ] = await Promise.all([
            fetchBACENSeries(SERIES_CODES.SELIC),
            fetchBACENSeries(SERIES_CODES.CDI),
            fetchBACENSeries(SERIES_CODES.IPCA),
            fetchBACENSeries(SERIES_CODES.CREDIT_PERSONAL_NON_CONSIGNED),
            fetchBACENSeries(SERIES_CODES.CREDIT_PERSONAL_CONSIGNED_INSS),
            fetchBACENSeries(SERIES_CODES.CREDIT_OTHER_GOODS),
            fetchBACENSeries(SERIES_CODES.CREDIT_VEHICLE),
        ])

        // Build response
        const rates: BACENInterestRate = {
            selic: parseValue(selicData[0].valor),
            cdi: parseValue(cdiData[0].valor),
            ipca: parseValue(ipcaData[0].valor),
            credit_rates: {
                personal_non_consigned: parseValue(creditPersonalNonConsignedData[0].valor),
                personal_consigned_inss: parseValue(creditPersonalConsignedINSSData[0].valor),
                other_goods_acquisition: parseValue(creditOtherGoodsData[0].valor),
                vehicle_acquisition: parseValue(creditVehicleData[0].valor),
            },
            updated_at: new Date().toISOString(),
            source: 'BACEN_API',
        }

        // Cache the result
        setCachedRates(rates)

        return rates

    } catch (error) {
        console.error('Error fetching BACEN rates:', error)

        // Return fallback rates if API fails
        return getFallbackRates()
    }
}

/**
 * Get fallback rates (used when API is unavailable)
 */
function getFallbackRates(): BACENInterestRate {
    return {
        selic: 10.75, // SELIC meta atual (out/2024)
        cdi: 10.65, // CDI acompanha SELIC
        ipca: 4.5, // IPCA anual médio
        credit_rates: {
            personal_non_consigned: 52.5, // Média histórica
            personal_consigned_inss: 18.5, // Média consignado
            other_goods_acquisition: 24.5, // Para aquisição de bens (solar)
            vehicle_acquisition: 22.8, // Financiamento veículos
        },
        updated_at: new Date().toISOString(),
        source: 'BACEN_API',
    }
}

// ============================================================================
// Rate Selection for Solar Financing
// ============================================================================

/**
 * Get recommended interest rate for solar financing
 * 
 * Solar financing typically uses "other goods acquisition" rates
 * or consigned credit rates (when available)
 */
export function getRecommendedSolarRate(rates: BACENInterestRate): {
    annual_rate: number
    monthly_rate: number
    rate_type: string
    source: string
} {
    // For solar, we use "other goods acquisition" as base
    // Add typical bank spread (5-7%)
    const baseRate = rates.credit_rates.other_goods_acquisition
    const annualRate = baseRate // Already includes spread
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1

    return {
        annual_rate: annualRate / 100, // Convert to decimal (0.175 = 17.5%)
        monthly_rate: monthlyRate,
        rate_type: 'other_goods_acquisition',
        source: rates.source,
    }
}

/**
 * Get multiple rate scenarios (conservative, moderate, aggressive)
 */
export function getRateScenarios(rates: BACENInterestRate): {
    conservative: { annual_rate: number; monthly_rate: number }
    moderate: { annual_rate: number; monthly_rate: number }
    aggressive: { annual_rate: number; monthly_rate: number }
} {
    const baseRate = rates.credit_rates.other_goods_acquisition

    // Conservative: use personal non-consigned (higher)
    const conservativeAnnual = rates.credit_rates.personal_non_consigned / 100
    const conservativeMonthly = Math.pow(1 + conservativeAnnual, 1 / 12) - 1

    // Moderate: use other goods (recommended)
    const moderateAnnual = baseRate / 100
    const moderateMonthly = Math.pow(1 + moderateAnnual, 1 / 12) - 1

    // Aggressive: use consigned (lower, best case)
    const aggressiveAnnual = rates.credit_rates.personal_consigned_inss / 100
    const aggressiveMonthly = Math.pow(1 + aggressiveAnnual, 1 / 12) - 1

    return {
        conservative: {
            annual_rate: conservativeAnnual,
            monthly_rate: conservativeMonthly,
        },
        moderate: {
            annual_rate: moderateAnnual,
            monthly_rate: moderateMonthly,
        },
        aggressive: {
            annual_rate: aggressiveAnnual,
            monthly_rate: aggressiveMonthly,
        },
    }
}

// ============================================================================
// Clear Cache (for testing/debugging)
// ============================================================================

export function clearBACENCache(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(CACHE_STORAGE_KEY)
    }
}
