import PreviouslyPurchasedProduct from "@/modules/account/components/previously-purchased/product"
import { HttpTypes } from "@medusajs/types"

type PreviouslyPurchasedProps = {
  orders: HttpTypes.StoreOrder[]
}

const PreviouslyPurchasedProducts = ({ orders }: PreviouslyPurchasedProps) => {
  const variants = Array.from(
    new Map(
      orders.flatMap(
        (order) => order.items?.map((item) => [item.variant_id, item]) ?? []
      )
    ).values()
  )

  return variants.map((variant) => (
    <PreviouslyPurchasedProduct variant={variant} key={variant.variant_id} />
  ))
}

export default PreviouslyPurchasedProducts
