"use server"

import { sdk } from "@/lib/config"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
} from "@/lib/data/cookies"
import { getCartApprovalStatus } from "@/lib/util/get-cart-approval-status"
import { FilterType } from "@/types"
import {
  ApprovalStatusType,
  StoreApprovalResponse,
  StoreApprovalsResponse,
} from "@/types/approval"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { retrieveCart } from "./cart"

type ListApprovalsParams = {
  status?: FilterType
  type?: FilterType
  offset?: number
  limit?: number
  order?: string
}

export const listApprovals = async ({
  status,
  type,
  offset = 0,
  limit = 100,
  order = "-updated_at",
}: ListApprovalsParams = {}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("approvals")),
  }

  const result = await sdk.client.fetch<StoreApprovalsResponse>(
    `/store/approvals`,
    {
      query: {
        status,
        type,
        offset,
        limit,
        order,
      },
      method: "GET",
      headers,
      next,
      credentials: "include",
      cache: "force-cache",
    }
  )

  return result
}

export const retrieveApproval = async (approvalId: string) => {}

export const updateApproval = async (
  approvalId: string,
  status: ApprovalStatusType
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

export const startApprovalFlow = async (approvalId: string, cartId: string) => {
  await updateApproval(approvalId, ApprovalStatusType.APPROVED)

  const cart = await retrieveCart(cartId)

  const { isPendingAdminApproval } = getCartApprovalStatus(cart)

  if (!isPendingAdminApproval) {
    redirect(`/checkout?cartId=${cartId}&step=payment`)
  }
}
