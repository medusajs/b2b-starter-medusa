"use server"

import { sdk } from "@lib/config"
import { cache } from "react"
import { getAuthHeaders, getCacheHeaders } from "./cookies"

// Shipping actions
export const listCartPaymentMethods = cache(async function (regionId: string) {
  const headers = {
    ...(await getAuthHeaders()),
    ...(await getCacheHeaders("payment_providers")),
  }

  return sdk.store.payment
    .listPaymentProviders({ region_id: regionId }, headers)
    .then(({ payment_providers }) => payment_providers)
    .catch(() => {
      return null
    })
})
