import {
  CheckCircleSolid,
  ExclamationCircleSolid,
  InformationCircleSolid,
} from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { B2BCustomer } from "@/types"

const ProductFacts = ({ 
  product,
  customer 
}: { 
  product: HttpTypes.StoreProduct
  customer: B2BCustomer | null 
}) => {
  const inventoryQuantity =
    product.variants?.reduce(
      (acc, variant) => acc + (variant.inventory_quantity ?? 0),
      0
    ) || 0

  const isLoggedIn = !!customer
  const isApproved = !!customer?.metadata?.approved

  return (
    <div className="flex flex-col gap-y-2 w-full">
      {isLoggedIn && isApproved ? (
        <span className="flex items-center gap-x-2 text-neutral-600 text-sm">
          {inventoryQuantity < 100 ? `< 100` : `100+`} in stock
        </span>
      ) : (
        <span className="flex items-center gap-x-2 text-neutral-600 text-sm">
          {!isLoggedIn ? "Please log in to view stock" : "Contact us for stock"}
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
