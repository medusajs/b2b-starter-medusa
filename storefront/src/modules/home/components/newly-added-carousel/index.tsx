import { listProducts } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import Product from "@/modules/products/components/product-preview"
import { B2BCustomer } from "@/types"
import { getCollectionByHandle } from "@/lib/data/collections"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { ChevronRight } from "@medusajs/icons"

type NewlyAddedCarouselProps = {
  countryCode: string
  customer: B2BCustomer | null
}

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  customer_group_id?: string
}

export default async function NewlyAddedCarousel({
  countryCode,
  customer,
}: NewlyAddedCarouselProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // First get the collection by handle
  const collection = await getCollectionByHandle("newly-added")

  if (!collection) {
    return null
  }

  // Then get products from that collection
  const { response } = await listProducts({
    queryParams: {
      collection_id: [collection.id],
      limit: 8,
    } as PaginatedProductsParams,
    countryCode,
  })

  if (!response.products.length) {
    return null
  }

  const minimalCustomer = customer ? {
    ...customer,
    isLoggedIn: true,
    isApproved: !!customer.metadata?.approved
  } : null

  return (
    <div className="flex flex-col gap-y-4 py-4 small:px-24 px-6 bg-neutral-100">
      <div className="flex justify-between items-center">
        <Heading level="h2" className="text-lg text-neutral-950 font-normal">
          Newly Added Products
        </Heading>
        <LocalizedClientLink 
          href={`/collections/${collection.handle}`}
          className="flex items-center gap-x-1 text-sm text-blue-600 hover:text-blue-800 font-sans"
        >
          View All
          <span aria-hidden="true" className="text-xl">↗</span>
        </LocalizedClientLink>
      </div>
      <div className="relative">
        <div className="overflow-x-auto pb-2 -mx-6 px-6">
          <div className="flex gap-x-4 min-w-max">
            {response.products.map((product) => (
              <div key={product.id} className="w-[280px] flex-shrink-0">
                <Product
                  product={product}
                  region={region}
                  customer={minimalCustomer}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 