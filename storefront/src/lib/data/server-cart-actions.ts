"use server"

/**
 * Server-side cart actions that require revalidateTag
 * These functions can only be called from Server Components or Server Actions
 */

import { revalidateTag } from "next/cache"
import { getCacheTag } from "@/lib/data/cookies"

/**
 * Revalidate cart-related cache tags
 */
export async function revalidateCartCache(): Promise<void> {
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)
}

/**
 * Revalidate approvals cache
 */
export async function revalidateApprovalsCache(): Promise<void> {
    const approvalsCacheTag = await getCacheTag("approvals")
    revalidateTag(approvalsCacheTag)
}