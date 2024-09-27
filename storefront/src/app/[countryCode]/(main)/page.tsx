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
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-center p-4 text-center bg-zinc-900 font-[--font-geist-sans] gap-2">
        <InformationCircle className="inline" color="white" />
        <span className="text-white mr-2">
          Favorites at a great price! For a limited time only.
        </span>

        <LocalizedClientLink
          className="hover:text-ui-fg-base text-blue-400"
          href="/"
        >
          Go to Products <ArrowUpRightMini className="inline text-blue-400" />
        </LocalizedClientLink>
      </div>
      <Hero />

      <FeaturedProducts collections={collections} region={region} />
    </div>
  )
}
