import { sdk } from "@lib/config"
import { cache } from "react"
import { getCacheHeaders } from "./cookies"

// Shipping actions
export const listCartPaymentMethods = cache(async function (regionId: string) {
  return sdk.store.payment
    .listPaymentProviders(
      { region_id: regionId },
      { ...getCacheHeaders("payment_providers") }
    )
    .then(({ payment_providers }) => payment_providers)
    .catch(() => {
      return null
    })
})
