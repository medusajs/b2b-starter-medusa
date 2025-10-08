/**
 * Medusa.js SDK Configuration & Usage Examples
 * 
 * This file documents the Medusa v2 SDK setup and provides
 * canonical examples for Store API interactions.
 * 
 * @see https://docs.medusajs.com/resources/js-sdk
 * @see https://docs.medusajs.com/api/store
 */

import { sdk } from "./config"

// ============================================================================
// SDK Instance (configured in config.ts)
// ============================================================================

/**
 * The SDK is already configured with:
 * - baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
 * - publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
 * - debug: enabled in development
 * 
 * All Store API routes are prefixed with `/store`
 * All Admin API routes are prefixed with `/admin`
 */

export { sdk }

// ============================================================================
// Store API Examples (PUBLIC)
// ============================================================================

/**
 * Product Listing (PLP)
 * 
 * @example
 * const products = await sdk.store.product.list({
 *   region_id: "reg_01...",
 *   limit: 20,
 *   offset: 0,
 *   fields: "*variants,*images"
 * })
 */
export async function getProducts(params: {
    region_id?: string
    limit?: number
    offset?: number
    category_id?: string
    collection_id?: string
    q?: string // search query
}) {
    return await sdk.store.product.list({
        ...params,
        fields: "*variants,*images,*categories,*tags",
    })
}

/**
 * Product Detail (PDP)
 * 
 * @example
 * const product = await sdk.store.product.retrieve("prod_01...", {
 *   region_id: "reg_01...",
 *   fields: "*variants.calculated_price,*images"
 * })
 */
export async function getProduct(id: string, region_id?: string) {
    return await sdk.store.product.retrieve(id, {
        region_id,
        fields: "*variants.calculated_price,*images,*options,*categories,*tags",
    })
}

/**
 * Cart Management
 * 
 * @example
 * // Create cart
 * const cart = await sdk.store.cart.create({
 *   region_id: "reg_01...",
 *   sales_channel_id: "sc_01..."
 * })
 * 
 * // Add line item
 * await sdk.store.cart.createLineItem(cart.id, {
 *   variant_id: "variant_01...",
 *   quantity: 1
 * })
 * 
 * // Update line item
 * await sdk.store.cart.updateLineItem(cart.id, lineItemId, {
 *   quantity: 2
 * })
 * 
 * // Remove line item
 * await sdk.store.cart.deleteLineItem(cart.id, lineItemId)
 */
export async function createCart(params: {
    region_id: string
    sales_channel_id?: string
    country_code?: string
}) {
    return await sdk.store.cart.create(params)
}

export async function getCart(id: string) {
    return await sdk.store.cart.retrieve(id)
}

export async function addToCart(
    cartId: string,
    variantId: string,
    quantity: number
) {
    return await sdk.store.cart.createLineItem(cartId, {
        variant_id: variantId,
        quantity,
    })
}

export async function updateCartItem(
    cartId: string,
    lineItemId: string,
    quantity: number
) {
    return await sdk.store.cart.updateLineItem(cartId, lineItemId, { quantity })
}

export async function removeFromCart(cartId: string, lineItemId: string) {
    return await sdk.store.cart.deleteLineItem(cartId, lineItemId)
}

/**
 * Regions & Currencies
 * 
 * @example
 * const regions = await sdk.store.region.list()
 * const region = await sdk.store.region.retrieve("reg_01...")
 */
export async function getRegions() {
    return await sdk.store.region.list()
}

export async function getRegion(id: string) {
    return await sdk.store.region.retrieve(id)
}

/**
 * Collections
 * 
 * @example
 * const collections = await sdk.store.collection.list()
 * const collection = await sdk.store.collection.retrieve("pcol_01...")
 */
export async function getCollections() {
    return await sdk.store.collection.list()
}

export async function getCollection(id: string) {
    return await sdk.store.collection.retrieve(id, {
        fields: "*products",
    })
}

/**
 * Categories
 * 
 * @example
 * const categories = await sdk.store.category.list()
 * const category = await sdk.store.category.retrieve("pcat_01...")
 */
export async function getCategories(params?: {
    parent_category_id?: string
    include_descendants_tree?: boolean
}) {
    return await sdk.store.category.list(params)
}

export async function getCategory(id: string) {
    return await sdk.store.category.retrieve(id, {
        fields: "*products,*category_children",
    })
}

/**
 * Customer Authentication
 *
 * @example
 * // Register
 * await sdk.store.customer.create({
 *   email: "user@example.com",
 *   password: "password123"
 * })
 *
 * // Login
 * await sdk.auth.authenticate("customer", "emailpass", {
 *   email: "user@example.com",
 *   password: "password123"
 * })
 *
 * // Get current customer
 * const customer = await sdk.store.customer.retrieve()
 */

/**
 * Payment Sessions (Stripe, PayPal, etc.)
 *
 * @example
 * // Initialize payment sessions
 * const cart = await sdk.store.cart.initializePaymentSession(cartId)
 *
 * // Select payment provider
 * await sdk.store.cart.setPaymentSession(cartId, {
 *   provider_id: "stripe"
 * })
 */

/**
 * Order Completion
 *
 * @example
 * // Complete cart → order
 * const order = await sdk.store.cart.complete(cartId)
 *
 * // Retrieve order
 * const order = await sdk.store.order.retrieve(orderId)
 */

// ============================================================================
// Environment Variables Required
// ============================================================================

/**
 * Storefront (.env.local):
 * - NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
 * - NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
 * - NEXT_PUBLIC_STRIPE_KEY=pk_test_... (if using Stripe)
 * - NEXT_PUBLIC_PAYPAL_CLIENT_ID=... (if using PayPal)
 *
 * Backend (.env):
 * - DATABASE_URL=postgresql://...
 * - STORE_CORS=http://localhost:8000
 * - ADMIN_CORS=http://localhost:7001
 * - STRIPE_API_KEY=sk_test_... (if using Stripe)
 * - STRIPE_WEBHOOK_SECRET=whsec_...
 */

// ============================================================================
// Medusa v2 Standards Checklist
// ============================================================================

/**
 * ✅ Use @medusajs/js-sdk (v2) for Store API
 * ✅ Configure baseUrl from NEXT_PUBLIC_MEDUSA_BACKEND_URL
 * ✅ Use publishableKey for multi-tenant/sales-channel support
 * ✅ All Store API routes prefixed with /store
 * ✅ All Admin API routes prefixed with /admin
 * ✅ Configure STORE_CORS in backend to allow storefront domain
 * ✅ Maintain at least one Region (e.g., BR/BRL) for pricing
 * ✅ Use Stripe provider for payment processing (optional)
 * ✅ Follow Next.js Starter conventions for routing/layout
 * 
 * @see https://docs.medusajs.com/resources/nextjs-starter
 * @see https://docs.medusajs.com/api/store
 */
