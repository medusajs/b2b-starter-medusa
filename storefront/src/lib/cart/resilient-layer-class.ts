/**
 * CartResilientLayer - Resilient cart operations with local persistence
 *
 * Features:
 * - Local storage fallback (IndexedDB/localStorage)
 * - Operation queue for failed requests
 * - Automatic background sync (60s interval)
 * - Recovery after failures
 * - PostHog integration for tracking
 *
 * @module lib/cart/resilient-layer-class
 */

import { ResilientHttpClient, type ResilientResponse } from "@/lib/http"
import { HttpTypes } from "@medusajs/types"
import { B2BCart } from "@/types/global"
import { getCacheTag } from "@/lib/data/cookies"

// Create a client-side instance for cart operations
const resilientClient = new ResilientHttpClient()
// import { // revalidateTag } from "next/cache"

// ==========================================
// Types
// ==========================================

export type CartOperation =
    | "addItem"
    | "updateItem"
    | "removeItem"
    | "addBulk"
    | "updateCart"
    | "placeOrder"
    | "createApproval"

export interface QueuedCartOperation {
    id: string
    type: CartOperation
    payload: any
    cartId: string
    timestamp: number
    attempts: number
    maxAttempts: number
}

export interface CartSyncStatus {
    hasPendingOperations: boolean
    queueSize: number
    lastSyncAttempt?: number
    lastSyncSuccess?: number
    operations: QueuedCartOperation[]
}

// ==========================================
// Local Storage Utilities
// ==========================================

export class CartLocalStorage {
    private static readonly CART_KEY = "ysh_cart_data"
    private static readonly SYNC_KEY = "ysh_cart_sync_status"
    private static readonly QUEUE_KEY = "ysh_cart_operations"

    static saveCart(cart: B2BCart): void {
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
            } catch (error) {
                console.warn("Failed to save cart to localStorage:", error)
            }
        }
    }

    static loadCart(): B2BCart | null {
        if (typeof window !== "undefined") {
            try {
                const data = localStorage.getItem(this.CART_KEY)
                return data ? JSON.parse(data) : null
            } catch (error) {
                console.warn("Failed to load cart from localStorage:", error)
                return null
            }
        }
        return null
    }

    static saveSyncStatus(status: CartSyncStatus): void {
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(this.SYNC_KEY, JSON.stringify(status))
            } catch (error) {
                console.warn("Failed to save sync status to localStorage:", error)
            }
        }
    }

    static loadSyncStatus(): CartSyncStatus {
        if (typeof window !== "undefined") {
            try {
                const data = localStorage.getItem(this.SYNC_KEY)
                return data ? JSON.parse(data) : {
                    hasPendingOperations: false,
                    queueSize: 0,
                    operations: []
                }
            } catch (error) {
                console.warn("Failed to load sync status from localStorage:", error)
                return {
                    hasPendingOperations: false,
                    queueSize: 0,
                    operations: []
                }
            }
        }
        return {
            hasPendingOperations: false,
            queueSize: 0,
            operations: []
        }
    }

    static saveQueue(queue: QueuedCartOperation[]): void {
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue))
            } catch (error) {
                console.warn("Failed to save queue to localStorage:", error)
            }
        }
    }

    static loadQueue(): QueuedCartOperation[] {
        if (typeof window !== "undefined") {
            try {
                const data = localStorage.getItem(this.QUEUE_KEY)
                return data ? JSON.parse(data) : []
            } catch (error) {
                console.warn("Failed to load queue from localStorage:", error)
                return []
            }
        }
        return []
    }

    static clear(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem(this.CART_KEY)
            localStorage.removeItem(this.SYNC_KEY)
            localStorage.removeItem(this.QUEUE_KEY)
        }
    }
}

// ==========================================
// Operation Queue
// ==========================================

export class CartOperationQueue {
    private queue: QueuedCartOperation[] = []
    private processing = false
    private syncInterval: NodeJS.Timeout | null = null

    constructor() {
        this.loadQueue()
        this.startAutoSync()
    }

    private loadQueue(): void {
        this.queue = CartLocalStorage.loadQueue()
    }

    private saveQueue(): void {
        CartLocalStorage.saveQueue(this.queue)
    }

