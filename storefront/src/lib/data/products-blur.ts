/**
 * Products Data Layer with Blur Placeholders
 * Server-side data fetching with optimized image placeholders
 */

'use server'
import 'server-only'

import { unstable_cache } from 'next/cache'
import { getBlurPlaceholder, batchGenerateBlurPlaceholders, STATIC_BLUR_PLACEHOLDER } from '@/lib/blur-placeholder'

/**
 * Generate blur placeholder with caching
 * Cache duration: 24 hours (revalidate daily)
 * AWS Lambda optimized: minimizes redundant generations
 */
const getCachedBlurPlaceholder = unstable_cache(
    async (imageUrl: string) => {
        try {
            return await getBlurPlaceholder(imageUrl)
        } catch (error) {
            console.error('[BlurPlaceholder] Failed for URL:', imageUrl, error)
            return STATIC_BLUR_PLACEHOLDER
        }
    },
    ['product-blur-placeholder'],
    {
        revalidate: 86400, // 24 hours
        tags: ['blur-placeholders']
    }
)

/**
 * Enrich single product with blur placeholder
 * Use in Server Components for individual product pages
 */
export async function enrichProductWithBlur<T extends { image_url?: string; processed_images?: any }>(
    product: T
): Promise<T & { blurDataURL: string }> {
    const imageUrl = product.processed_images?.medium ||
        product.processed_images?.thumb ||
        product.image_url

    if (!imageUrl) {
        return { ...product, blurDataURL: STATIC_BLUR_PLACEHOLDER }
    }

    const blurDataURL = await getCachedBlurPlaceholder(imageUrl)
    return { ...product, blurDataURL }
}

/**
 * Enrich multiple products with blur placeholders in parallel
 * Use in Server Components for product grids/catalogs
 * 
 * @example
 * const products = await getProducts()
 * const productsWithBlur = await enrichProductsWithBlur(products)
 * return <ProductGrid products={productsWithBlur} />
 */
export async function enrichProductsWithBlur<T extends {
    id: string
    image_url?: string
    processed_images?: any
}>(
    products: T[]
): Promise<(T & { blurDataURL: string })[]> {
    // Extract image URLs
    const imageUrls = products.map(p =>
        p.processed_images?.medium ||
        p.processed_images?.thumb ||
        p.image_url ||
        ''
    )

    // Generate placeholders in batch with throttling
    // Concurrency = 5 to respect AWS Lambda free tier limits
    const placeholderMap = await batchGenerateBlurPlaceholders(
        imageUrls.filter(url => url !== ''),
        5 // Max 5 parallel Lambda invocations
    )

    // Enrich products with generated placeholders
    return products.map(product => {
        const imageUrl = product.processed_images?.medium ||
            product.processed_images?.thumb ||
            product.image_url

        const blurDataURL = imageUrl
            ? placeholderMap.get(imageUrl) || STATIC_BLUR_PLACEHOLDER
            : STATIC_BLUR_PLACEHOLDER

        return { ...product, blurDataURL }
    })
}

/**
 * Generate blur placeholders for catalog preload
 * Run this in build time or on-demand revalidation
 * 
 * @example
 * // In page.tsx or API route
 * await preloadCatalogBlurPlaceholders(productIds)
 */
export async function preloadCatalogBlurPlaceholders(
    imageUrls: string[]
): Promise<void> {
    console.log(`[BlurPlaceholder] Preloading ${imageUrls.length} placeholders...`)

    const startTime = Date.now()
    await batchGenerateBlurPlaceholders(imageUrls, 5)

    const duration = Date.now() - startTime
    console.log(`[BlurPlaceholder] Preload complete in ${duration}ms`)
}

/**
 * Revalidate blur placeholder cache
 * Call this after updating product images in admin
 */
export async function revalidateBlurPlaceholderCache(): Promise<void> {
    const { revalidateTag } = await import('next/cache')
    revalidateTag('blur-placeholders')
    console.log('[BlurPlaceholder] Cache revalidated')
}
