import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"
import { getProductByHandle } from "@/lib/data/products"
import { getRegion, listRegions } from "@/lib/data/regions"
import ProductTemplate from "@/modules/products/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const dynamicParams = true

type Props = {
  params: { countryCode: string; handle: string }
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const { products } = await sdk.store.product.list(
      { fields: "handle" },
      { next: { tags: ["products"] }, ...(await getAuthHeaders()) }
    )

    return countryCodes
      .map((countryCode) =>
        products.map((product) => ({
          countryCode,
          handle: product.handle,
        }))
      )
      .flat()
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const product = await getProductByHandle(handle, region.id)

  if (!product) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yellosolarhub.com'
  const productUrl = `${baseUrl}/${countryCode}/products/${handle}`
  const description = product.description || `${product.title} - Energia solar de qualidade`

  return {
    title: `${product.title} | Yello Solar Hub`,
    description: description.slice(0, 160),
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.title} | Yello Solar Hub`,
      description,
      url: productUrl,
      type: 'website',
      images: product.thumbnail ? [{
        url: product.thumbnail,
        width: 1200,
        height: 630,
        alt: product.title,
      }] : [],
      siteName: 'Yello Solar Hub',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Yello Solar Hub`,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle(params.handle, region.id)
  if (!pricedProduct) {
    notFound()
  }

  // JSON-LD structured data para SEO
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yellosolarhub.com'
  const productUrl = `${baseUrl}/${params.countryCode}/products/${params.handle}`
  const price = pricedProduct.variants?.[0]?.calculated_price?.calculated_amount

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pricedProduct.title,
    description: pricedProduct.description || pricedProduct.title,
    image: pricedProduct.thumbnail || '',
    url: productUrl,
    sku: pricedProduct.variants?.[0]?.sku || '',
    brand: {
      '@type': 'Brand',
      name: 'Yello Solar Hub',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: region.currency_code?.toUpperCase() || 'BRL',
      price: price ? (price / 100).toFixed(2) : undefined,
      availability: pricedProduct.variants?.[0]?.inventory_quantity ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Yello Solar Hub',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
      />
    </>
  )
}
