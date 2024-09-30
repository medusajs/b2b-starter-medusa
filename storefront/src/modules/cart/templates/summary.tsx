"use client"

import { Button, Container } from "@medusajs/ui"

import { HttpTypes } from "@medusajs/types"
import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { RequestQuoteConfirmation } from "@modules/quotes/components/request-quote-confirmation"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
  customer: HttpTypes.StoreCustomer | null
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

const Summary = ({ cart, customer }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  const checkoutButtonLink = customer ? "/checkout?step=" + step : "/login"

  // console.log({ customer })

  return (
    <Container className="flex flex-col gap-y-3">
      {/* <DiscountCode cart={cart} /> */}
      {/* <Divider /> */}
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href={checkoutButtonLink}
        data-testid="checkout-button"
      >
        <Button className="w-full h-10 rounded-full shadow-none">
          {customer ? "Checkout" : "Login to Checkout"}
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

      <RequestQuoteConfirmation>
        <Button className="w-full h-10" variant="secondary">
          Request Quote
        </Button>
      </RequestQuoteConfirmation>
    </Container>
  )
}

export default Summary
