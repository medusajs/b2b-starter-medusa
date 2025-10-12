/**
 * Example: Product Card with Blur Placeholders
 * Server Component Pattern - Generate placeholders at build/request time
 */

import { getBlurPlaceholder, STATIC_BLUR_PLACEHOLDER } from "@/lib/blur-placeholder"
import ProductCard from "./ProductCard"

interface ProductWithBlur {
    id: string
    name: string
    image_url?: string
    processed_images?: {
        thumb: string
        medium: string
        large: string
    }
    blurDataURL?: string
    // ... other ProductCard props
}

/**
 * Server Component: Fetch products and generate blur placeholders
 * Call this in page.tsx or layout.tsx (Server Components)
 */
export async function ProductListWithBlur({
    products
}: {
    products: ProductWithBlur[]
}) {
    // Generate blur placeholders for all products in parallel
    const productsWithBlur = await Promise.all(
        products.map(async (product) => {
            const imageUrl = product.processed_images?.medium ||
                product.processed_images?.thumb ||
                product.image_url

            if (!imageUrl) {
                return { ...product, blurDataURL: STATIC_BLUR_PLACEHOLDER }
            }

            try {
                // Generate blur placeholder (cached in production)
                const blurDataURL = await getBlurPlaceholder(imageUrl)
                return { ...product, blurDataURL }
            } catch (error) {
                console.error('[BlurPlaceholder] Failed for', product.id, error)
                return { ...product, blurDataURL: STATIC_BLUR_PLACEHOLDER }
            }
        })
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsWithBlur.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                // Pass blurDataURL to ProductCard's Image component
                />
            ))}
        </div>
    )
}

/**
 * Usage in page.tsx:
 * 
 * export default async function ProductsPage() {
 *   const products = await getProducts()
 *   return <ProductListWithBlur products={products} />
 * }
 */

/**
 * Alternative: Generate blur placeholders in API route
 * For dynamic product feeds or client-side rendering
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const productIds = searchParams.get('ids')?.split(',') || []

    // Fetch products from Medusa
    const products: any[] = [] // await medusaClient.products.list({ id: productIds })

    // Generate blur placeholders
    const productsWithBlur = await Promise.all(
        products.map(async (product: any) => {
            const imageUrl = product.thumbnail
            if (!imageUrl) return product

            const blurDataURL = await getBlurPlaceholder(imageUrl)
            return { ...product, blurDataURL }
        })
    )

    return Response.json({ products: productsWithBlur })
}
