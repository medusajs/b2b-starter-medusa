import { sdk } from "@lib/config"
import { cache } from "react"
import { getCacheHeaders } from "./cookies"

// Shipping actions
export const listCartShippingMethods = cache(async function (cartId: string) {
  return sdk.store.fulfillment
    .listCartOptions({ cart_id: cartId }, { ...getCacheHeaders("fulfillment") })
    .then(({ shipping_options }) => shipping_options)
    .catch(() => {
      return null
    })
})