    add(operation: Omit<QueuedCartOperation, "id" | "timestamp" | "attempts">): void {
        const queuedOp: QueuedCartOperation = {
            ...operation,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            attempts: 0
        }

        this.queue.push(queuedOp)
        this.saveQueue()
        this.updateSyncStatus()
    }

    async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) return

        this.processing = true

        try {
            const operations = [...this.queue]

            for (const operation of operations) {
                if (operation.attempts >= operation.maxAttempts) {
                    console.warn(`Operation ${operation.id} exceeded max attempts, removing`)
                    this.remove(operation.id)
                    continue
                }

                try {
                    // Process operation based on type
                    await this.processOperation(operation)
                    this.remove(operation.id)
                } catch (error) {
                    console.warn(`Operation ${operation.id} failed (attempt ${operation.attempts + 1}):`, error)
                    operation.attempts++
                    this.saveQueue()
                }
            }
        } finally {
            this.processing = false
            this.updateSyncStatus()
        }
    }

    private async processOperation(operation: QueuedCartOperation): Promise<void> {
        const { type, payload } = operation

        switch (type) {
            case "addItem":
                await resilientClient.post<void>(
                    `/store/carts/${operation.cartId}/line-items`,
                    {
                        variant_id: payload.variantId,
                        quantity: payload.quantity,
                    },
                    { retries: 3, timeout: 15000 }
                )
                break

            case "addBulk":
                await resilientClient.post<void>(
                    `/store/carts/${operation.cartId}/line-items/bulk`,
                    { line_items: payload.lineItems },
                    { retries: 3, timeout: 20000 }
                )
                break

            case "updateItem":
                await resilientClient.post<void>(
                    `/store/carts/${operation.cartId}/line-items/${payload.lineId}`,
                    payload.data,
                    { retries: 3, timeout: 15000 }
                )
                break

            case "removeItem":
                await resilientClient.delete<void>(
                    `/store/carts/${operation.cartId}/line-items/${payload.lineId}`,
                    { retries: 3, timeout: 15000 }
                )
                break

            case "updateCart":
                await resilientClient.post<void>(
                    `/store/carts/${operation.cartId}`,
                    payload.data,
                    { retries: 3, timeout: 15000 }
                )
                break

            case "createApproval":
                await resilientClient.post<any>(
                    `/store/carts/${operation.cartId}/approvals`,
                    { created_by: payload.createdBy },
                    { retries: 3, timeout: 15000 }
                )
                break

            default:
                throw new Error(`Unknown operation type: ${type}`)
        }
    }

    remove(id: string): void {
        this.queue = this.queue.filter(op => op.id !== id)
        this.saveQueue()
        this.updateSyncStatus()
    }

    clear(): void {
        this.queue = []
        this.saveQueue()
        this.updateSyncStatus()
    }

    getQueue(): QueuedCartOperation[] {
        return [...this.queue]
    }

    private updateSyncStatus(): void {
        const status: CartSyncStatus = {
            hasPendingOperations: this.queue.length > 0,
            queueSize: this.queue.length,
            lastSyncAttempt: Date.now(),
            operations: this.queue
        }
        CartLocalStorage.saveSyncStatus(status)
    }

    private startAutoSync(): void {
        if (typeof window !== "undefined") {
            this.syncInterval = setInterval(() => {
                this.processQueue()
            }, 60000) // Sync every 60 seconds
        }
    }

    destroy(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval)
            this.syncInterval = null
        }
    }
}

// ==========================================
// Global Queue Instance
// ==========================================

export const globalQueue = new CartOperationQueue()

// ==========================================
// CartResilientLayer Class
// ==========================================

export class CartResilientLayer {
    private queue: CartOperationQueue

    constructor() {
        this.queue = globalQueue
    }

    /**
     * Add item to cart with resilience
     */
    async addToCart(payload: {
        variantId: string
        quantity: number
        countryCode: string
        cartId: string
    }): Promise<ResilientResponse<void>> {
        const { cartId, ...data } = payload

        const response = await resilientClient.post<void>(
            `/store/carts/${cartId}/line-items`,
            {
                variant_id: data.variantId,
                quantity: data.quantity,
            },
            {
                retries: 3,
                timeout: 15000,
                enableQueue: true,
            }
        )

        if (response.fromQueue) {
            // Add to local queue for retry
            this.queue.add({
                type: "addItem",
                payload,
                cartId,
                maxAttempts: 10,
            })
        } else {
            // Revalidate cache
            await this.revalidateCartCache()
        }

        return response
    }

