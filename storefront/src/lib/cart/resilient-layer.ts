"use server"
import "server-only"

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
 * @module lib/cart/resilient-layer
 */

import { resilientClient, type ResilientResponse } from "@/lib/http"
import { HttpTypes } from "@medusajs/types"
import { B2BCart } from "@/types/global"
import { getCacheTag } from "@/lib/data/cookies"
import { revalidateTag } from "next/cache"

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

export interface CartResilientOptions {
    retries?: number
    timeout?: number
    enableQueue?: boolean
    enableLocalStorage?: boolean
}

// ==========================================
// Local Storage Manager
// ==========================================

class CartLocalStorage {
    private static CART_KEY = "ysh_cart_local"
    private static QUEUE_KEY = "ysh_cart_queue"
    private static SYNC_STATUS_KEY = "ysh_cart_sync_status"

    /**
     * Save cart to local storage
     */
    static saveCart(cart: B2BCart | null): void {
        if (typeof window === "undefined") return

        try {
            if (cart) {
                localStorage.setItem(this.CART_KEY, JSON.stringify(cart))
            } else {
                localStorage.removeItem(this.CART_KEY)
            }
        } catch (error) {
            console.error("[CartLocalStorage] Failed to save cart:", error)
        }
    }

    /**
     * Load cart from local storage
     */
    static loadCart(): B2BCart | null {
        if (typeof window === "undefined") return null

        try {
            const data = localStorage.getItem(this.CART_KEY)
            return data ? JSON.parse(data) : null
        } catch (error) {
            console.error("[CartLocalStorage] Failed to load cart:", error)
            return null
        }
    }

    /**
     * Save operation to queue
     */
    static saveQueue(queue: QueuedCartOperation[]): void {
        if (typeof window === "undefined") return

        try {
            localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue))
        } catch (error) {
            console.error("[CartLocalStorage] Failed to save queue:", error)
        }
    }

    /**
     * Load queue from storage
     */
    static loadQueue(): QueuedCartOperation[] {
        if (typeof window === "undefined") return []

        try {
            const data = localStorage.getItem(this.QUEUE_KEY)
            return data ? JSON.parse(data) : []
        } catch (error) {
            console.error("[CartLocalStorage] Failed to load queue:", error)
            return []
        }
    }

    /**
     * Save sync status
     */
    static saveSyncStatus(status: Partial<CartSyncStatus>): void {
        if (typeof window === "undefined") return

        try {
            const current = this.loadSyncStatus()
            const updated = { ...current, ...status }
            localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(updated))
        } catch (error) {
            console.error("[CartLocalStorage] Failed to save sync status:", error)
        }
    }

    /**
     * Load sync status
     */
    static loadSyncStatus(): CartSyncStatus {
        if (typeof window === "undefined") {
            return {
                hasPendingOperations: false,
                queueSize: 0,
                operations: [],
            }
        }

        try {
            const data = localStorage.getItem(this.SYNC_STATUS_KEY)
            return data
                ? JSON.parse(data)
                : {
                    hasPendingOperations: false,
                    queueSize: 0,
                    operations: [],
                }
        } catch (error) {
            console.error("[CartLocalStorage] Failed to load sync status:", error)
            return {
                hasPendingOperations: false,
                queueSize: 0,
                operations: [],
            }
        }
    }

    /**
     * Clear all cart data
     */
    static clear(): void {
        if (typeof window === "undefined") return

        try {
            localStorage.removeItem(this.CART_KEY)
            localStorage.removeItem(this.QUEUE_KEY)
            localStorage.removeItem(this.SYNC_STATUS_KEY)
        } catch (error) {
            console.error("[CartLocalStorage] Failed to clear:", error)
        }
    }
}

// ==========================================
// Cart Operation Queue
// ==========================================

class CartOperationQueue {
    private queue: QueuedCartOperation[] = []
    private processing = false
    private syncInterval: NodeJS.Timeout | null = null

    constructor() {
        this.loadQueue()
        this.startAutoSync()
    }

    /**
     * Add operation to queue
     */
    add(operation: Omit<QueuedCartOperation, "id" | "timestamp" | "attempts">): void {
        const queuedOp: QueuedCartOperation = {
            ...operation,
            id: this.generateId(),
            timestamp: Date.now(),
            attempts: 0,
        }

        this.queue.push(queuedOp)
        this.saveQueue()
        this.updateSyncStatus()

        // Track event
        this.trackEvent("cart_operation_queued", {
            operation_type: operation.type,
            cart_id: operation.cartId,
            queue_size: this.queue.length,
        })
    }

    /**
     * Get all operations
     */
    getAll(): QueuedCartOperation[] {
        return [...this.queue]
    }

    /**
     * Get queue size
     */
    size(): number {
        return this.queue.length
    }

    /**
     * Remove operation from queue
     */
    remove(operationId: string): void {
        this.queue = this.queue.filter((op) => op.id !== operationId)
        this.saveQueue()
        this.updateSyncStatus()
    }

