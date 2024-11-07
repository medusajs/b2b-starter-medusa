"use client"

import { useCart } from "@lib/context/cart-context"
import { HttpTypes } from "@medusajs/types"
import { clx, Container, Input } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { startTransition, useEffect, useState } from "react"
import AddNoteButton from "../add-note-button"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  showBorders?: boolean
}

const Item = ({ item, type = "full", showBorders = true }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { handle } = item.variant?.product ?? {}

  const [quantity, setQuantity] = useState(item.quantity.toString())

  const { handleDeleteItem, handleUpdateCartQuantity } = useCart()

  const changeQuantity = async (newQuantity: number) => {
    setError(null)
    // setUpdating(true)

    startTransition(() => {
      setQuantity(newQuantity.toString())
    })

    await handleUpdateCartQuantity(item.id, Number(newQuantity))
  }

  useEffect(() => {
    setQuantity(item.quantity.toString())
  }, [item.quantity])

  const handleBlur = (value: number) => {
    if (value === item.quantity) {
      return
    }

    if (value > maxQuantity) {
      changeQuantity(maxQuantity)
    }

    if (value < 1) {
      setUpdating(true)
      handleDeleteItem(item.id)
      setUpdating(false)
    }

    changeQuantity(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      changeQuantity(Number(quantity))
    }

    if (e.key === "ArrowUp" && e.shiftKey) {
      e.preventDefault()
      setQuantity((Number(quantity) + 10).toString())
    }

    if (e.key === "ArrowDown" && e.shiftKey) {
      e.preventDefault()
      setQuantity((Number(quantity) - 10).toString())
    }
  }

  const maxQuantity = item.variant?.inventory_quantity ?? 100

  return (
    <Container
      className={clx("flex gap-4 w-full h-full items-center justify-between", {
        "shadow-none": !showBorders,
        "p-0": type === "preview",
      })}
    >
      <div className="flex gap-x-4 items-start">
        <LocalizedClientLink href={`/products/${handle}`}>
          <Thumbnail
            thumbnail={item.thumbnail}
            size="square"
            type={type}
            className={clx("bg-neutral-100 rounded-lg w-20 h-20", {
              "w-10 h-10": type === "preview",
            })}
          />
        </LocalizedClientLink>
        <div className="flex flex-col gap-y-2 justify-between min-h-full self-stretch">
          <div className="flex flex-col">
            {type === "full" && (
              <span className="text-neutral-600 text-[0.6rem]">BRAND</span>
            )}
            <span className="txt-medium-plus text-neutral-950">
              {item.product?.title}
            </span>
            <span className="text-neutral-600 text-xs">
              {item.variant?.title}
            </span>
          </div>
          <div className="flex small:flex-row flex-col gap-2">
            {type === "full" && (
              <>
                <LineItemPrice
                  className="flex small:hidden self-start"
                  item={item}
                />
                <div className="flex gap-x-2">
                  <div className="flex gap-x-3 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] rounded-full w-fit p-px items-center">
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
                </div>
                <AddNoteButton item={item as HttpTypes.StoreCartLineItem} />
              </>
            )}
            {type === "preview" && (item.metadata?.note as string) && (
              <div className="flex gap-x-1">
                <span className="text-neutral-950 text-xs">Note:</span>
                <span className="text-xs text-neutral-600 italic truncate max-w-44 pr-px">
                  {item.metadata?.note as string}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className={clx("flex flex-col items-start justify-between ", {
          "min-h-full self-stretch": type === "full",
          "flex-col-reverse items-end": type === "preview",
        })}
      >
        <LineItemPrice
          className="hidden small:flex"
          item={item}
          style={type === "preview" ? "tight" : "default"}
        />
        {type === "preview" && (
          <span className="self-end text-xs text-neutral-600 italic">
            {item.quantity}x
          </span>
        )}
      </div>
    </Container>
  )
}

export default Item