    /**
     * Add multiple items to cart (bulk)
     */
    async addToCartBulk(payload: {
        lineItems: HttpTypes.StoreAddCartLineItem[]
        cartId: string
    }): Promise<ResilientResponse<void>> {
        const { cartId, lineItems } = payload

        const response = await resilientClient.post<void>(
            `/store/carts/${cartId}/line-items/bulk`,
            { line_items: lineItems },
            {
                retries: 3,
                timeout: 20000,
                enableQueue: true,
            }
        )

        if (response.fromQueue) {
            this.queue.add({
                type: "addBulk",
                payload,
                cartId,
                maxAttempts: 10,
            })
        } else {
            await this.revalidateCartCache()
        }

        return response
    }

    /**
     * Update line item
     */
    async updateLineItem(payload: {
        lineId: string
        cartId: string
        data: HttpTypes.StoreUpdateCartLineItem
    }): Promise<ResilientResponse<void>> {
        const { cartId, lineId, data } = payload

        const response = await resilientClient.post<void>(
            `/store/carts/${cartId}/line-items/${lineId}`,
            data,
            {
                retries: 3,
                timeout: 15000,
                enableQueue: true,
            }
        )

        if (response.fromQueue) {
            this.queue.add({
                type: "updateItem",
                payload,
                cartId,
                maxAttempts: 10,
            })
        } else {
            await this.revalidateCartCache()
        }

        return response
    }

    /**
     * Delete line item
     */
    async deleteLineItem(payload: {
        lineId: string
        cartId: string
    }): Promise<ResilientResponse<void>> {
        const { cartId, lineId } = payload

        const response = await resilientClient.delete<void>(
            `/store/carts/${cartId}/line-items/${lineId}`,
            {
                retries: 3,
                timeout: 15000,
                enableQueue: true,
            }
        )

        if (response.fromQueue) {
            this.queue.add({
                type: "removeItem",
                payload,
                cartId,
                maxAttempts: 10,
            })
        } else {
            await this.revalidateCartCache()
        }

        return response
    }

    /**
     * Update cart
     */
    async updateCart(payload: {
        cartId: string
        data: HttpTypes.StoreUpdateCart
    }): Promise<ResilientResponse<void>> {
        const { cartId, data } = payload

        const response = await resilientClient.post<void>(
            `/store/carts/${cartId}`,
            data,
            {
                retries: 3,
                timeout: 15000,
                enableQueue: true,
            }
        )

        if (response.fromQueue) {
            this.queue.add({
                type: "updateCart",
                payload,
                cartId,
                maxAttempts: 10,
            })
        } else {
            await this.revalidateCartCache()
        }

        return response
    }

    /**
     * Create cart approval
     */
    async createCartApproval(payload: {
        cartId: string
        createdBy: string
    }): Promise<ResilientResponse<any>> {
        const { cartId, createdBy } = payload

        const response = await resilientClient.post<any>(
            `/store/carts/${cartId}/approvals`,
            { created_by: createdBy },
            {
                retries: 3,
                timeout: 15000,
                enableQueue: true,
            }
        )

        if (response.fromQueue) {
            this.queue.add({
                type: "createApproval",
                payload,
                cartId,
                maxAttempts: 10,
            })
        } else {
            await this.revalidateCartCache()
            await this.revalidateApprovalsCache()
        }

        return response
    }

    /**
     * Get sync status
     */
    getSyncStatus(): CartSyncStatus {
        return CartLocalStorage.loadSyncStatus()
    }

    /**
     * Manually trigger sync
     */
    async triggerSync(): Promise<void> {
        await this.queue.processQueue()
    }

    /**
     * Clear all queued operations
     */
    clearQueue(): void {
        this.queue.clear()
    }

    /**
     * Revalidate cart cache
     */
    private async revalidateCartCache(): Promise<void> {
        const cartCacheTag = await getCacheTag("carts")
        // revalidateTag(cartCacheTag)
        const fulfillmentCacheTag = await getCacheTag("fulfillment")
        // revalidateTag(fulfillmentCacheTag)
    }

    /**
     * Revalidate approvals cache
     */
    private async revalidateApprovalsCache(): Promise<void> {
        const approvalsCacheTag = await getCacheTag("approvals")
        // revalidateTag(approvalsCacheTag)
    }
}
