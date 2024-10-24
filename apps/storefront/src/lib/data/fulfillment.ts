"use server"

import { sdk } from "@lib/config"
import { cache } from "react"
import { getCacheHeaders } from "./cookies"

// Shipping actions
export const listCartShippingMethods = cache(async function (cartId: string) {
  const headers = {
    ...(await getCacheHeaders("fulfillment")),
  }

  return sdk.store.fulfillment
    .listCartOptions({ cart_id: cartId }, headers)
    .then(({ shipping_options }) => shipping_options)
    .catch(() => {
      return null
    })
})
