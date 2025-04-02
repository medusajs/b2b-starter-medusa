import { B2BCart } from "@/types/global"

export function getCheckoutStep(cart: B2BCart) {
  if (!cart?.shipping_address?.address_1) {
    return "shipping-address"
  } else if (!cart.billing_address?.address_1) {
    return "billing-address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else if (!cart.email) {
    return "contact-information"
  } else if (
    !cart.payment_collection?.payment_sessions?.find(
      (paymentSession: any) => paymentSession.status === "pending"
    )
  ) {
    return "payment"
  } else {
    return null
  }
}
