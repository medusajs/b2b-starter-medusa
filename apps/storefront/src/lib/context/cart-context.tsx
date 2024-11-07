"use client"

import type {
  StoreCart,
  StoreCartLineItem,
  StoreProduct,
} from "@medusajs/types"
import type { PropsWithChildren } from "react"

import { addToCart, deleteLineItem, updateLineItem } from "@lib/data/cart"

import { useParams } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useOptimistic,
  useTransition,
} from "react"

import { addToCartEventBus } from "@lib/data/cart-event-bus"
import type { StoreProductVariant } from "@medusajs/types"
import { B2BCart } from "types/global"

export type AddToCartEventPayload = {
  productVariant: StoreProductVariant & {
    product: StoreProduct
  }
  regionId: string
}

const CartContext = createContext<
  | {
      cart: B2BCart | null
      handleDeleteItem: (lineItem: string) => Promise<void>
      handleUpdateCartQuantity: (
        lineItem: string,
        newQuantity: number
      ) => Promise<void>
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

  const [, startTransition] = useTransition()

  const handleOptimisticAddToCart = useCallback(
    async (payload: AddToCartEventPayload) => {
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
            thumbnail: payload.productVariant.product?.thumbnail || undefined,
            unit_price: priceAmount,
            variant: payload.productVariant || undefined,
            // @ts-expect-error
            created_at: new Date().toISOString(),
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
    [setOptimisticCart]
  )

  useEffect(() => {
    addToCartEventBus.registerCartAddHandler(handleOptimisticAddToCart)
  }, [handleOptimisticAddToCart])

  const handleDeleteItem = async (lineItem: string) => {
    const item = optimisticCart?.items?.find(({ id }) => id === lineItem)

    if (!item) return

    startTransition(() => {
      setOptimisticCart((prev) => {
        if (!prev) return prev

        const optimisticItems = prev.items?.filter(({ id }) => id !== lineItem)

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

    await deleteLineItem(lineItem)
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

  const sortedItems = useMemo(() => {
    return optimisticCart?.items?.sort((a, b) => {
      return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
    })
  }, [optimisticCart])

  return (
    <CartContext.Provider
      value={{
        cart: { ...optimisticCart, items: sortedItems } as B2BCart,
        handleDeleteItem,
        handleUpdateCartQuantity,
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
