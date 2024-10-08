import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"

import LineItemOptions from "@modules/common/components/line-item-options"
import Thumbnail from "@modules/products/components/thumbnail"
import ItemTotalPrice from "./item-total-price"
import ItemUnitPrice from "./item-unit-price"

type ItemProps = {
  item: HttpTypes.StoreOrderLineItem
  order: HttpTypes.StoreOrder
}

const Item = ({ item, order }: ItemProps) => {
  return (
    <Table.Row
      className="border-none justify-between"
      data-testid="product-row"
    >
      <Table.Cell className="!pl-0 p-4 w-24">
        <div className="flex w-16">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-name"
        >
          {item.title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span className="!pr-0 flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-1 ">
            <Text className="text-ui-fg-muted">
              <span data-testid="product-quantity">{item.quantity}</span>x{" "}
            </Text>
            <ItemUnitPrice item={item} style="tight" />
          </span>

          <ItemTotalPrice item={item} currencyCode={order.currency_code} />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
