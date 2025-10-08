/**
 * 📚 API Utilities - Example Usage
 * 
 * Demonstrates how to use ResponseBuilder, validation, and cache
 * in API route handlers.
 * 
 * @module lib/api/example
 */

import { NextRequest } from 'next/server'
import { createResponseBuilder } from './response'
import { validateQuery, ProductsQuerySchema, formatZodError } from './validation'
import { CacheManager, CacheKeys, CacheTTL } from '../cache/redis'

/**
 * Example: Products API with best practices
 * 
 * GET /api/catalog/products
 * 
 * Features:
 * - Request ID tracking
 * - Input validation with Zod
 * - Distributed caching
 * - Standardized responses
 * - Error handling
 * - Performance monitoring
 */
export async function GET_example(request: NextRequest) {
    // 1. Create response builder (tracks timing + request ID)
    const response = createResponseBuilder(request)

    try {
        // 2. Extract and validate query parameters
        const { searchParams } = new URL(request.url)
        const validation = validateQuery(ProductsQuerySchema, searchParams)

        if (!validation.success) {
            // Return 400 with structured error
            return response.validationError(
                'Invalid query parameters',
                formatZodError(validation.error)
            )
        }

        const { category, limit, offset, distributor, search } = validation.data

        // 3. Build cache key
        const cacheKey = CacheKeys.products(category, {
            limit,
            offset,
            distributor,
            search
        })

        // 4. Try cache first
        const cached = await CacheManager.get(cacheKey)
        if (cached) {
            return response.success(cached, { cached: true })
        }

        // 5. Load data (example - replace with actual data loading)
        const data = await loadProductsFromDatabase({
            category,
            limit,
            offset,
            distributor,
            search
        })

        // 6. Cache the result
        await CacheManager.set(cacheKey, data, CacheTTL.PRODUCTS)

        // 7. Return success response
        return response.success(data, {
            headers: {
                'Cache-Control': `public, s-maxage=${CacheTTL.PRODUCTS}, stale-while-revalidate=${CacheTTL.PRODUCTS * 2}`
            }
        })

    } catch (error) {
        // 8. Handle errors with context
        console.error('[Products API] Error:', {
            requestId: response.getRequestId(),
            error: error instanceof Error ? error.message : 'Unknown error'
        })

        // Send to error tracking (e.g., Sentry)
        // captureAPIError(error, { endpoint: '/api/catalog/products', ... })

        return response.error(
            'PRODUCTS_LOAD_FAILED',
            'Failed to load products',
            {
                status: 500,
                includeStack: true // Only in dev
            }
        )
    }
}

/**
 * Example: POST endpoint with body validation
 * 
 * POST /api/onboarding/simulate
 */
export async function POST_example(request: NextRequest) {
    const response = createResponseBuilder(request)

    try {
        // Validate request body
        const body = await request.json()
        // const validation = validateBody(SolarSimulationSchema, body)

        // if (!validation.success) {
        //   return response.validationError(
        //     'Invalid request body',
        //     formatZodError(validation.error)
        //   )
        // }

        // Process simulation...
        const result = { /* ... */ }

        return response.success(result, { status: 201 })

    } catch (error) {
        if (error instanceof SyntaxError) {
            return response.error(
                'INVALID_REQUEST_BODY',
                'Invalid JSON in request body',
                { status: 400 }
            )
        }

        return response.error(
            'SIMULATION_FAILED',
            'Failed to run simulation',
            { status: 500 }
        )
    }
}

/**
 * Example: Cache invalidation
 */
export async function invalidateProductsCache(category?: string) {
    if (category) {
        // Invalidate specific category
        const pattern = `products:${category}*`
        const count = await CacheManager.invalidate(pattern)
        console.log(`[Cache] Invalidated ${count} keys for category ${category}`)
    } else {
        // Invalidate all products
        const count = await CacheManager.invalidate('products:*')
        console.log(`[Cache] Invalidated ${count} product keys`)
    }
}

/**
 * Mock data loading function (replace with actual implementation)
 */
async function loadProductsFromDatabase(filters: any) {
    // This would call Prisma or read from JSON files
    return {
        products: [],
        pagination: {
            total: 0,
            limit: filters.limit,
            offset: filters.offset,
            hasMore: false
        }
    }
}
