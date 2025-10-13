"use client"

import { useCart } from "@/lib/context/cart-context"
import AddNoteButton from "../add-note-button"
import DeleteButton from "@/modules/common/components/delete-button"
import Button from "@/modules/common/components/button"
import { useLeadQuote } from "@/modules/quotation/lead-quote/context"
import { sendEvent } from "@/modules/common/analytics/events"
import LineItemPrice from "@/modules/common/components/line-item-price"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Spinner from "@/modules/common/icons/spinner"
import Thumbnail from "@/modules/discovery/products/components/thumbnail"
import { HttpTypes } from "@medusajs/types"
import { clx, Container, Input } from "@medusajs/ui"
import { startTransition, useEffect, useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  showBorders?: boolean
  currencyCode: string
  disabled?: boolean
}

const ItemFull = ({
  item,
  showBorders = true,
  currencyCode,
  disabled,
}: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [quantity, setQuantity] = useState(item.quantity.toString())

  const { handleDeleteItem, handleUpdateCartQuantity } = useCart()
  let addToQuote: undefined | ((item: any) => void)
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    addToQuote = useLeadQuote().add
  } catch { }

  const changeQuantity = async (newQuantity: number) => {
    setError(null)

    // Validate stock before updating
    const inventoryQty = item.variant?.inventory_quantity ?? 0
    if (newQuantity > inventoryQty) {
      setError(`Apenas ${inventoryQty} unidades disponíveis em estoque`)
      return
    }

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
    if (disabled) {
      return
    }

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
      className={clx("flex gap-4 w-full h-full items-center justify-between bg-[var(--surface)]/80 border border-[var(--border)] rounded-xl backdrop-blur-sm", {
        "shadow-none": !showBorders,
      })}
    >
      <div className="flex gap-x-4 items-start">
        <LocalizedClientLink href={`/products/${item.product_handle}`}>
          <Thumbnail
            thumbnail={item.thumbnail}
            size="square"
            type="full"
            className="bg-[var(--surface)] rounded-lg w-20 h-20"
          />
        </LocalizedClientLink>
        <div className="flex flex-col gap-y-2 justify-between min-h-full self-stretch">
          <div className="flex flex-col">
            <span className="text-zinc-500 dark:text-zinc-400 text-[0.6rem]">BRAND</span>

            <span className="txt-medium-plus text-zinc-900 dark:text-zinc-50">
              {item.product?.title}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">
              {item.variant?.title}
            </span>
          </div>
          <div className="flex small:flex-row flex-col gap-2">
            <LineItemPrice
              className="flex small:hidden self-start"
              item={item}
              currencyCode={currencyCode}
            />
            <div className="flex gap-x-2">
              <div className="flex gap-x-3 border border-[var(--border)] bg-[var(--surface)]/60 rounded-full w-fit p-px items-center backdrop-blur-sm">
                <button
                  className={clx(
                    "w-4 h-4 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-md",
                    disabled ? "opacity-50 pointer-events-none" : "opacity-100"
                  )}
                  onClick={() => changeQuantity(item.quantity - 1)}
                  disabled={item.quantity <= 1 || disabled}
                >
                  -
                </button>
                <span className="w-4 h-4 flex items-center justify-center text-neutral-950 text-xs">
                  {updating ? (
                    <Spinner size="12" />
                  ) : (
                    <Input
                      className={clx(
                        "w-10 h-4 flex items-center justify-center text-center text-zinc-900 dark:text-zinc-50 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent shadow-none",
                        disabled
                          ? "opacity-50 pointer-events-none"
                          : "opacity-100"
                      )}
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value)
                      }}
                      onBlur={(e) => {
                        handleBlur(Number(e.target.value))
                      }}
                      onKeyDown={(e) => handleKeyDown(e)}
                      disabled={disabled}
                    />
                  )}
                </span>
                <button
                  className={clx(
                    "w-4 h-4 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-md",
                    disabled ? "opacity-50 pointer-events-none" : "opacity-100"
                  )}
                  onClick={() => changeQuantity(item.quantity + 1)}
                  disabled={item.quantity >= maxQuantity || disabled}
                >
                  +
                </button>
              </div>

              <DeleteButton id={item.id} disabled={disabled} />
              <Button
                variant="secondary"
                className="h-7 px-2 text-xs rounded-full"
                onClick={() => {
                  addToQuote?.({
                    id: item.product_id || item.id,
                    category: 'panels',
                    name: item.product?.title || item.title,
                    manufacturer: (item as any)?.metadata?.brand || '',
                    image_url: item.thumbnail || '',
                    price_brl: item.unit_price,
                  })
                  sendEvent('add_to_quote', { id: item.product_id || item.id, source: 'cart_item' })
                }}
              >
                Adicionar à cotação
              </Button>
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
            {maxQuantity < 10 && maxQuantity > 0 && (
              <p className="text-amber-600 text-xs mt-1">
                Apenas {maxQuantity} unidades em estoque
              </p>
            )}
            <AddNoteButton
              item={item as HttpTypes.StoreCartLineItem}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between min-h-full self-stretch">
        <LineItemPrice
          className="hidden small:flex"
          item={item}
          currencyCode={currencyCode}
          style="default"
        />
      </div>
    </Container>
  )
}

export default ItemFull
