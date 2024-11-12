"use client"

import { emptyCart } from "@lib/data/cart"
import { getCheckoutStep } from "@lib/util/get-checkout-step"
import { ExclamationCircle } from "@medusajs/icons"
import { Container } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { RequestQuoteConfirmation } from "@modules/quotes/components/request-quote-confirmation"
import { RequestQuotePrompt } from "@modules/quotes/components/request-quote-prompt"
import { useState } from "react"
import CartToCsvButton from "../components/cart-to-csv-button"
import { B2BCart, B2BCustomer } from "types/global"
import { useCart } from "@lib/context/cart-context"

type SummaryProps = {
  cart: B2BCart
  customer: B2BCustomer | null
  spendLimitExceeded: boolean
}

const Summary = ({ cart, customer, spendLimitExceeded }: SummaryProps) => {
  const { handleEmptyCart } = useCart()
  const checkoutStep = getCheckoutStep(cart)
  const checkoutPath = checkoutStep
    ? `/checkout?step=${checkoutStep}`
    : "/checkout"

  const checkoutButtonLink = customer ? checkoutPath : "/account"

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
      {!!customer && (
        <RequestQuoteConfirmation>
          <Button
            className="w-full h-10 rounded-full shadow-borders-base"
            variant="secondary"
          >
            Request Quote
          </Button>
        </RequestQuoteConfirmation>
      )}
      {!customer && (
        <RequestQuotePrompt>
          <Button
            className="w-full h-10 rounded-full shadow-borders-base"
            variant="secondary"
          >
            Request Quote
          </Button>
        </RequestQuotePrompt>
      )}
      <CartToCsvButton cart={cart} />
      <Button
        onClick={handleEmptyCart}
        className="w-full h-10 rounded-full shadow-borders-base"
        variant="secondary"
      >
        Empty Cart
      </Button>
    </Container>
  )
}

export default Summary
