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

import { CartResilientLayer as CartResilientLayerClass, globalQueue, CartLocalStorage, CartOperationQueue, type CartSyncStatus } from "./resilient-layer-class"

// ==========================================
// Global instance for easy access
// ==========================================

export const cartResilience = new CartResilientLayerClass()

/**
 * Get current sync status
 */
export async function getCartSyncStatus(): Promise<CartSyncStatus> {
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
export async function clearCartQueue(): Promise<void> {
    globalQueue.clear()
}

// Export classes for internal use
export { CartLocalStorage, CartOperationQueue }

// Export the main class as CartResilientLayer for compatibility
export { CartResilientLayer as CartResilientLayer } from "./resilient-layer-class"
