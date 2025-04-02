import { listProducts } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductParams & {
    tags?: string[]
  } = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-6 small:py-16 py-6 small:px-24 px-6 bg-neutral-100">
      <Heading level="h2" className="text-xl text-neutral-950 font-normal">
        Other customers also viewed
      </Heading>
      <ul className="grid grid-cols-1 small:grid-cols-3 medium:grid-cols-4 gap-x-2 gap-y-8">
        {products.map((product) => (
          <li key={product.id}>
            <Product region={region} product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
