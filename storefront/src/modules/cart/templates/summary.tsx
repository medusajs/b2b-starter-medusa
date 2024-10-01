"use client"

import { Button, Container } from "@medusajs/ui"
import { ExclamationCircle } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
  spendLimitExceeded: boolean
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, spendLimitExceeded }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <Container className="flex flex-col gap-y-3">
      {/* <DiscountCode cart={cart} /> */}
      {/* <Divider /> */}
      <CartTotals totals={cart} />
      {spendLimitExceeded && (
        <div className="flex items-center gap-x-2 bg-neutral-100 p-3 rounded-md shadow-borders-base">
          <ExclamationCircle className="text-orange-500 w-fit overflow-visible" />
          <p className="text-neutral-950 text-xs">
            This order exceeds your spending limit.
            <br />
            Please contact your manager for approval.
          </p>
        </div>
      )}
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <Button
          className="w-full h-10 rounded-full shadow-none"
          disabled={spendLimitExceeded}
        >
          {spendLimitExceeded ? "Spending Limit Exceeded" : "Secure Checkout"}
        </Button>
      </LocalizedClientLink>
      <Button
        className="w-full h-10 rounded-full shadow-borders-base"
        variant="secondary"
      >
        Export Cart (.csv)
      </Button>
      <Button
        className="w-full h-10 rounded-full shadow-borders-base"
        variant="secondary"
      >
        Empty Cart
      </Button>
    </Container>
  )
}

export default Summary
