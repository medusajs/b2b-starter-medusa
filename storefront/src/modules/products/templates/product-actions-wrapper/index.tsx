import { getProductsById } from "@/lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@/modules/products/components/product-actions"
import { B2BCustomer } from "@/types"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
  customer,
}: {
  id: string
  region: HttpTypes.StoreRegion
  customer: B2BCustomer | null
}) {
  const [product] = await getProductsById({
    ids: [id],
    regionId: region.id,
  })

  if (!product) {
    return null
  }

  return <ProductActions product={product} region={region} customer={customer} />
}
