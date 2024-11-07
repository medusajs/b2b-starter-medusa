import { convertToLocale } from "@lib/util/money"
import repeat from "@lib/util/repeat"
import { StoreCartLineItem } from "@medusajs/types"
import { Container, Text } from "@medusajs/ui"
import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"
import { B2BCart } from "types/global"

type ItemsTemplateProps = {
  cart: B2BCart
  showBorders?: boolean
  showTotal?: boolean
}

const ItemsTemplate = ({
  cart,
  showBorders = true,
  showTotal = true,
}: ItemsTemplateProps) => {
  const items = cart?.items

  return (
    <div className="w-full flex flex-col gap-y-2">
      <div className="flex flex-col gap-y-2 w-full">
        {items
          ? items.map((item: StoreCartLineItem) => {
              return (
                <Item
                  showBorders={showBorders}
                  key={item.id}
                  item={
                    item as StoreCartLineItem & {
                      metadata?: { note?: string }
                    }
                  }
                />
              )
            })
          : repeat(5).map((i) => {
              return <SkeletonLineItem key={i} />
            })}
      </div>
      {showTotal && (
        <Container>
          <div className="flex items-start justify-between h-full self-stretch">
            <Text>Total: {items?.length} items</Text>
            <Text>
              {convertToLocale({
                amount: cart?.item_subtotal,
                currency_code: cart?.currency_code,
              })}
            </Text>
          </div>
        </Container>
      )}
    </div>
  )
}

export default ItemsTemplate
