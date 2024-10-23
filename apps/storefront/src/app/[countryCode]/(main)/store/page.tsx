import { listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
  params: {
    countryCode: string
  }
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  if (!countryCodes) {
    return null
  }

  const categories = await listCategories()

  const staticParams = countryCodes
    ?.map((countryCode) =>
      categories.map((category) => ({
        countryCode,
        handle: category.handle,
      }))
    )
    .flat()

  return staticParams
}

export default async function StorePage({ searchParams, params }: Params) {
  const { sortBy, page } = searchParams

  const categories = await listCategories()

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      categories={categories}
    />
  )
}
