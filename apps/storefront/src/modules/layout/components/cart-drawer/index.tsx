"use client"

import { checkSpendingLimit } from "@lib/util/check-spending-limit"
import { getCheckoutStep } from "@lib/util/get-checkout-step"
import { convertToLocale } from "@lib/util/money"
import { ExclamationCircle, LockClosedSolidMini } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Drawer, Text } from "@medusajs/ui"
import ItemsTemplate from "@modules/cart/templates/items"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ShoppingBag from "@modules/common/icons/shopping-bag"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { B2BCart, B2BCustomer } from "types/global"

type CartDrawerProps = {
  cart:
    | (B2BCart & {
        promotions?: HttpTypes.StorePromotion[]
      })
    | null
  customer: B2BCustomer | null
}

const CartDrawer = ({ cart, customer, ...props }: CartDrawerProps) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  const items = cart?.items

  const totalItems =
    items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cart?.subtotal ?? 0

  const spendLimitExceeded = useMemo(
    () => checkSpendingLimit(cart, customer),
    [cart, customer]
  )

  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  const cancelTimer = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }
  }

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  //close cart drawe when navigating to a different page
  useEffect(() => {
    close()
  }, [pathname])

  const checkoutStep = cart ? getCheckoutStep(cart) : undefined
  const checkoutPath = customer
    ? checkoutStep
      ? `/checkout?step=${checkoutStep}`
      : "/checkout"
    : "/account"

  return (
    <>
      {isOpen && (
        <div className="fixed inset-[-2rem] z-10 backdrop-blur-sm p-0" />
      )}
      <Drawer
        onMouseEnter={cancelTimer}
        className="rounded-none m-0 p-0 bg-none z-50"
        open={isOpen}
        onOpenChange={setIsOpen}
        {...(props as any)}
      >
        <Drawer.Trigger asChild>
          <button className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden outline-none txt-compact-small-plus gap-x-1.5 px-3 py-1.5 rounded-full hover:bg-neutral-100">
            <ShoppingBag />
            <span className="text-sm font-normal hidden small:inline-block">
              {items && items.length > 0
                ? convertToLocale({
                    amount: subtotal,
                    currency_code: cart.currency_code,
                  })
                : "Cart"}
            </span>
            <div className="bg-blue-500 text-white text-xs px-1.5 py-px rounded-full">
              {totalItems}
            </div>
          </button>
        </Drawer.Trigger>
        <Drawer.Content
          className="z-50 rounded-none m-0 p-0 inset-y-0 sm:right-0"
          onMouseEnter={cancelTimer}
        >
          <Drawer.Header className="flex self-center">
            <Drawer.Title>
              {totalItems > 0
                ? `You have ${totalItems} items in your cart`
                : "Your cart is empty"}
            </Drawer.Title>
          </Drawer.Header>
          <div className="flex flex-col gap-y-4 h-full self-stretch justify-between">
            {cart && (
              <>
                <ItemsTemplate
                  cart={cart}
                  showBorders={false}
                  showTotal={false}
                />
                <div className="flex flex-col gap-y-3 w-full p-4">
                  <div className="flex justify-between">
                    <Text>Subtotal</Text>
                    <Text>
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cart?.currency_code,
                      })}
                    </Text>
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <LocalizedClientLink href="/cart">
                      <Button
                        variant="secondary"
                        className="w-full"
                        size="large"
                      >
                        View Cart
                      </Button>
                    </LocalizedClientLink>
                    <LocalizedClientLink href={checkoutPath}>
                      <Button
                        className="w-full"
                        size="large"
                        disabled={totalItems === 0 || spendLimitExceeded}
                      >
                        <LockClosedSolidMini />
                        {customer
                          ? spendLimitExceeded
                            ? "Spending Limit Exceeded"
                            : "Secure Checkout"
                          : "Log in to checkout"}
                      </Button>
                    </LocalizedClientLink>
                    {spendLimitExceeded && (
                      <div className="flex items-center gap-x-2 bg-neutral-100 p-3 rounded-md shadow-borders-base">
                        <ExclamationCircle className="text-orange-500 w-fit overflow-visible" />
                        <p className="text-neutral-950 text-xs">
                          This order exceeds your spending limit. Please contact
                          your manager for approval.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer>
    </>
  )
}

export default CartDrawer
