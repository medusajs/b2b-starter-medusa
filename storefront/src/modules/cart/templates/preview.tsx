"use client"

import repeat from "@/lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { BaseCartLineItem } from "@medusajs/types/dist/http/cart/common"
import { clx } from "@medusajs/ui"
import ItemPreview from "@/modules/cart/components/item-preview"
import SkeletonLineItem from "@/modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  items?: HttpTypes.StoreCartLineItem[] | HttpTypes.StoreOrderLineItem[]
  currencyCode: string
}

const ItemsPreviewTemplate = ({ items, currencyCode }: ItemsTemplateProps) => {
  const hasOverflow = items && items.length > 4

  return (
    <div
      className={clx({
        "pl-[1px] overflow-y-scroll overflow-x-hidden no-scrollbar max-h-[420px]":
          hasOverflow,
      })}
    >
      <div className="flex flex-col gap-y-2">
        {items
          ? items
              .sort((a, b) => {
                return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
              })
              .map((item) => {
                return (
                  <ItemPreview
                    key={item.id}
                    currencyCode={currencyCode}
                    item={
                      item as BaseCartLineItem & {
                        metadata?: { note?: string }
                      }
                    }
                    showBorders={false}
                  />
                )
              })
          : repeat(5).map((i) => {
              return <SkeletonLineItem key={i} />
            })}
      </div>
    </div>
  )
}

export default ItemsPreviewTemplate
