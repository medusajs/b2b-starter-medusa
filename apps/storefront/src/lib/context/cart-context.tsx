"use client"

import type {
  StoreCart,
  StoreCartLineItem,
  StorePromotion,
} from "@medusajs/types"
import type { Dispatch, PropsWithChildren, SetStateAction } from "react"

import { addToCart, updateLineItem } from "@lib/data/cart"

import { useParams, usePathname } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react"

import type { StoreProductVariant } from "@medusajs/types"
import { addToCartEventBus } from "@lib/data/cart-event-bus"
import { B2BCart } from "types/global"

export type AddToCartEventPayload = {
  productVariant: StoreProductVariant
  regionId: string
}

const CartContext = createContext<
  | {
      cart: B2BCart | null
      cartOpen: boolean
      handleDeleteItem: (lineItem: string) => Promise<void>
      handleUpdateCartQuantity: (
        lineItem: string,
        newQuantity: number
      ) => Promise<void>
      setCartOpen: Dispatch<SetStateAction<boolean>>
    }
  | undefined
>(undefined)

export function CartProvider({
  cart,
  children,
}: PropsWithChildren<{
  cart: B2BCart | null
}>) {
  const { countryCode } = useParams()

  const [optimisticCart, setOptimisticCart] = useOptimistic<B2BCart | null>(
    cart
  )
  const [cartOpen, setCartOpen] = useState(false)

  const [, startTransition] = useTransition()
  const pathname = usePathname()

  const handleOptimisticAddToCart = useCallback(
    async (payload: AddToCartEventPayload) => {
      setCartOpen(true)

      startTransition(async () => {
        setOptimisticCart((prev) => {
          console.log({ prev: cart?.items?.length })

          const items = [...(prev?.items || [])]

          const existingItemIndex = items.findIndex(
            ({ variant }) => variant?.id === payload.productVariant.id
          )

          if (existingItemIndex > -1) {
            const item = items[existingItemIndex]
            items[existingItemIndex] = {
              ...item,
              quantity: item.quantity + 1,
            }
            return { ...prev, items } as B2BCart
          }

          const priceAmount =
            payload.productVariant.calculated_price?.calculated_amount || 0

          const newItem: StoreCartLineItem = {
            cart: prev || ({} as StoreCart),
            cart_id: prev?.id || "",
            discount_tax_total: 0,
            discount_total: 0,
            id: generateOptimisticItemId(payload.productVariant.id),
            is_discountable: false,
            is_tax_inclusive: false,
            item_subtotal: priceAmount,
            item_tax_total: 0,
            item_total: priceAmount,
            original_subtotal: priceAmount,
            original_tax_total: 0,
            original_total: priceAmount,
            product: payload.productVariant.product || undefined,
            quantity: 1,
            requires_shipping: true,
            subtotal: priceAmount,
            tax_total: 0,
            title: payload.productVariant.title || "",
            total: priceAmount,
            unit_price: priceAmount,
            variant: payload.productVariant || undefined,
          }

          const newItems = [...items, newItem]

          const newTotal = calculateCartTotal(newItems)

          return { ...prev, item_total: newTotal, items: newItems } as B2BCart
        })

        await addToCart({
          countryCode: countryCode as string,
          quantity: 1,
          variantId: payload.productVariant.id,
        })
      })
    },
    [setCartOpen, setOptimisticCart]
  )

  useEffect(() => {
    addToCartEventBus.registerCartAddHandler(handleOptimisticAddToCart)
  }, [handleOptimisticAddToCart])

  useEffect(() => {
    setCartOpen(false)
  }, [pathname])

  const handleDeleteItem = async (lineItem: string) => {
    handleUpdateCartQuantity(lineItem, 0)
  }

  const handleUpdateCartQuantity = async (
    lineItem: string,
    quantity: number
  ) => {
    const item = optimisticCart?.items?.find(({ id }) => id === lineItem)

    if (!item) return

    startTransition(() => {
      setOptimisticCart((prev) => {
        if (!prev) return prev

        const optimisticItems = prev.items?.reduce(
          (acc: StoreCartLineItem[], item) => {
            if (item.id === lineItem) {
              return quantity === 0 ? acc : [...acc, { ...item, quantity }]
            }
            return [...acc, item]
          },
          []
        )

        const optimisticTotal = optimisticItems?.reduce(
          (acc, item) => acc + item.unit_price * item.quantity,
          0
        )

        return {
          ...prev,
          item_subtotal: optimisticTotal || 0,
          items: optimisticItems,
        }
      })
    })

    if (!isOptimisticItemId(lineItem)) {
      await updateLineItem({
        lineId: lineItem,
        data: { quantity },
      })
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart,
        cartOpen,
        handleDeleteItem,
        handleUpdateCartQuantity,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

const OPTIMISTIC_ITEM_ID_PREFIX = "__optimistic__"

function generateOptimisticItemId(variantId: string) {
  return `${OPTIMISTIC_ITEM_ID_PREFIX}-${variantId}`
}

export function isOptimisticItemId(id: string) {
  return id.startsWith(OPTIMISTIC_ITEM_ID_PREFIX)
}

function calculateCartTotal(cartItems: StoreCartLineItem[]) {
  return (
    cartItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0) ||
    0
  )
}
