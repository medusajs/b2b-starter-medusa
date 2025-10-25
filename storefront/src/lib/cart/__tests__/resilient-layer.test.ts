/**
 * Integration tests for CartResilientLayer
 * 
 * Coverage:
 * - Add to cart with retry
 * - Bulk add with queue
 * - Update line item with fallback
 * - Delete line item with recovery
 * - Queue processing
 * - Sync status tracking
 */

import { CartResilientLayer, getCartSyncStatus, clearCartQueue } from "../resilient-layer"
import { resilientClient } from "@/lib/http"

// Mock resilientClient
jest.mock("@/lib/http", () => ({
    resilientClient: {
        post: jest.fn(),
        delete: jest.fn(),
    },
}))

// Mock next/cache
jest.mock("next/cache", () => ({
    revalidateTag: jest.fn(),
}))

// Mock cookies
jest.mock("@/lib/data/cookies", () => ({
    getCacheTag: jest.fn((tag: string) => Promise.resolve(`cache_${tag}`)),
}))

describe("CartResilientLayer", () => {
    let cartResilience: CartResilientLayer

    beforeEach(() => {
        cartResilience = new CartResilientLayer()
        clearCartQueue()
        jest.clearAllMocks()

        // Mock localStorage
        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        } as any
    })

    describe("addToCart", () => {
        it("should add item to cart successfully", async () => {
            const mockResponse = {
                data: null,
                fromCache: false,
                fromQueue: false,
                attempts: 1,
            }

                ; (resilientClient.post as jest.Mock).mockResolvedValueOnce(mockResponse)

            const result = await cartResilience.addToCart({
                variantId: "variant_123",
                quantity: 2,
                countryCode: "br",
                cartId: "cart_abc",
            })

            expect(result.fromQueue).toBe(false)
            expect(resilientClient.post).toHaveBeenCalledWith(
                "/store/carts/cart_abc/line-items",
                {
                    variant_id: "variant_123",
                    quantity: 2,
                },
                expect.objectContaining({
                    retries: 3,
                    timeout: 15000,
                    enableQueue: true,
                })
            )
        })

        it("should queue operation if request fails", async () => {
            const mockResponse = {
                data: null,
                fromCache: false,
                fromQueue: true,
                attempts: 3,
                error: new Error("Network error"),
            }

                ; (resilientClient.post as jest.Mock).mockResolvedValueOnce(mockResponse)

            const result = await cartResilience.addToCart({
                variantId: "variant_123",
                quantity: 2,
                countryCode: "br",
                cartId: "cart_abc",
            })

            expect(result.fromQueue).toBe(true)

            const status = getCartSyncStatus()
            expect(status.hasPendingOperations).toBe(true)
        })
    })

    describe("addToCartBulk", () => {
        it("should add multiple items to cart", async () => {
            const mockResponse = {
                data: null,
                fromCache: false,
                fromQueue: false,
                attempts: 1,
            }

                ; (resilientClient.post as jest.Mock).mockResolvedValueOnce(mockResponse)

            const lineItems = [
                { variant_id: "var_1", quantity: 1 },
                { variant_id: "var_2", quantity: 2 },
            ]

            const result = await cartResilience.addToCartBulk({
                lineItems,
                cartId: "cart_abc",
            })

            expect(result.fromQueue).toBe(false)
            expect(resilientClient.post).toHaveBeenCalledWith(
                "/store/carts/cart_abc/line-items/bulk",
                { line_items: lineItems },
                expect.objectContaining({
                    retries: 3,
                    timeout: 20000,
                })
            )
        })

        it("should queue bulk operation if fails", async () => {
            const mockResponse = {
                data: null,
                fromCache: false,
                fromQueue: true,
                attempts: 3,
            }

                ; (resilientClient.post as jest.Mock).mockResolvedValueOnce(mockResponse)

            const lineItems = [{ variant_id: "var_1", quantity: 1 }]

            const result = await cartResilience.addToCartBulk({
                lineItems,
                cartId: "cart_abc",
            })

            expect(result.fromQueue).toBe(true)
        })
    })

    describe("updateLineItem", () => {
        it("should update line item successfully", async () => {
            const mockResponse = {
                data: null,
                fromCache: false,
                fromQueue: false,
                attempts: 1,
            }

                ; (resilientClient.post as jest.Mock).mockResolvedValueOnce(mockResponse)

            const result = await cartResilience.updateLineItem({
                lineId: "line_123",
                cartId: "cart_abc",
                data: { quantity: 5 },
            })

            expect(result.fromQueue).toBe(false)
            expect(resilientClient.post).toHaveBeenCalledWith(
                "/store/carts/cart_abc/line-items/line_123",
                { quantity: 5 },
                expect.any(Object)
            )
        })
    })

    describe("deleteLineItem", () => {
        it("should delete line item successfully", async () => {
            const mockResponse = {
                data: null,
                fromCache: false,
                fromQueue: false,
                attempts: 1,
            }

                ; (resilientClient.delete as jest.Mock).mockResolvedValueOnce(mockResponse)

            const result = await cartResilience.deleteLineItem({
                lineId: "line_123",
                cartId: "cart_abc",
            })

            expect(result.fromQueue).toBe(false)
            expect(resilientClient.delete).toHaveBeenCalledWith(
                "/store/carts/cart_abc/line-items/line_123",
                expect.any(Object)
            )
        })

        it("should queue delete if fails", async () => {
            const mockResponse = {
                data: null,
                fromCache: false,
                fromQueue: true,
                attempts: 3,
            }

                ; (resilientClient.delete as jest.Mock).mockResolvedValueOnce(mockResponse)

            const result = await cartResilience.deleteLineItem({
                lineId: "line_123",
                cartId: "cart_abc",
            })

            expect(result.fromQueue).toBe(true)
        })
    })

    describe("updateCart", () => {
        it("should update cart metadata", async () => {
            const mockResponse = {
                data: null,
                fromCache: false,
                fromQueue: false,
                attempts: 1,
            }

                ; (resilientClient.post as jest.Mock).mockResolvedValueOnce(mockResponse)

            const result = await cartResilience.updateCart({
                cartId: "cart_abc",
                data: { email: "test@example.com" },
            })

            expect(result.fromQueue).toBe(false)
            expect(resilientClient.post).toHaveBeenCalledWith(
                "/store/carts/cart_abc",
                { email: "test@example.com" },
                expect.any(Object)
            )
        })
    })

    describe("createCartApproval", () => {
        it("should create approval successfully", async () => {
            const mockResponse = {
                data: { approval_id: "appr_123" },
                fromCache: false,
                fromQueue: false,
                attempts: 1,
            }

                ; (resilientClient.post as jest.Mock).mockResolvedValueOnce(mockResponse)

            const result = await cartResilience.createCartApproval({
                cartId: "cart_abc",
                createdBy: "user_123",
            })

            expect(result.fromQueue).toBe(false)
            expect(resilientClient.post).toHaveBeenCalledWith(
                "/store/carts/cart_abc/approvals",
                { created_by: "user_123" },
                expect.any(Object)
            )
        })
    })

    describe("Sync status", () => {
        it("should track sync status", () => {
            const status = getCartSyncStatus()

            expect(status).toHaveProperty("hasPendingOperations")
            expect(status).toHaveProperty("queueSize")
            expect(status).toHaveProperty("operations")
        })

        it("should clear queue", () => {
            clearCartQueue()

            const status = getCartSyncStatus()
            expect(status.queueSize).toBe(0)
        })
    })

    describe("Queue management", () => {
        it("should return sync status with queue info", () => {
            const status = cartResilience.getSyncStatus()

            expect(status).toBeDefined()
            expect(typeof status.hasPendingOperations).toBe("boolean")
            expect(typeof status.queueSize).toBe("number")
        })

        it("should clear queue via instance method", () => {
            cartResilience.clearQueue()

            const status = cartResilience.getSyncStatus()
            expect(status.queueSize).toBe(0)
        })
    })
})
