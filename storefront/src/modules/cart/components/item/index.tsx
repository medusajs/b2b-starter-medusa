"use client"

import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Container, Input } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"
import AddNoteButton from "../add-note-button"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
}

const Item = ({ item, type = "full" }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { handle } = item.variant?.product ?? {}

  const [quantity, setQuantity] = useState(item.quantity.toString())

  const changeQuantity = async (newQuantity: number) => {
    setError(null)
    setUpdating(true)

    setQuantity(newQuantity.toString())

    try {
      await updateLineItem({
        lineId: item.id,
        data: { quantity: Number(newQuantity) },
      })
    } catch (err) {
      setError(err as string)
      setQuantity(item.quantity.toString())
    } finally {
      setQuantity(newQuantity.toString())
      setUpdating(false)
    }
  }

  const handleBlur = (value: number) => {
    if (value === item.quantity) {
      return
    }

    if (value > maxQuantity) {
      setQuantity(maxQuantity.toString())
      changeQuantity(maxQuantity)
      return
    }

    if (value < 1) {
      setUpdating(true)
      deleteLineItem(item.id)
      setUpdating(false)
      return
    }

    changeQuantity(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur(Number(quantity))
    }

    if (e.key === "ArrowUp" && e.shiftKey) {
      e.preventDefault()
      setQuantity(String(Number(quantity) + 10))
    }

    if (e.key === "ArrowDown" && e.shiftKey) {
      e.preventDefault()
      setQuantity(String(Number(quantity) - 10))
    }
  }

  const maxQuantity = item.variant?.inventory_quantity ?? 10

  return (
    <Container className="flex gap-4 w-full h-full items-center justify-between">
      <div className="flex gap-x-2 items-start">
        <LocalizedClientLink href={`/products/${item.product?.handle}`}>
          <Thumbnail
            thumbnail={item.thumbnail}
            size="square"
            className="bg-neutral-100 rounded-lg w-20 h-20"
          />
        </LocalizedClientLink>
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
          <div className="flex gap-x-2 items-center">
            <div className="flex gap-x-3 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] rounded-full w-fit h-6 p-px items-center">
              <button
                className="w-4 h-4 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-full text-md"
                onClick={() => changeQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="w-4 h-4 flex items-center justify-center text-neutral-950 text-xs">
                {updating ? (
                  <Spinner size="12" />
                ) : (
                  <Input
                    className="w-10 h-4 flex items-center justify-center text-center text-neutral-950 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent shadow-none"
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value)
                    }}
                    onBlur={(e) => {
                      handleBlur(Number(e.target.value))
                    }}
                    onKeyDown={(e) => handleKeyDown(e)}
                  />
                )}
              </span>
              <button
                className="w-4 h-4 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-full text-md"
                onClick={() => changeQuantity(item.quantity + 1)}
                disabled={item.quantity >= maxQuantity}
              >
                +
              </button>
            </div>
            <DeleteButton id={item.id} />
            <AddNoteButton item={item} />
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
