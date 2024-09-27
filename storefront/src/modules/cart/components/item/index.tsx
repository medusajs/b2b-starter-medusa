"use client"

import { Container, Table, Text, clx } from "@medusajs/ui"
import { MinusMini, PlusMini } from "@medusajs/icons"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState, useOptimistic } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
}

const Item = ({ item, type = "full" }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { handle } = item.variant?.product ?? {}

  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(
    item.quantity,
    (state, newQuantity: number) => newQuantity
  )

  const changeQuantity = async (newQuantity: number) => {
    setError(null)
    setUpdating(true)
    setOptimisticQuantity(newQuantity)

    try {
      await updateLineItem({
        lineId: item.id,
        quantity: newQuantity,
      })
    } catch (err) {
      setError(err as string)
      // Revert the optimistic update if there's an error
      setOptimisticQuantity(item.quantity)
    } finally {
      setUpdating(false)
    }
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  return (
    <Container className="flex gap-4 w-full h-full items-center justify-between">
      <div className="flex gap-x-2 items-start">
        <Thumbnail
          thumbnail={item.thumbnail}
          size="square"
          className="bg-neutral-100 rounded-lg w-20 h-20"
        />
        <div className="flex flex-col gap-y-2 justify-between">
          <div className="flex flex-col">
            <span className="text-neutral-600 text-[0.6rem]">BRAND</span>
            <span className="txt-medium-plus text-neutral-950">
              {item.product?.title}
            </span>
            <span className="text-neutral-600 text-xs">
              {item.variant?.title}
            </span>
          </div>
          <div className="flex gap-x-2">
            <div className="flex gap-x-3 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] rounded-full w-fit p-px items-center">
              <button
                className="w-4 h-4 flex items-center justify-center text-neutral-600 text-base hover:bg-neutral-100 rounded-full"
                onClick={() => changeQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="w-4 h-4 flex items-center justify-center text-neutral-950 text-xs">
                {updating ? <Spinner size="12" /> : optimisticQuantity}
              </span>
              <button
                className="w-4 h-4 flex items-center justify-center text-neutral-600 text-base hover:bg-neutral-100 rounded-full"
                onClick={() => changeQuantity(item.quantity + 1)}
                disabled={item.quantity >= maxQuantity}
              >
                +
              </button>
            </div>
            <button className="text-neutral-950 text-xs shadow-[0_0_0_1px_rgba(0,0,0,0.1)] rounded-full px-2 py-1 min-w-20 flex items-center justify-center hover:bg-neutral-100">
              Add note
            </button>
            <DeleteButton id={item.id} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-start h-full self-stretch">
        <LineItemPrice item={item} />
      </div>
    </Container>
  )
}

export default Item
