import { HttpTypes } from "@medusajs/types"
import Product from "./product"
import { getProductPrice } from "@lib/util/get-product-price"

type PreviouslyPurchasedProps = {
  orders: HttpTypes.StoreOrder[]
}

const PreviouslyPurchased = ({ orders }: PreviouslyPurchasedProps) => {
  const variants = Array.from(
    new Map(
      orders.flatMap(
        (order) =>
          order.items?.map((item) => [
            item.variant_id,
            {
              variant_id: item.variant_id,
              item_title: item.title,
              product_title: item.product_title,
              thumbnail: item.thumbnail,
              product_handle: item.product_handle,
            },
          ]) ?? []
      )
    ).values()
  )

  return variants.map((variant) => (
    <Product variant={variant} key={variant.variant_id} />
  ))
}

export default PreviouslyPurchased
