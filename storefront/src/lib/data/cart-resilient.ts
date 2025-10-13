/**
 * Cart Integration Layer - Integrates CartResilientLayer with existing cart functions
 *
 * This file wraps the existing cart.ts functions with resilient versions
 * while maintaining backward compatibility.
 */

import { CartResilientLayer } from "@/lib/cart/resilient-layer-class"
import { getCartId, setCartId, removeCartId } from "@/lib/data/cookies"
import { retrieveCustomer } from "@/lib/data/customer"
import { getRegion } from "@/lib/data/regions"
import { sdk } from "@/lib/config"
import medusaError from "@/lib/util/medusa-error"
import { HttpTypes, StoreCart } from "@medusajs/types"
import { cartToastDispatcher } from "@/lib/toasts/cart-toasts"
import { B2BCart } from "@/types/global"
import { track } from "@vercel/analytics/server"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
    getAuthHeaders,
    getCacheOptions,
    getCacheTag,
} from "@/lib/data/cookies"

// ==========================================
// Global instance
// ==========================================

const cartResilience = new CartResilientLayer()

// ==========================================
// Resilient Cart Functions
// ==========================================

/**
 * Resilient version of retrieveCart
 */
export async function retrieveCart(id?: string) {
    const cartId = id || (await getCartId())

    if (!cartId) {
        return null
    }

    const headers = {
        ...(await getAuthHeaders()),
    }

    const next = {
        ...(await getCacheOptions("carts")),
    }

    try {
        const response = await sdk.client
            .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${cartId}`, {
                credentials: "include",
                method: "GET",
                query: {
                    fields:
                        "*items, *region, *items.product, *items.variant, +items.thumbnail, +items.metadata, *promotions, *company, *company.approval_settings, *customer, *approvals, +completed_at, *approval_status",
                },
                headers,
                next,
                cache: "force-cache",
            })

        const cart = response.cart as unknown as B2BCart

        // Save to local storage for resilience
        if (typeof window !== "undefined") {
            const { CartLocalStorage } = await import("@/lib/cart/resilient-layer")
            CartLocalStorage.saveCart(cart)
        }

        return cart
    } catch (error) {
        console.warn("[retrieveCart] Failed to fetch from API, trying local storage:", error)

        // Try to get from local storage as fallback
        if (typeof window !== "undefined") {
            const { CartLocalStorage } = await import("@/lib/cart/resilient-layer")
            const localCart = CartLocalStorage.loadCart()
            if (localCart) {
                console.log("[retrieveCart] Using cart from local storage")
                return localCart
            }
        }

        return null
    }
}

/**
 * Resilient version of getOrSetCart
 */
export async function getOrSetCart(countryCode: string) {
    let cart = await retrieveCart()
    const region = await getRegion(countryCode)
    const customer = await retrieveCustomer()

    if (!region) {
        throw new Error(`Region not found for country code: ${countryCode}`)
    }

    const headers = {
        ...(await getAuthHeaders()),
    }

    if (!cart) {
        const body = {
            region_id: region.id,
            metadata: {
                company_id: customer?.employee?.company_id,
            },
        }

        try {
            const cartResp = await sdk.store.cart.create(body, {}, headers)
            setCartId(cartResp.cart.id)

            const cartCacheTag = await getCacheTag("carts")
            revalidateTag(cartCacheTag)

            cart = await retrieveCart()
        } catch (error) {
            console.error("[getOrSetCart] Failed to create cart:", error)
            throw error
        }
    }

    if (cart && (cart as any)?.region_id !== region.id) {
        try {
            await sdk.store.cart.update((cart as any).id, { region_id: region.id }, {}, headers)
            const cartCacheTag = await getCacheTag("carts")
            revalidateTag(cartCacheTag)
        } catch (error) {
            console.warn("[getOrSetCart] Failed to update region, continuing:", error)
        }
    }

    return cart
}

/**
 * Resilient version of addToCart using CartResilientLayer
 */
export async function addToCart({
    variantId,
    quantity,
    countryCode,
}: {
    variantId: string
    quantity: number
    countryCode: string
}) {
    if (!variantId) {
        throw new Error("Missing variant ID when adding to cart")
    }

    const cart = await getOrSetCart(countryCode)
    if (!cart) {
        throw new Error("Error retrieving or creating cart")
    }

    const cartId = (cart as any).id

    try {
        // Use resilient layer
        const response = await cartResilience.addToCart({
            variantId,
            quantity,
            countryCode,
            cartId,
        })

        if (!response.fromQueue) {
            // Success - revalidate cache
            const fulfillmentCacheTag = await getCacheTag("fulfillment")
            revalidateTag(fulfillmentCacheTag)
            const cartCacheTag = await getCacheTag("carts")
            revalidateTag(cartCacheTag)

            // Show success toast
            cartToastDispatcher.addToCartSuccess(
                response.lineItem?.product?.title || "Produto",
                quantity
            )
        }

        return response
    } catch (error) {
        console.error("[addToCart] Failed:", error)
        throw medusaError(error)
    }
}

/**
 * Resilient version of addToCartBulk using CartResilientLayer
 */
export async function addToCartBulk({
    lineItems,
    countryCode,
}: {
    lineItems: HttpTypes.StoreAddCartLineItem[]
    countryCode: string
}) {
    const cart = await getOrSetCart(countryCode)

    if (!cart) {
        throw new Error("Error retrieving or creating cart")
    }

    const cartId = (cart as any).id

    try {
        const response = await cartResilience.addToCartBulk({
            lineItems,
            cartId,
        })

        if (!response.fromQueue) {
            const fulfillmentCacheTag = await getCacheTag("fulfillment")
            revalidateTag(fulfillmentCacheTag)
            const cartCacheTag = await getCacheTag("carts")
            revalidateTag(cartCacheTag)

            // Show success toast
            cartToastDispatcher.addToCartBulkSuccess(lineItems.length)
        }

        return response
    } catch (error) {
        console.error("[addToCartBulk] Failed:", error)
        throw medusaError(error)
    }
}

/**
 * Resilient version of updateLineItem using CartResilientLayer
 */
export async function updateLineItem({
    lineId,
    data,
}: {
    lineId: string
    data: HttpTypes.StoreUpdateCartLineItem
}) {
    if (!lineId) {
        throw new Error("Missing lineItem ID when updating line item")
    }

    const cartId = await getCartId()

    if (!cartId) {
        throw new Error("Missing cart ID when updating line item")
    }

    try {
        const response = await cartResilience.updateLineItem({
            lineId,
            cartId,
            data,
        })

        if (!response.fromQueue) {
            const fulfillmentCacheTag = await getCacheTag("fulfillment")
            revalidateTag(fulfillmentCacheTag)
            const cartCacheTag = await getCacheTag("carts")
            revalidateTag(cartCacheTag)
        }

        return response
    } catch (error) {
        console.error("[updateLineItem] Failed:", error)
        throw medusaError(error)
    }
}

/**
 * Resilient version of deleteLineItem using CartResilientLayer
 */
export async function deleteLineItem(lineId: string) {
    if (!lineId) {
        throw new Error("Missing lineItem ID when deleting line item")
    }

    const cartId = await getCartId()
    if (!cartId) {
        throw new Error("Missing cart ID when deleting line item")
    }

    try {
        const response = await cartResilience.deleteLineItem({
            lineId,
            cartId,
        })

        if (!response.fromQueue) {
            const fulfillmentCacheTag = await getCacheTag("fulfillment")
            revalidateTag(fulfillmentCacheTag)
            const cartCacheTag = await getCacheTag("carts")
            revalidateTag(cartCacheTag)

            // Show success toast
            cartToastDispatcher.removeItemSuccess(
                response.lineItem?.product?.title || "Item"
            )
        }

        return response
    } catch (error) {
        console.error("[deleteLineItem] Failed:", error)
        throw medusaError(error)
    }
}

/**
 * Resilient version of updateCart using CartResilientLayer
 */
export async function updateCart(data: HttpTypes.StoreUpdateCart) {
    const cartId = await getCartId()

    if (!cartId) {
        throw new Error("No existing cart found, please create one before updating")
    }

    try {
        const response = await cartResilience.updateCart({
            cartId,
            data,
        })

        if (!response.fromQueue) {
            const fulfillmentCacheTag = await getCacheTag("fulfillment")
            revalidateTag(fulfillmentCacheTag)
            const cartCacheTag = await getCacheTag("carts")
            revalidateTag(cartCacheTag)
        }

        return response
    } catch (error) {
        console.error("[updateCart] Failed:", error)
        throw medusaError(error)
    }
}

/**
 * Resilient version of createCartApproval using CartResilientLayer
 */
export async function createCartApproval(cartId: string, createdBy: string) {
    try {
        const response = await cartResilience.createCartApproval({
            cartId,
            createdBy,
        })

        if (!response.fromQueue) {
            const cartCacheTag = await getCacheTag("carts")
            revalidateTag(cartCacheTag)
            const approvalsCacheTag = await getCacheTag("approvals")
            revalidateTag(approvalsCacheTag)

            // Show success toast
            cartToastDispatcher.approvalCreated()
        }

        return response.data || response
    } catch (error) {
        console.error("[createCartApproval] Failed:", error)
        throw medusaError(error)
    }
}

// ==========================================
// Legacy Functions (keeping for compatibility)
// ==========================================

/**
 * Legacy emptyCart function (keeping for compatibility)
 */
export async function emptyCart() {
    const cart = await retrieveCart()
    if (!cart) {
        throw new Error("No existing cart found when emptying cart")
    }

    for (const item of (cart as any).items || []) {
        await deleteLineItem(item.id)
    }

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
}

/**
 * Legacy setShippingMethod function (keeping for compatibility)
 */
export async function setShippingMethod({
    cartId,
    shippingMethodId,
}: {
    cartId: string
    shippingMethodId: string
}) {
    const headers = {
        ...(await getAuthHeaders()),
    }

    try {
        await sdk.store.cart
            .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
            .then(async () => {
                const cartCacheTag = await getCacheTag("carts")
                revalidateTag(cartCacheTag)
            })
    } catch (error) {
        console.error("[setShippingMethod] Failed:", error)
        throw medusaError(error)
    }
}

/**
 * Legacy initiatePaymentSession function (keeping for compatibility)
 */
export async function initiatePaymentSession(
    cart: B2BCart,
    data: {
        provider_id: string
        context?: Record<string, unknown>
    }
) {
    const headers = {
        ...(await getAuthHeaders()),
    }

    try {
        return await sdk.store.payment
            .initiatePaymentSession(cart as unknown as StoreCart, data, {}, headers)
            .then(async (resp) => {
                const cartCacheTag = await getCacheTag("carts")
                revalidateTag(cartCacheTag)
                return resp
            })
    } catch (error) {
        console.error("[initiatePaymentSession] Failed:", error)
        throw medusaError(error)
    }
}

/**
 * Legacy applyPromotions function (keeping for compatibility)
 */
export async function applyPromotions(codes: string[]) {
    const cartId = await getCartId()
    if (!cartId) {
        throw new Error("No existing cart found")
    }

    try {
        await updateCart({ promo_codes: codes })
            .then(async () => {
                const cartCacheTag = await getCacheTag("carts")
                revalidateTag(cartCacheTag)
                const fulfillmentCacheTag = await getCacheTag("fulfillment")
                revalidateTag(fulfillmentCacheTag)

                // Show success toast for each code
                codes.forEach(code => {
                    cartToastDispatcher.promotionApplied(code)
                })
            })
    } catch (error) {
        console.error("[applyPromotions] Failed:", error)
        throw medusaError(error)
    }
}

/**
 * Legacy placeOrder function (keeping for compatibility)
 */
export async function placeOrder(
    cartId?: string
): Promise<HttpTypes.StoreCompleteCartResponse> {
    const id = cartId || (await getCartId())

    if (!id) {
        throw new Error("No existing cart found when placing an order")
    }

    const headers = {
        ...(await getAuthHeaders()),
    }

    const cartsTag = await getCacheTag("carts")
    const ordersTag = await getCacheTag("orders")
    const approvalsTag = await getCacheTag("approvals")

    try {
        const response = await sdk.store.cart
            .complete(id, {}, headers)

        if (response.type === "cart") {
            return response
        }

        track("order_completed", {
            order_id: response.order.id,
        })

        revalidateTag(cartsTag)
        revalidateTag(ordersTag)
        revalidateTag(approvalsTag)

        // Show success toast
        cartToastDispatcher.orderPlaced()

        await removeCartId()

        redirect(
            `/${response.order.shipping_address?.country_code?.toLowerCase()}/order/confirmed/${response.order.id
            }`
        )
    } catch (error) {
        console.error("[placeOrder] Failed:", error)
        throw medusaError(error)
    }
}

// ==========================================
// Re-export everything from original cart.ts for compatibility
// ==========================================

export {
    // Re-export from original cart.ts
    submitPromotionForm,
    setShippingAddress,
    setBillingAddress,
    setContactDetails,
    applyGiftCard,
    removeDiscount,
    removeGiftCard,
    updateRegion,
} from "@/lib/data/cart"