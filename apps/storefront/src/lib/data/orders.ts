"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { getAuthHeaders, getCacheHeaders } from "./cookies"

export const retrieveOrder = cache(async function (id: string) {
  const headers = {
    ...(await getCacheHeaders("orders")),
    ...(await getAuthHeaders()),
  }

  return sdk.store.order
    .retrieve(id, { fields: "*payment_collections.payments" }, headers)
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
})

export const listOrders = cache(async function (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) {
  const headers = {
    ...(await getCacheHeaders("orders")),
    ...(await getAuthHeaders()),
  }

  return sdk.store.order
    .list(
      {
        limit,
        offset,
        order: "-created_at",
        fields: "*items,+items.metadata,*items.variant,*items.product",
        ...filters,
      },
      headers
    )
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
})
