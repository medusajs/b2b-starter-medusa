import { Metadata } from "next"

import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { ArrowUpRightMini, InformationCircle } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
}

export default async function Home({
  params: { countryCode },
}: {
  params: { countryCode: string }
}) {
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  if (!collections || !region) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-2 m-2">
      <Hero />
      <FeaturedProducts collections={collections} region={region} />
    </div>
  )
}
