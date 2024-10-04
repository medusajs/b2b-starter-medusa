"use client"

import { useCreateQuote } from "@lib/hooks/api/quotes"
import { ExclamationCircle } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, toast } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PromptModal } from "@modules/common/components/prompt-modal"
import { useParams, useRouter } from "next/navigation"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions?: HttpTypes.StorePromotion[]
  }
  customer: HttpTypes.StoreCustomer | null
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

const Summary = ({ cart, customer, spendLimitExceeded }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const router = useRouter()
  const { countryCode } = useParams()

  const { mutateAsync: createQuote, isPending: isCreatingQuote } =
    useCreateQuote()

  const checkoutButtonLink = customer ? "/checkout?step=" + step : "/account"

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
            : "Sign in to Checkout"}
        </Button>
      </LocalizedClientLink>
      <PromptModal
        title="Request Quote?"
        description="You are about to request a quote for the cart. If you confirm, the cart will be converted to a quote."
        handleAction={() =>
          createQuote(
            {},
            {
              onSuccess: (data) =>
                router.push(
                  `/${countryCode}/account/quotes/details/${data.quote.id}`
                ),
              onError: (error) => toast.error(error.message),
            }
          )
        }
        isLoading={isCreatingQuote}
      >
        <Button
          className="w-full h-10 rounded-full shadow-borders-base"
          variant="secondary"
        >
          Request Quote
        </Button>
      </PromptModal>

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
