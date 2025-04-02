"use client"

import { useCart } from "@/lib/context/cart-context"
import { getCheckoutStep } from "@/lib/util/get-checkout-step"
import CartToCsvButton from "@/modules/cart/components/cart-to-csv-button"
import CartTotals from "@/modules/cart/components/cart-totals"
import PromotionCode from "@/modules/checkout/components/promotion-code"
import Button from "@/modules/common/components/button"
import Divider from "@/modules/common/components/divider"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { RequestQuoteConfirmation } from "@/modules/quotes/components/request-quote-confirmation"
import { RequestQuotePrompt } from "@/modules/quotes/components/request-quote-prompt"
import { B2BCustomer } from "@/types"
import { ApprovalStatusType } from "@/types/approval"
import { ExclamationCircle } from "@medusajs/icons"
import { Container } from "@medusajs/ui"

type SummaryProps = {
  customer: B2BCustomer | null
  spendLimitExceeded: boolean
}

const Summary = ({ customer, spendLimitExceeded }: SummaryProps) => {
  const { handleEmptyCart, cart } = useCart()

  if (!cart) return null

  const checkoutStep = getCheckoutStep(cart)
  const checkoutPath = checkoutStep
    ? `/checkout?step=${checkoutStep}`
    : "/checkout"

  const checkoutButtonLink = customer ? checkoutPath : "/account"

  const isPendingApproval = cart?.approvals?.some(
    (approval) => approval?.status === ApprovalStatusType.PENDING
  )

  return (
    <Container className="flex flex-col gap-y-3">
      <CartTotals />
      <Divider />
      <PromotionCode cart={cart} />
      <Divider className="my-6" />
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
            disabled={isPendingApproval}
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
            disabled={isPendingApproval}
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
        disabled={isPendingApproval}
      >
        Empty Cart
      </Button>
    </Container>
  )
}

export default Summary
