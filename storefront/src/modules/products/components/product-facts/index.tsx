import {
  CheckCircleSolid,
  ExclamationCircleSolid,
  InformationCircleSolid,
} from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"

const ProductFacts = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const inventoryQuantity =
    product.variants?.reduce(
      (acc, variant) => acc + (variant.inventory_quantity ?? 0),
      0
    ) || 0

  return (
    <div className="flex flex-col gap-y-2 w-full">
      {inventoryQuantity > 10 ? (
        <span className="flex items-center gap-x-2 text-neutral-600 text-sm">
          <CheckCircleSolid className="text-green-500" /> Can be shipped
          immediately ({inventoryQuantity} in stock)
        </span>
      ) : (
        <span className="flex items-center gap-x-2 text-neutral-600 text-sm ">
          <ExclamationCircleSolid className="text-orange-500" />
          Limited quantity available ({inventoryQuantity} in stock)
        </span>
      )}
      <span className="flex items-center gap-x-2 text-neutral-600 text-sm">
        {product.mid_code && (
          <>
            <InformationCircleSolid />
            MID: {product.mid_code}
          </>
        )}
      </span>
    </div>
  )
}

export default ProductFacts
