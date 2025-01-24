"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "@lib/data/cookies"
import {
  ApprovalStatus,
  StoreApprovalResponse,
  StoreApprovalsResponse,
} from "@starter/types/approval"
import { revalidateTag } from "next/cache"

type ListApprovalsParams = {
  filters?: Record<string, any>
  offset?: number
  limit?: number
}

export const listApprovals = async ({
  filters = {},
  offset = 0,
  limit = 10,
}: ListApprovalsParams = {}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("approvals")),
  }

  const { approvals, count } = await sdk.client.fetch<StoreApprovalsResponse>(
    `/store/approvals`,
    {
      query: {
        filters,
        offset,
        limit,
      },
      method: "GET",
      headers,
      next,
      credentials: "include",
    }
  )

  return { approvals, count }
}

export const retrieveApproval = async (approvalId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("approvals")),
  }

  const { approval } = await sdk.client.fetch<StoreApprovalResponse>(
    `/store/approvals/${approvalId}`,
    {
      method: "GET",
      headers,
      next,
      credentials: "include",
    }
  )

  return approval
}

export const updateApproval = async (
  approvalId: string,
  status: ApprovalStatus
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const { approval } = await sdk.client.fetch<StoreApprovalResponse>(
    `/store/approvals/${approvalId}`,
    {
      method: "POST",
      headers,
      body: {
        status,
      },
      credentials: "include",
    }
  )

  const cacheTag = await getCacheTag("approvals")
  revalidateTag(cacheTag)

  const cartTag = await getCacheTag("carts")
  revalidateTag(cartTag)

  return approval
}
