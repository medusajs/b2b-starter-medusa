import { listRegions } from "@/lib/data/regions"
import FeaturedProducts from "@/modules/home/components/featured-products"
import Hero from "@/modules/home/components/hero"
import NewlyAddedCarousel from "@/modules/home/components/newly-added-carousel"
import SkeletonFeaturedProducts from "@/modules/skeletons/templates/skeleton-featured-products"
import { Metadata } from "next"
import { Suspense } from "react"
import { retrieveCustomer } from "@/lib/data/customer"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

export const dynamicParams = true

export const metadata: Metadata = {
  title: "Batteries N' Things",
  description:
    "Batteries N' Things provide premium technology products at the best prices in the country.",
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )
  return countryCodes.map((countryCode) => ({ countryCode }))
}

export default async function Home({ params: { countryCode } }: { params: { countryCode: string } }) {
  const customer = await retrieveCustomer()

  return (
    <div className="flex flex-col gap-y-8">
      <Hero />
      <Suspense fallback={null}>
        <NewlyAddedCarousel countryCode={countryCode} customer={customer} />
      </Suspense>
      <div className="flex justify-center mt-4">
        <LocalizedClientLink
          href="/store"
          className="flex items-center gap-x-2 text-blue-600 hover:text-blue-800 text-lg font-medium font-sans"
        >
          Explore all products
          <span aria-hidden="true" className="text-xl">↗</span>
        </LocalizedClientLink>
      </div>
      {/* <Suspense fallback={null}>
        <FeaturedProducts countryCode={countryCode} />
      </Suspense> */}
    </div>
  )
}
export const dynamic = "force-dynamic"
