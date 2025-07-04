"use client"

import { addToCartEventBus } from "@/lib/data/cart-event-bus"
import { StoreProduct, StoreRegion } from "@medusajs/types"
import { Button, Input, clx } from "@medusajs/ui"
import ShoppingBag from "@/modules/common/icons/shopping-bag"
import { useState } from "react"
import { MinimalCustomerInfo } from "@/types"

const PreviewAddToCart = ({
  product,
  region,
  customer,
}: {
  product: StoreProduct
  region: StoreRegion
  customer: MinimalCustomerInfo | null
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState("1")

  const isLoggedIn = customer?.isLoggedIn ?? false
  const isApproved = customer?.isApproved ?? false

  const maxQuantity = 999999

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product?.variants?.[0]?.id) return null

    setIsAdding(true)

    addToCartEventBus.emitCartAdd({
      lineItems: [
        {
          productVariant: {
            ...product?.variants?.[0],
            product,
          },
          quantity: Number(quantity),
        },
      ],
      regionId: region.id,
    })

    setIsAdding(false)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const value = e.target.value
    if (value === "" || /^[1-9]\d*$/.test(value)) {
      setQuantity(value)
    }
  }

  const handleQuantityBlur = (e: React.FocusEvent) => {
    e.stopPropagation()
    if (quantity === "") {
      setQuantity("1")
    } else {
      const numQuantity = Number(quantity)
      if (numQuantity > maxQuantity) {
        setQuantity(maxQuantity.toString())
      } else if (numQuantity < 1) {
        setQuantity("1")
      }
    }
  }

  const incrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newQuantity = Number(quantity) + 1
    if (newQuantity <= maxQuantity) {
      setQuantity(newQuantity.toString())
    }
  }

  const decrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newQuantity = Number(quantity) - 1
    if (newQuantity >= 1) {
      setQuantity(newQuantity.toString())
    }
  }

  if (!isLoggedIn || !isApproved) {
    return null
  }

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-x-3 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] rounded-full w-fit p-px items-center">
        <button
          className={clx(
            "w-4 h-4 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-full text-md",
            Number(quantity) <= 1 ? "opacity-50 pointer-events-none" : "opacity-100"
          )}
          onClick={decrementQuantity}
          disabled={Number(quantity) <= 1}
        >
          -
        </button>
        <Input
          className="w-10 h-4 flex items-center justify-center text-center text-neutral-950 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent shadow-none"
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          onBlur={handleQuantityBlur}
          min={1}
          max={maxQuantity}
        />
        <button
          className={clx(
            "w-4 h-4 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-full text-md",
            Number(quantity) >= maxQuantity ? "opacity-50 pointer-events-none" : "opacity-100"
          )}
          onClick={incrementQuantity}
          disabled={Number(quantity) >= maxQuantity}
        >
          +
        </button>
      </div>
      <Button
        className="rounded-full p-3 border-none shadow-none"
        onClick={handleAddToCart}
        isLoading={isAdding}
      >
        <ShoppingBag fill="#fff" />
      </Button>
    </div>
  )
}

export default PreviewAddToCart
