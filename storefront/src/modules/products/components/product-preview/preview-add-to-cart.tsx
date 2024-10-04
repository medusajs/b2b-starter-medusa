"use client"

import { addToCart } from "@lib/data/cart"
import { Spinner } from "@medusajs/icons"
import { StoreProduct, StoreRegion } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import ShoppingBag from "@modules/common/icons/shopping-bag"
import { useState } from "react"

const PreviewAddToCart = ({
  product,
  region,
}: {
  product: StoreProduct
  region: StoreRegion
}) => {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    if (!product?.variants?.[0]?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: product?.variants?.[0]?.id,
      quantity: 1,
      countryCode: region.countries?.[0]?.iso_2 || "GB",
    })

    setIsAdding(false)
  }
  return (
    <Button
      className="rounded-full p-3 border-none shadow-none"
      onClick={(e) => {
        e.preventDefault()
        handleAddToCart()
      }}
      isLoading={isAdding}
    >
      <ShoppingBag fill="#fff" />
    </Button>
  )
}

export default PreviewAddToCart
