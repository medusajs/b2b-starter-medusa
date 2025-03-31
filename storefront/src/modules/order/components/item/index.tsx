import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import LineItemOptions from "@/modules/common/components/line-item-options"
import Thumbnail from "@/modules/products/components/thumbnail"
import ItemTotalPrice from "./item-total-price"

type ItemProps = {
  item: HttpTypes.StoreOrderLineItem
  order: HttpTypes.StoreOrder
}

const Item = ({ item, order }: ItemProps) => {
  return (
    <tr className="flex gap-x-4">
      <td className="w-20">
        <Thumbnail thumbnail={item.thumbnail} size="square" />
      </td>

      <td className="flex flex-col w-full">
        <div>
          <Text className="font-normal" data-testid="product-name">
            {item.product_title}
          </Text>

          <LineItemOptions
            variant={item.variant}
            data-testid="product-variant"
          />
        </div>

        <div className="flex justify-between w-full">
          <div>
            <Text className="text-xs">
              <span data-testid="product-quantity">{item.quantity}</span>x{" "}
            </Text>
          </div>

          <div></div>

          <div>
            <ItemTotalPrice item={item} currencyCode={order.currency_code} />
          </div>
        </div>
      </td>
    </tr>
  )
}

export default Item
