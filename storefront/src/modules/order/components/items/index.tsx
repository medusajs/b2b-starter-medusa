import repeat from "@/lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table } from "@medusajs/ui"

import Item from "@/modules/order/components/item"
import SkeletonLineItem from "@/modules/skeletons/components/skeleton-line-item"

type ItemsProps = {
  items: HttpTypes.StoreOrderLineItem[] | null
  order: HttpTypes.StoreOrder
}

const Items = ({ items, order }: ItemsProps) => {
  return (
    <div className="flex flex-col">
      <Table>
        <Table.Body data-testid="products-table" className="border-none">
          {items?.length
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return <Item key={item.id} item={item} order={order} />
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default Items
