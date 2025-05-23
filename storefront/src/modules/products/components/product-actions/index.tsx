"use client"

import { HttpTypes } from "@medusajs/types"
import ProductPrice from "../product-price"
import ProductVariantsTable from "../product-variants-table"
import { B2BCustomer } from "@/types"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  customer: B2BCustomer | null
}

export default function ProductActions({
  product,
  region,
  customer,
}: ProductActionsProps) {
  return (
    <>
      <div className="flex flex-col gap-y-2 w-full">
        <ProductPrice product={product} customer={customer} />
        <ProductVariantsTable product={product} region={region} customer={customer} />
      </div>
    </>
  )
}
