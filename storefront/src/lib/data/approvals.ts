"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies"
import { StoreApprovalsResponse } from "@starter/types/approval"

export const listApprovals = async (filters: Record<string, any>) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("approvals")),
  }

  const { approvals } = await sdk.client.fetch<StoreApprovalsResponse>(
    `/store/approvals`,
    {
      query: {
        fields: "cart.items.*",
        filters,
      },
      method: "GET",
      headers,
      next,
    }
  )

  console.log("approvals", JSON.stringify(approvals, null, 2))

  return approvals
}
