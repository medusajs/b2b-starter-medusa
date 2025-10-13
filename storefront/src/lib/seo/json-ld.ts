/**
 * JSON-LD Schema Generation for SEO
 * Implements schema.org structured data
 */

export interface ProductJsonLd {
  name: string
  description?: string
  image?: string
  sku?: string
  brand?: string
  offers: {
    price: number
    priceCurrency: string
    availability: string
    url?: string
  }
}

export function generateProductJsonLd(product: ProductJsonLd): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description && { description: product.description }),
    ...(product.image && { image: product.image }),
    ...(product.sku && { sku: product.sku }),
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    offers: {
      "@type": "Offer",
      price: product.offers.price,
      priceCurrency: product.offers.priceCurrency,
      availability: `https://schema.org/${product.offers.availability}`,
      ...(product.offers.url && { url: product.offers.url }),
    },
  }

  return JSON.stringify(schema)
}

export interface BreadcrumbJsonLd {
  items: Array<{
    name: string
    url: string
  }>
}

export function generateBreadcrumbJsonLd(breadcrumb: BreadcrumbJsonLd): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumb.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return JSON.stringify(schema)
}
