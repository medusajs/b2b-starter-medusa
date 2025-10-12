/**
 * Example: Product Catalog Page with Blur Placeholders
 * Server Component pattern with enrichProductsWithBlur helper
 */

import { enrichProductsWithBlur } from '@/lib/data/products-blur'
import ProductCard from '@/modules/catalog/components/ProductCard'

// Mock product fetcher (replace with actual Medusa SDK call)
async function getProducts() {
  // In production: const products = await sdk.store.products.list()
  return [
    {
      id: 'prod_123',
      name: 'Painel Solar 550W',
      sku: 'PS-550-MONO',
      price_brl: 850_00,
      manufacturer: 'JA Solar',
      model: 'JAM72S30-550/MR',
      kwp: 0.55,
      efficiency_pct: 21.2,
      tier_recommendation: ['PP'],
      image_url: 'https://example.com/product.jpg',
      processed_images: {
        thumb: 'https://example.com/thumb.jpg',
        medium: 'https://example.com/medium.jpg',
        large: 'https://example.com/large.jpg',
      }
    },
    // ... more products
  ]
}

/**
 * Products Page (Server Component)
 * Automatically generates blur placeholders for all products
 */
export default async function ProductsPage() {
  // 1. Fetch products from Medusa
  const products = await getProducts()
  
  // 2. Enrich with blur placeholders (parallel generation + cache)
  const productsWithBlur = await enrichProductsWithBlur(products)
  
  // 3. Render with ProductCard (now has blurDataURL prop)
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Catálogo de Produtos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productsWithBlur.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            category="panels"
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Alternative: Single Product Page
 * Use enrichProductWithBlur for individual products
 */
import { enrichProductWithBlur } from '@/lib/data/products-blur'

export async function ProductDetailPage({ params }: { params: { id: string } }) {
  // 1. Fetch single product
  const product = await getProductById(params.id)
  
  // 2. Enrich with blur placeholder
  const productWithBlur = await enrichProductWithBlur(product)
  
  // 3. Render product detail
  return (
    <div>
      <ProductCard product={productWithBlur} />
      {/* Rest of product detail UI */}
    </div>
  )
}

async function getProductById(id: string) {
  // Mock implementation
  return {
    id,
    name: 'Product Name',
    image_url: 'https://example.com/product.jpg',
    // ... other fields
  }
}

/**
 * Performance Notes:
 * 
 * 1. **Caching**: unstable_cache stores placeholders for 24h
 *    - First request: generates placeholder (~50-100ms)
 *    - Subsequent requests: reads from cache (~1ms)
 * 
 * 2. **Batch Processing**: enrichProductsWithBlur uses concurrency=5
 *    - Respects AWS Lambda free tier (1M requests/month)
 *    - Prevents throttling on large catalogs
 * 
 * 3. **Fallback**: STATIC_BLUR_PLACEHOLDER on error
 *    - Ensures page always renders (never breaks)
 * 
 * 4. **Revalidation**: Call revalidateBlurPlaceholderCache() 
 *    - After updating product images in admin
 *    - Clears cache and regenerates on next request
 */

/**
 * Build-time Optimization:
 * Generate all placeholders during build for static pages
 */
export async function generateStaticParams() {
  const products = await getProducts()
  
  // Preload blur placeholders for all products
  const imageUrls = products.map(p => 
    p.processed_images?.medium || p.image_url
  ).filter(Boolean) as string[]
  
  await import('@/lib/data/products-blur').then(m => 
    m.preloadCatalogBlurPlaceholders(imageUrls)
  )
  
  return products.map(p => ({ id: p.id }))
}
