/**
 * Blur Placeholder Generator
 * Creates optimized data URIs for next/image blurDataURL
 * AWS Lambda free tier optimized: 1M requests/month, 400K GB-seconds compute
 */

import { getPlaiceholder } from 'plaiceholder'

/**
 * Generate blur placeholder from image URL
 * Uses plaiceholder for server-side generation
 * @param src Image URL (remote or local)
 * @returns base64 data URI for blurDataURL prop
 */
export async function getBlurPlaceholder(src: string): Promise<string> {
    try {
        // For remote images, use plaiceholder's buffer method
        const buffer = await fetch(src).then(async (res) =>
            Buffer.from(await res.arrayBuffer())
        )

        const { base64 } = await getPlaiceholder(buffer, {
            size: 10, // Very small for blur effect (reduces Lambda compute)
        })

        return base64
    } catch (error) {
        console.error('[BlurPlaceholder] Failed to generate:', src, error)
        // Fallback: return minimal gray placeholder
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4='
    }
}

/**
 * Generate blur placeholder from buffer (for local images)
 * Use this when you already have image buffer in memory
 */
export async function getBlurPlaceholderFromBuffer(
    buffer: Buffer
): Promise<string> {
    try {
        const { base64 } = await getPlaiceholder(buffer, { size: 10 })
        return base64
    } catch (error) {
        console.error('[BlurPlaceholder] Failed from buffer:', error)
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4='
    }
}

/**
 * Batch generate blur placeholders with concurrency limit
 * Prevents AWS Lambda throttling
 * @param urls Array of image URLs
 * @param concurrency Max parallel requests (default: 5)
 */
export async function batchGenerateBlurPlaceholders(
    urls: string[],
    concurrency = 5
): Promise<Map<string, string>> {
    const results = new Map<string, string>()
    const chunks: string[][] = []

    // Split into chunks
    for (let i = 0; i < urls.length; i += concurrency) {
        chunks.push(urls.slice(i, i + concurrency))
    }

    // Process chunks sequentially
    for (const chunk of chunks) {
        const promises = chunk.map(async (url) => {
            const placeholder = await getBlurPlaceholder(url)
            results.set(url, placeholder)
        })

        await Promise.all(promises)
    }

    return results
}

/**
 * Static blur placeholder for fallback
 * Use when generation fails or for static assets
 */
export const STATIC_BLUR_PLACEHOLDER =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4='

/**
 * Generate placeholder from RGB color
 * Useful for brand-colored placeholders
 */
export function colorPlaceholder(r: number, g: number, b: number): string {
    const color = `rgb(${r},${g},${b})`
    return `data:image/svg+xml;base64,${Buffer.from(
        `<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="${color}"/></svg>`
    ).toString('base64')}`
}

/**
 * Cache blur placeholders in production
 * Use with Next.js unstable_cache or Redis
 */
export function getCacheKey(url: string): string {
    // Simple hash for cache key
    return `blur:${Buffer.from(url).toString('base64').slice(0, 32)}`
}
