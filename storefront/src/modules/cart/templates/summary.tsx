"use client"

import { Button, Container, toast } from "@medusajs/ui"

import { useCreateQuote } from "@lib/hooks/api/quotes"
import { HttpTypes } from "@medusajs/types"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PromptModal } from "@modules/common/components/prompt-modal"
import { useParams, useRouter } from "next/navigation"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
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

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const router = useRouter()
  const { countryCode } = useParams()

  const { mutateAsync: createQuote, isPending: isCreatingQuote } =
    useCreateQuote()

  return (
    <Container className="flex flex-col gap-y-3">
      {/* <DiscountCode cart={cart} /> */}
      {/* <Divider /> */}
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <Button className="w-full h-10 rounded-full shadow-none">
          Secure Checkout
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
    </Container>
  )
}

export default Summary
