"use client"

import { emptyCart } from "@lib/data/cart"
import { getCheckoutStep } from "@lib/util/get-checkout-step"
import { ExclamationCircle } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { RequestQuoteConfirmation } from "@modules/quotes/components/request-quote-confirmation"
import { useState } from "react"
import CartToCsvButton from "../components/cart-to-csv-button"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions?: HttpTypes.StorePromotion[]
  }
  customer: HttpTypes.StoreCustomer | null
  spendLimitExceeded: boolean
}

const Summary = ({ cart, customer, spendLimitExceeded }: SummaryProps) => {
  const [isEmptyingCart, setIsEmptyingCart] = useState(false)
  const [isExportingCart, setIsExportingCart] = useState(false)
  const [csvError, setCsvError] = useState(false)

  const checkoutStep = getCheckoutStep(cart)
  const checkoutPath = checkoutStep
    ? `/checkout?step=${checkoutStep}`
    : "/checkout"

  const checkoutButtonLink = customer ? checkoutPath : "/account"

  const handleEmptyCart = async () => {
    setIsEmptyingCart(true)
    try {
      await emptyCart()
    } catch (error) {
      console.error(error)
    }
  }

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
        href={checkoutButtonLink}
        data-testid="checkout-button"
      >
        <Button
          className="w-full h-10 rounded-full shadow-none"
          disabled={spendLimitExceeded}
        >
          {customer
            ? spendLimitExceeded
              ? "Spending Limit Exceeded"
              : "Checkout"
            : "Log in to Checkout"}
        </Button>
      </LocalizedClientLink>
      <RequestQuoteConfirmation>
        <Button
          className="w-full h-10 rounded-full shadow-borders-base"
          variant="secondary"
        >
          Request Quote
        </Button>
      </RequestQuoteConfirmation>
      <CartToCsvButton cart={cart} />
      <Button
        onClick={handleEmptyCart}
        isLoading={isEmptyingCart}
        className="w-full h-10 rounded-full shadow-borders-base"
        variant="secondary"
      >
        Empty Cart
      </Button>
    </Container>
  )
}

export default Summary
