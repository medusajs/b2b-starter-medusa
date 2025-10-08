/**
 * 🛡️ API Input Validation Utilities
 * 
 * Provides Zod schemas and validation helpers for API endpoints.
 * Ensures type-safe validation with structured error messages.
 * 
 * @module lib/api/validation
 */

import { z } from 'zod'

/**
 * Product categories enum
 */
export const productCategories = [
    'panels',
    'inverters',
    'batteries',
    'structures',
    'cables',
    'accessories',
    'stringboxes'
] as const

/**
 * Distributor enum
 */
export const distributors = [
    'FOTUS',
    'NEOSOLAR',
    'ODEX',
    'SOLFACIL',
    'FORTLEV'
] as const

/**
 * Product category schema
 */
export const ProductCategorySchema = z.enum(productCategories)
export type ProductCategory = z.infer<typeof ProductCategorySchema>

/**
 * Distributor schema
 */
export const DistributorSchema = z.enum(distributors)
export type Distributor = z.infer<typeof DistributorSchema>

/**
 * Pagination schema
 */
export const PaginationSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0)
})

/**
 * Price range base fields
 */
const priceRangeFields = {
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional()
}

/**
 * Search query schema
 */
export const SearchQuerySchema = z.object({
    q: z.string().min(2, "Search query must be at least 2 characters").max(100),
    category: ProductCategorySchema.optional(),
    ...PaginationSchema.shape
})

/**
 * Products query schema
 */
export const ProductsQuerySchema = z.object({
    category: ProductCategorySchema,
    distributor: DistributorSchema.optional(),
    manufacturer: z.string().min(1).max(100).optional(),
    search: z.string().min(2).max(100).optional(),
    ...PaginationSchema.shape,
    ...priceRangeFields
}).refine(
    (data) => !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice,
    { message: "minPrice must be less than or equal to maxPrice" }
)

export type ProductsQuery = z.infer<typeof ProductsQuerySchema>

/**
 * Kits query schema
 */
export const KitsQuerySchema = z.object({
    distributor: DistributorSchema.optional(),
    minPower: z.coerce.number().min(0).optional(),
    maxPower: z.coerce.number().min(0).optional(),
    search: z.string().min(2).max(100).optional(),
    ...PaginationSchema.shape,
    ...priceRangeFields
}).refine(
    (data) => {
        const validPrice = !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice
        const validPower = !data.minPower || !data.maxPower || data.minPower <= data.maxPower
        return validPrice && validPower
    },
    { message: "Min values must be less than or equal to max values" }
)export type KitsQuery = z.infer<typeof KitsQuerySchema>

/**
 * Product ID param schema
 */
export const ProductIdSchema = z.object({
    id: z.string().min(1, "Product ID is required")
})

/**
 * Kit ID param schema
 */
export const KitIdSchema = z.object({
    id: z.string().min(1, "Kit ID is required")
})

/**
 * Solar simulation schema
 */
export const SolarSimulationSchema = z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    systemPower: z.number().min(0.1).optional(),
    tilt: z.number().min(0).max(90).optional(),
    azimuth: z.number().min(-180).max(180).optional(),
    monthlyConsumption: z.number().min(0).optional()
})

export type SolarSimulation = z.infer<typeof SolarSimulationSchema>

/**
 * Geocoding schema
 */
export const GeocodingSchema = z.object({
    address: z.string().min(5).max(200).optional(),
    cep: z.string().regex(/^\d{5}-?\d{3}$/).optional(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().length(2).optional()
}).refine(
    (data) => data.address || data.cep || (data.city && data.state),
    { message: "Must provide address, cep, or city+state" }
)

export type Geocoding = z.infer<typeof GeocodingSchema>

/**
 * Validation result type
 */
export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; error: z.ZodError }

/**
 * Validate query parameters from URLSearchParams
 */
export function validateQuery<T>(
    schema: z.ZodSchema<T>,
    searchParams: URLSearchParams
): ValidationResult<T> {
    const params = Object.fromEntries(searchParams.entries())
    const result = schema.safeParse(params)

    if (!result.success) {
        return { success: false, error: result.error }
    }

    return { success: true, data: result.data }
}

/**
 * Validate request body (JSON)
 */
export async function validateBody<T>(
    schema: z.ZodSchema<T>,
    request: Request
): Promise<ValidationResult<T>> {
    try {
        const body = await request.json()
        const result = schema.safeParse(body)

        if (!result.success) {
            return { success: false, error: result.error }
        }

        return { success: true, data: result.data }
    } catch (error) {
        // Invalid JSON
        return {
            success: false,
            error: new z.ZodError([
                {
                    code: 'custom',
                    path: [],
                    message: 'Invalid JSON in request body'
                }
            ])
        }
    }
}

/**
 * Validate path parameters
 */
export function validateParams<T>(
    schema: z.ZodSchema<T>,
    params: Record<string, string>
): ValidationResult<T> {
    const result = schema.safeParse(params)

    if (!result.success) {
        return { success: false, error: result.error }
    }

    return { success: true, data: result.data }
}

/**
 * Format Zod errors for API response
 */
export function formatZodError(error: z.ZodError) {
    return {
        issues: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code
        })),
        message: error.errors[0]?.message || 'Validation failed'
    }
}

/**
 * Helper to get validation error message
 */
export function getValidationErrorMessage(error: z.ZodError): string {
    const firstError = error.errors[0]
    if (!firstError) return 'Validation failed'

    const path = firstError.path.join('.')
    return path ? `${path}: ${firstError.message}` : firstError.message
}
