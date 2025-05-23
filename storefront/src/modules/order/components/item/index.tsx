import { HttpTypes } from "@medusajs/types"
import { Text, Table } from "@medusajs/ui"

import LineItemOptions from "@/modules/common/components/line-item-options"
import Thumbnail from "@/modules/products/components/thumbnail"
import { convertToLocale } from "@/lib/util/money"

type ItemProps = {
  item: HttpTypes.StoreOrderLineItem
  order: HttpTypes.StoreOrder
}

const Item = ({ item, order }: ItemProps) => {
  return (
    <Table.Row className="flex gap-x-4">
      <Table.Cell className="w-20">
        <Thumbnail thumbnail={item.thumbnail} size="square" />
      </Table.Cell>
      <Table.Cell className="flex-1">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{item.title}</span>
          <span className="text-sm text-gray-500">
            {item.variant?.title}
          </span>
        </div>
      </Table.Cell>
      <Table.Cell className="text-right">
        <span className="text-sm font-medium">
          {item.quantity} x {convertToLocale({
            amount: item.unit_price,
            currency_code: order.currency_code,
          })}
        </span>
      </Table.Cell>
      <Table.Cell className="text-right">
        <span className="text-sm font-medium">
          {convertToLocale({
            amount: item.subtotal,
            currency_code: order.currency_code,
          })}
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
