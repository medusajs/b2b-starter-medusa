/**
 * SEO Metadata Generation Utilities
 * Generates consistent metadata for all pages
 */

import { Metadata } from 'next'

export interface PageMetadata {
  title: string
  description: string
  canonical?: string
  image?: string
  noindex?: boolean
}

const SITE_NAME = 'Yello Solar Hub'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yellosolarhub.com'
const DEFAULT_IMAGE = `${SITE_URL}/images/og-default.jpg`

export function generateMetadata(page: PageMetadata): Metadata {
  const fullTitle = `${page.title} | ${SITE_NAME}`
  const canonical = page.canonical || SITE_URL
  const image = page.image || DEFAULT_IMAGE

  return {
    title: fullTitle,
    description: page.description,
    ...(page.noindex && { robots: { index: false, follow: false } }),
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description: page.description,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: page.description,
      images: [image],
    },
  }
}

export function generateProductMetadata(product: {
  title: string
  description?: string
  thumbnail?: string
  handle: string
}): Metadata {
  return generateMetadata({
    title: product.title,
    description: product.description || `Compre ${product.title} na Yello Solar Hub`,
    canonical: `${SITE_URL}/br/products/${product.handle}`,
    image: product.thumbnail,
  })
}

export function generateCategoryMetadata(category: {
  name: string
  description?: string
  handle: string
}): Metadata {
  return generateMetadata({
    title: category.name,
    description: category.description || `Explore produtos em ${category.name}`,
    canonical: `${SITE_URL}/br/categories/${category.handle}`,
  })
}
