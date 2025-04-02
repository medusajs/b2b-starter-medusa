"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders, getCacheOptions } from "@/lib/data/cookies"
import { HttpTypes } from "@medusajs/types"

// Shipping actions
export const listCartPaymentMethods = async (regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("payment_providers")),
  }

  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      `/store/payment-providers`,
      {
        method: "GET",
        query: { region_id: regionId },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ payment_providers }) => payment_providers)
    .catch(() => {
      return null
    })
}
