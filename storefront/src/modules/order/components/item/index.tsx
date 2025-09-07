"use client"

import { HttpTypes } from "@medusajs/types"
import { Text, Table } from "@medusajs/ui"

import LineItemOptions from "@/modules/common/components/line-item-options"
import Thumbnail from "@/modules/products/components/thumbnail"
import { convertToLocale } from "@/lib/util/money"
import Button from "@/modules/common/components/button"
import { ShoppingBag } from "@medusajs/icons"
import { addToCartEventBus } from "@/lib/data/cart-event-bus"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreOrderLineItem
  order: HttpTypes.StoreOrder
}

const Item = ({ item, order }: ItemProps) => {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    if (!item.variant || !item.product) return

    setIsAdding(true)
    
    try {
      addToCartEventBus.emitCartAdd({
        lineItems: [
          {
            productVariant: {
              ...item.variant,
              product: item.product,
            },
            quantity: item.quantity,
          },
        ],
        regionId: order.region_id || "",
      })
    } catch (error) {
      console.error("Error adding item to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Table.Row className="flex gap-x-4 py-4">
      <Table.Cell className="w-20">
        <Thumbnail thumbnail={item.thumbnail} size="square" />
      </Table.Cell>
      <Table.Cell className="flex-1">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{item.title}</span>
          <span className="text-sm text-gray-500">
            {item.variant?.sku || item.variant_sku || item.variant?.title}
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
        <Button
          variant="secondary"
          size="small"
          onClick={handleAddToCart}
          disabled={!item.variant || isAdding}
          isLoading={isAdding}
          className="text-xs"
        >
          <ShoppingBag className="w-4 h-4" />
        </Button>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
