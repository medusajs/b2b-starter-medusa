import { retrieveCart } from "@lib/data/cart"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import SignInPrompt from "@modules/cart/components/sign-in-prompt"
import BillingAddress from "@modules/checkout/components/billing-address"
import Company from "@modules/checkout/components/company"
import ContactDetails from "@modules/checkout/components/contact-details"
import Payment from "@modules/checkout/components/payment"
import Shipping from "@modules/checkout/components/shipping"
import ShippingAddress from "@modules/checkout/components/shipping-address"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import UTurnArrowRight from "@modules/common/icons/u-turn-arrow-right"
import { B2BCart, B2BCustomer } from "types/global"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: B2BCart | null
  customer: B2BCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  return (
    <div>
      <div className="w-full grid grid-cols-1 gap-y-2">
        <LocalizedClientLink
          className="flex items-baseline gap-2 text-sm text-neutral-400 hover:text-neutral-500"
          href="/cart"
        >
          <Button variant="secondary">
            <UTurnArrowRight />
            Back to shopping cart
          </Button>
        </LocalizedClientLink>

        {!customer ? <SignInPrompt /> : null}

        {cart?.company && <Company cart={cart} />}

        <ShippingAddress cart={cart} customer={customer} />

        <BillingAddress cart={cart} customer={customer} />

        <Shipping cart={cart} availableShippingMethods={shippingMethods} />

        <Payment cart={cart} availablePaymentMethods={paymentMethods} />

        <ContactDetails cart={cart} customer={customer} />
      </div>
    </div>
  )
}