    /**
     * Clear entire queue
     */
    clear(): void {
        this.queue = []
        this.saveQueue()
        this.updateSyncStatus()
    }

    /**
     * Load queue from storage
     */
    private loadQueue(): void {
        this.queue = CartLocalStorage.loadQueue()
    }

    /**
     * Save queue to storage
     */
    private saveQueue(): void {
        CartLocalStorage.saveQueue(this.queue)
    }

    /**
     * Update sync status
     */
    private updateSyncStatus(): void {
        CartLocalStorage.saveSyncStatus({
            hasPendingOperations: this.queue.length > 0,
            queueSize: this.queue.length,
            operations: this.queue,
            lastSyncAttempt: Date.now(),
        })
    }

    /**
     * Start automatic sync
     */
    private startAutoSync(): void {
        if (typeof window === "undefined") return

        // Sync every 60 seconds
        this.syncInterval = setInterval(() => {
            if (this.queue.length > 0 && !this.processing) {
                this.processQueue()
            }
        }, 60000)
    }

    /**
     * Stop automatic sync
     */
    stopAutoSync(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval)
            this.syncInterval = null
        }
    }

    /**
     * Process queue manually
     */
    async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) return

        this.processing = true
        this.updateSyncStatus()

        const operations = [...this.queue]

        for (const op of operations) {
            try {
                // Execute operation based on type
                await this.executeOperation(op)

                // Success - remove from queue
                this.remove(op.id)

                // Track success
                this.trackEvent("cart_sync_success", {
                    operation_id: op.id,
                    operation_type: op.type,
                    attempts: op.attempts + 1,
                    time_in_queue_ms: Date.now() - op.timestamp,
                })
            } catch (error) {
                // Update attempts
                op.attempts++

                if (op.attempts >= op.maxAttempts) {
                    // Max attempts reached - remove from queue
                    this.remove(op.id)

                    // Track failure
                    this.trackEvent("cart_sync_failed", {
                        operation_id: op.id,
                        operation_type: op.type,
                        attempts: op.attempts,
                        error: error instanceof Error ? error.message : "Unknown",
                        will_retry: false,
                    })
                } else {
                    // Will retry - save updated attempts
                    this.saveQueue()

                    // Track retry
                    this.trackEvent("cart_sync_failed", {
                        operation_id: op.id,
                        operation_type: op.type,
                        attempts: op.attempts,
                        error: error instanceof Error ? error.message : "Unknown",
                        will_retry: true,
                    })
                }
            }
        }

        this.processing = false

        // Update final sync status
        CartLocalStorage.saveSyncStatus({
            lastSyncSuccess: Date.now(),
            hasPendingOperations: this.queue.length > 0,
            queueSize: this.queue.length,
            operations: this.queue,
        })
    }

    /**
     * Execute a queued operation
     */
    private async executeOperation(op: QueuedCartOperation): Promise<void> {
        const cartResilience = new CartResilientLayer()

        switch (op.type) {
            case "addItem":
                await cartResilience.addToCart(op.payload)
                break
            case "updateItem":
                await cartResilience.updateLineItem(op.payload)
                break
            case "removeItem":
                await cartResilience.deleteLineItem(op.payload)
                break
            case "addBulk":
                await cartResilience.addToCartBulk(op.payload)
                break
            case "updateCart":
                await cartResilience.updateCart(op.payload)
                break
            case "createApproval":
                await cartResilience.createCartApproval(op.payload)
                break
            default:
                throw new Error(`Unknown operation type: ${op.type}`)
        }
    }

    /**
     * Generate unique operation ID
     */
    private generateId(): string {
        return `cart_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    /**
     * Track event to PostHog
     */
    private trackEvent(event: string, properties: Record<string, any>): void {
        if (typeof window !== "undefined" && (window as any).posthog) {
            (window as any).posthog.capture(event, properties)
        }
    }
}

// Global queue instance
const globalQueue = new CartOperationQueue()

// ==========================================
// CartResilientLayer
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
        revalidateTag(cartCacheTag)
        const fulfillmentCacheTag = await getCacheTag("fulfillment")
        revalidateTag(fulfillmentCacheTag)
    }

    /**
     * Revalidate approvals cache
     */
    private async revalidateApprovalsCache(): Promise<void> {
        const approvalsCacheTag = await getCacheTag("approvals")
        revalidateTag(approvalsCacheTag)
    }
}

// ==========================================
// Exports
// ==========================================

/**
 * Global instance for easy access
 */
export const cartResilience = new CartResilientLayer()

/**
 * Get current sync status
 */
export function getCartSyncStatus(): CartSyncStatus {
    return CartLocalStorage.loadSyncStatus()
}

/**
 * Trigger manual sync
 */
export async function triggerCartSync(): Promise<void> {
    await globalQueue.processQueue()
}

/**
 * Clear cart queue
 */
export function clearCartQueue(): void {
    globalQueue.clear()
}
