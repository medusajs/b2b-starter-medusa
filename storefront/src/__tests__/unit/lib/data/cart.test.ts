/**
 * @file cart.test.ts
 * @description Tests for cart data layer operations
 * @module lib/data/cart
 * @jest-environment node
 */

import { sdk } from "@/lib/config"
import {
    retrieveCart,
    getOrSetCart,
    updateCart,
    addToCart,
    addToCartBulk,
    updateLineItem,
    deleteLineItem,
    emptyCart,
    setShippingMethod,
    initiatePaymentSession,
    applyPromotions,
    setShippingAddress,
    setBillingAddress,
    setContactDetails,
    placeOrder,
    updateRegion,
    createCartApproval,
} from "@/lib/data/cart"
import {
    getAuthHeaders,
    getCacheOptions,
    getCacheTag,
    getCartId,
    removeCartId,
    setCartId,
} from "@/lib/data/cookies"
import { retrieveCustomer } from "@/lib/data/customer"
import { getRegion } from "@/lib/data/regions"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { track } from "@vercel/analytics/server"

// Mock dependencies
jest.mock("@/lib/config", () => ({
    sdk: {
        client: {
            fetch: jest.fn(),
        },
        store: {
            cart: {
                create: jest.fn(),
                update: jest.fn(),
                complete: jest.fn(),
                createLineItem: jest.fn(),
                updateLineItem: jest.fn(),
                deleteLineItem: jest.fn(),
                addShippingMethod: jest.fn(),
            },
            payment: {
                initiatePaymentSession: jest.fn(),
            },
        },
    },
}))

jest.mock("@/lib/data/cookies")
jest.mock("@/lib/data/customer")
jest.mock("@/lib/data/regions")
jest.mock("next/cache")
jest.mock("next/navigation")
jest.mock("@vercel/analytics/server")

// Mock timers for sleep/retry tests
jest.useFakeTimers()

describe("cart.ts - Data Layer", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.clearAllTimers()
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
    })

    // ==========================================
    // Part 1: Utility Functions (Retry Logic)
    // ==========================================

    describe("retryWithBackoff utility", () => {
        it("should succeed on first attempt", async () => {
            const mockFn = jest.fn().mockResolvedValue("success")
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: { id: "cart_123" } })

            const result = await retrieveCart("cart_123")

            expect(result).toEqual({ id: "cart_123" })
        })

        it("should retry on failure and eventually succeed", async () => {
            const mockError = new Error("Network error")
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock)
                    .mockRejectedValueOnce(mockError)
                    .mockRejectedValueOnce(mockError)
                    .mockResolvedValueOnce({ cart: { id: "cart_123" } })

            const resultPromise = retrieveCart("cart_123")

            // Fast-forward through retry delays
            await jest.advanceTimersByTimeAsync(1000) // First retry
            await jest.advanceTimersByTimeAsync(2000) // Second retry (exponential backoff)

            const result = await resultPromise

            expect(result).toEqual({ id: "cart_123" })
            expect(sdk.client.fetch).toHaveBeenCalledTimes(3)
        })

        it("should fail after max retries exhausted", async () => {
            const mockError = new Error("Permanent failure")
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockRejectedValue(mockError)

            const resultPromise = retrieveCart("cart_123")

            // Fast-forward through all retry attempts
            await jest.advanceTimersByTimeAsync(1000) // First retry
            await jest.advanceTimersByTimeAsync(2000) // Second retry
            await jest.advanceTimersByTimeAsync(4000) // Third retry

            const result = await resultPromise

            // retrieveCart catches errors and returns null
            expect(result).toBeNull()
            expect(sdk.client.fetch).toHaveBeenCalledTimes(4) // Initial + 3 retries
        })

        it("should use exponential backoff delays", async () => {
            const consoleSpy = jest.spyOn(console, "warn").mockImplementation()
            const mockError = new Error("Temporary error")
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock)
                    .mockRejectedValueOnce(mockError)
                    .mockRejectedValueOnce(mockError)
                    .mockResolvedValueOnce({ cart: { id: "cart_123" } })

            const resultPromise = retrieveCart("cart_123")

            await jest.advanceTimersByTimeAsync(1000) // 1st retry: 1000ms
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("[Cart] Retrying after 1000ms")
            )

            await jest.advanceTimersByTimeAsync(2000) // 2nd retry: 2000ms (exponential)
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining("[Cart] Retrying after 2000ms")
            )

            await resultPromise

            consoleSpy.mockRestore()
        })
    })

    // ==========================================
    // Part 2: Cart Retrieval Functions
    // ==========================================

    describe("retrieveCart", () => {
        it("should retrieve cart by provided ID", async () => {
            const mockCart = { id: "cart_123", items: [] }
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({ Authorization: "Bearer token" })
                ; (getCacheOptions as jest.Mock).mockResolvedValue({ revalidate: 3600 })
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: mockCart })

            const result = await retrieveCart("cart_123")

            expect(result).toEqual(mockCart)
            expect(sdk.client.fetch).toHaveBeenCalledWith(
                "/store/carts/cart_123",
                expect.objectContaining({
                    method: "GET",
                    credentials: "include",
                    cache: "force-cache",
                })
            )
        })

        it("should retrieve cart using cookie ID when no ID provided", async () => {
            const mockCart = { id: "cart_456", items: [] }
                ; (getCartId as jest.Mock).mockResolvedValue("cart_456")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: mockCart })

            const result = await retrieveCart()

            expect(result).toEqual(mockCart)
            expect(getCartId).toHaveBeenCalled()
        })

        it("should return null when no cart ID available", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue(null)

            const result = await retrieveCart()

            expect(result).toBeNull()
            expect(sdk.client.fetch).not.toHaveBeenCalled()
        })

        it("should return null on fetch error", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockRejectedValue(new Error("Not found"))

            const resultPromise = retrieveCart("cart_123")

            // Fast-forward through all retries
            await jest.advanceTimersByTimeAsync(7000) // Total retry time

            const result = await resultPromise

            expect(result).toBeNull()
        })

        it("should include all required query fields", async () => {
            const mockCart = { id: "cart_123", items: [] }
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: mockCart })

            await retrieveCart("cart_123")

            const callArgs = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(callArgs.query.fields).toContain("*items")
            expect(callArgs.query.fields).toContain("*region")
            expect(callArgs.query.fields).toContain("*promotions")
            expect(callArgs.query.fields).toContain("*approvals")
        })
    })

    describe("getOrSetCart", () => {
        it("should return existing cart", async () => {
            const mockCart = { id: "cart_123", region_id: "region_br" }
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: mockCart })
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (retrieveCustomer as jest.Mock).mockResolvedValue(null)

            const result = await getOrSetCart("br")

            expect(result).toEqual(mockCart)
            expect(sdk.store.cart.create).not.toHaveBeenCalled()
        })

        it("should create new cart when none exists", async () => {
            const mockRegion = { id: "region_br", name: "Brazil" }
            const mockCustomer = { id: "cust_123", employee: { company_id: "comp_123" } }
            const newCart = { id: "cart_new", region_id: "region_br" }
                ; (getCartId as jest.Mock).mockResolvedValue(null)
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (retrieveCustomer as jest.Mock).mockResolvedValue(mockCustomer)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.create as jest.Mock).mockResolvedValue({ cart: newCart })
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: newCart })

            const result = await getOrSetCart("br")

            expect(sdk.store.cart.create).toHaveBeenCalledWith(
                {
                    region_id: "region_br",
                    metadata: { company_id: "comp_123" },
                },
                {},
                {}
            )
            expect(setCartId).toHaveBeenCalledWith("cart_new")
            expect(revalidateTag).toHaveBeenCalledWith("carts")
        })

        it("should throw error when region not found", async () => {
            ; (getRegion as jest.Mock).mockResolvedValue(null)

            await expect(getOrSetCart("invalid")).rejects.toThrow(
                "Region not found for country code: invalid"
            )
        })

        it("should update cart region if mismatched", async () => {
            const mockCart = { id: "cart_123", region_id: "region_us" }
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: mockCart })
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (retrieveCustomer as jest.Mock).mockResolvedValue(null)
                ; (sdk.store.cart.update as jest.Mock).mockResolvedValue({})

            await getOrSetCart("br")

            expect(sdk.store.cart.update).toHaveBeenCalledWith(
                "cart_123",
                { region_id: "region_br" },
                {},
                {}
            )
            expect(revalidateTag).toHaveBeenCalledWith("carts")
        })
    })

    // ==========================================
    // Part 3: Cart Mutation Functions
    // ==========================================

    describe("updateCart", () => {
        it("should update cart with provided data", async () => {
            const updateData = { email: "test@example.com" }
            const updatedCart = { id: "cart_123", email: "test@example.com" }
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.update as jest.Mock).mockResolvedValue({ cart: updatedCart })

            const result = await updateCart(updateData)

            expect(sdk.store.cart.update).toHaveBeenCalledWith("cart_123", updateData, {}, {})
            expect(result).toEqual(updatedCart)
            expect(revalidateTag).toHaveBeenCalledWith("carts")
        })

        it("should throw error when no cart exists", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue(null)

            await expect(updateCart({ email: "test@example.com" })).rejects.toThrow(
                "No existing cart found, please create one before updating"
            )
        })

        it("should revalidate both carts and fulfillment tags", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock)
                    .mockResolvedValueOnce("fulfillment")
                    .mockResolvedValueOnce("carts")
                ; (sdk.store.cart.update as jest.Mock).mockResolvedValue({ cart: {} })

            await updateCart({ email: "test@example.com" })

            expect(revalidateTag).toHaveBeenCalledWith("fulfillment")
            expect(revalidateTag).toHaveBeenCalledWith("carts")
        })
    })

    describe("addToCart", () => {
        it("should add line item to cart", async () => {
            const mockCart = { id: "cart_123" }
                ; (getCartId as jest.Mock).mockResolvedValue(null)
                ; (getRegion as jest.Mock).mockResolvedValue({ id: "region_br" })
                ; (retrieveCustomer as jest.Mock).mockResolvedValue(null)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.create as jest.Mock).mockResolvedValue({ cart: mockCart })
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: mockCart })
                ; (sdk.store.cart.createLineItem as jest.Mock).mockResolvedValue({})

            await addToCart({
                variantId: "variant_123",
                quantity: 2,
                countryCode: "br",
            })

            expect(sdk.store.cart.createLineItem).toHaveBeenCalledWith(
                "cart_123",
                { variant_id: "variant_123", quantity: 2 },
                {},
                {}
            )
        })

        it("should throw error when variantId missing", async () => {
            await expect(
                addToCart({
                    variantId: "",
                    quantity: 1,
                    countryCode: "br",
                })
            ).rejects.toThrow("Missing variant ID when adding to cart")
        })

        it("should throw error when cart retrieval fails", async () => {
            ; (getRegion as jest.Mock).mockResolvedValue({ id: "region_br" })
                ; (retrieveCustomer as jest.Mock).mockResolvedValue(null)
                ; (getCartId as jest.Mock).mockResolvedValue(null)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.store.cart.create as jest.Mock).mockRejectedValue(new Error("Creation failed"))

            const addPromise = addToCart({
                variantId: "variant_123",
                quantity: 1,
                countryCode: "br",
            })

            await jest.advanceTimersByTimeAsync(7000)

            await expect(addPromise).rejects.toThrow("Error retrieving or creating cart")
        })
    })

    describe("addToCartBulk", () => {
        it("should add multiple line items to cart", async () => {
            const mockCart = { id: "cart_123" }
            const lineItems = [
                { variant_id: "var_1", quantity: 1 },
                { variant_id: "var_2", quantity: 2 },
            ]
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getRegion as jest.Mock).mockResolvedValue({ id: "region_br" })
                ; (retrieveCustomer as jest.Mock).mockResolvedValue(null)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: mockCart })

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({}),
            })

            await addToCartBulk({ lineItems, countryCode: "br" })

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/store/carts/cart_123/line-items/bulk"),
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({ line_items: lineItems }),
                })
            )
        })

        it("should handle bulk add failure", async () => {
            const mockCart = { id: "cart_123" }
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getRegion as jest.Mock).mockResolvedValue({ id: "region_br" })
                ; (retrieveCustomer as jest.Mock).mockResolvedValue(null)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: mockCart })

            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 400,
            })

            const bulkPromise = addToCartBulk({
                lineItems: [{ variant_id: "var_1", quantity: 1 }],
                countryCode: "br",
            })

            await jest.advanceTimersByTimeAsync(7000)

            await expect(bulkPromise).rejects.toThrow()
        })
    })

    describe("updateLineItem", () => {
        it("should update line item quantity", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.updateLineItem as jest.Mock).mockResolvedValue({})

            await updateLineItem({
                lineId: "line_123",
                data: { quantity: 5 },
            })

            expect(sdk.store.cart.updateLineItem).toHaveBeenCalledWith(
                "cart_123",
                "line_123",
                { quantity: 5 },
                {},
                {}
            )
        })

        it("should throw error when lineId missing", async () => {
            await expect(
                updateLineItem({
                    lineId: "",
                    data: { quantity: 1 },
                })
            ).rejects.toThrow("Missing lineItem ID when updating line item")
        })

        it("should throw error when cartId missing", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue(null)

            await expect(
                updateLineItem({
                    lineId: "line_123",
                    data: { quantity: 1 },
                })
            ).rejects.toThrow("Missing cart ID when updating line item")
        })
    })

    describe("deleteLineItem", () => {
        it("should delete line item from cart", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.deleteLineItem as jest.Mock).mockResolvedValue({})

            await deleteLineItem("line_123")

            expect(sdk.store.cart.deleteLineItem).toHaveBeenCalledWith("cart_123", "line_123", {})
        })

        it("should throw error when lineId missing", async () => {
            await expect(deleteLineItem("")).rejects.toThrow(
                "Missing lineItem ID when deleting line item"
            )
        })

        it("should throw error when cartId missing", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue(null)

            await expect(deleteLineItem("line_123")).rejects.toThrow(
                "Missing cart ID when deleting line item"
            )
        })
    })

    describe("emptyCart", () => {
        it("should delete all items from cart", async () => {
            const mockCart = {
                id: "cart_123",
                items: [{ id: "item_1" }, { id: "item_2" }, { id: "item_3" }],
            }
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: mockCart })
                ; (sdk.store.cart.deleteLineItem as jest.Mock).mockResolvedValue({})

            await emptyCart()

            expect(sdk.store.cart.deleteLineItem).toHaveBeenCalledTimes(3)
            expect(sdk.store.cart.deleteLineItem).toHaveBeenCalledWith("cart_123", "item_1", {})
            expect(sdk.store.cart.deleteLineItem).toHaveBeenCalledWith("cart_123", "item_2", {})
            expect(sdk.store.cart.deleteLineItem).toHaveBeenCalledWith("cart_123", "item_3", {})
        })

        it("should throw error when no cart exists", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue(null)

            await expect(emptyCart()).rejects.toThrow("No existing cart found when emptying cart")
        })

        it("should handle empty cart gracefully", async () => {
            const mockCart = { id: "cart_123", items: [] }
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ cart: mockCart })

            await emptyCart()

            expect(sdk.store.cart.deleteLineItem).not.toHaveBeenCalled()
            expect(revalidateTag).toHaveBeenCalledWith("carts")
        })
    })

    // ==========================================
    // Part 4: Checkout Flow Functions
    // ==========================================

    describe("setShippingAddress", () => {
        it("should set shipping address from form data", async () => {
            const formData = new FormData()
            formData.set("shipping_address.first_name", "John")
            formData.set("shipping_address.last_name", "Doe")
            formData.set("shipping_address.address_1", "123 Main St")
            formData.set("shipping_address.company", "ACME Corp")
            formData.set("shipping_address.postal_code", "12345")
            formData.set("shipping_address.city", "São Paulo")
            formData.set("shipping_address.country_code", "br")
            formData.set("shipping_address.province", "SP")
            formData.set("shipping_address.phone", "+5511999999999")
            formData.set("email", "john@example.com")

            const mockCustomer = { id: "cust_123", email: "john@example.com" }
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (retrieveCustomer as jest.Mock).mockResolvedValue(mockCustomer)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.update as jest.Mock).mockResolvedValue({ cart: {} })

            await setShippingAddress(formData)

            expect(sdk.store.cart.update).toHaveBeenCalledWith(
                "cart_123",
                expect.objectContaining({
                    shipping_address: {
                        first_name: "John",
                        last_name: "Doe",
                        address_1: "123 Main St",
                        address_2: "",
                        company: "ACME Corp",
                        postal_code: "12345",
                        city: "São Paulo",
                        country_code: "br",
                        province: "SP",
                        phone: "+5511999999999",
                    },
                    email: "john@example.com",
                }),
                {},
                {}
            )
        })

        it("should use form email when customer not logged in", async () => {
            const formData = new FormData()
            formData.set("shipping_address.first_name", "Guest")
            formData.set("shipping_address.last_name", "User")
            formData.set("shipping_address.address_1", "456 Oak Ave")
            formData.set("shipping_address.company", "")
            formData.set("shipping_address.postal_code", "54321")
            formData.set("shipping_address.city", "Rio")
            formData.set("shipping_address.country_code", "br")
            formData.set("shipping_address.province", "RJ")
            formData.set("shipping_address.phone", "")
            formData.set("email", "guest@example.com")

                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (retrieveCustomer as jest.Mock).mockResolvedValue(null)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.update as jest.Mock).mockResolvedValue({ cart: {} })

            await setShippingAddress(formData)

            const updateCall = (sdk.store.cart.update as jest.Mock).mock.calls[0][1]
            expect(updateCall.email).toBe("guest@example.com")
        })

        it("should throw error when no form data provided", async () => {
            await expect(setShippingAddress(null as unknown as FormData)).rejects.toThrow(
                "No form data found when setting addresses"
            )
        })

        it("should throw error when no cart exists", async () => {
            const formData = new FormData()
                ; (getCartId as jest.Mock).mockResolvedValue(null)

            await expect(setShippingAddress(formData)).rejects.toThrow()
        })
    })

    describe("setBillingAddress", () => {
        it("should set billing address from form data", async () => {
            const formData = new FormData()
            formData.set("billing_address.first_name", "Jane")
            formData.set("billing_address.last_name", "Smith")
            formData.set("billing_address.address_1", "789 Elm St")
            formData.set("billing_address.company", "XYZ Inc")
            formData.set("billing_address.postal_code", "98765")
            formData.set("billing_address.city", "Brasília")
            formData.set("billing_address.country_code", "br")
            formData.set("billing_address.province", "DF")
            formData.set("billing_address.phone", "+5561888888888")

                ; (getCartId as jest.Mock).mockReturnValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.update as jest.Mock).mockResolvedValue({ cart: {} })

            await setBillingAddress(formData)

            expect(sdk.store.cart.update).toHaveBeenCalledWith(
                "cart_123",
                expect.objectContaining({
                    billing_address: {
                        first_name: "Jane",
                        last_name: "Smith",
                        address_1: "789 Elm St",
                        address_2: "",
                        company: "XYZ Inc",
                        postal_code: "98765",
                        city: "Brasília",
                        country_code: "br",
                        province: "DF",
                        phone: "+5561888888888",
                    },
                }),
                {},
                {}
            )
        })

        it("should throw error when no cart exists", async () => {
            const formData = new FormData()
                ; (getCartId as jest.Mock).mockReturnValue(null)

            await expect(setBillingAddress(formData)).rejects.toThrow(
                "No existing cart found when setting billing address"
            )
        })
    })

    describe("setContactDetails", () => {
        it("should set contact details and metadata", async () => {
            const formData = new FormData()
            formData.set("email", "contact@example.com")
            formData.set("invoice_recipient", "Finance Department")
            formData.set("cost_center", "CC-2024")
            formData.set("requisition_number", "REQ-001")
            formData.set("door_code", "1234")
            formData.set("notes", "Please deliver after 2pm")

                ; (getCartId as jest.Mock).mockReturnValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.update as jest.Mock).mockResolvedValue({ cart: {} })

            await setContactDetails(null, formData)

            expect(sdk.store.cart.update).toHaveBeenCalledWith(
                "cart_123",
                {
                    email: "contact@example.com",
                    metadata: {
                        invoice_recipient: "Finance Department",
                        cost_center: "CC-2024",
                        requisition_number: "REQ-001",
                        door_code: "1234",
                        notes: "Please deliver after 2pm",
                    },
                },
                {},
                {}
            )
        })

        it("should throw error when no cart exists", async () => {
            const formData = new FormData()
                ; (getCartId as jest.Mock).mockReturnValue(null)

            await expect(setContactDetails(null, formData)).rejects.toThrow(
                "No existing cart found when setting contact details"
            )
        })
    })

    describe("setShippingMethod", () => {
        it("should set shipping method for cart", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.addShippingMethod as jest.Mock).mockResolvedValue({})

            await setShippingMethod({
                cartId: "cart_123",
                shippingMethodId: "method_express",
            })

            expect(sdk.store.cart.addShippingMethod).toHaveBeenCalledWith(
                "cart_123",
                { option_id: "method_express" },
                {},
                {}
            )
        })

        it("should revalidate cart cache after setting shipping", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.addShippingMethod as jest.Mock).mockResolvedValue({})

            await setShippingMethod({
                cartId: "cart_123",
                shippingMethodId: "method_standard",
            })

            expect(revalidateTag).toHaveBeenCalledWith("carts")
        })
    })

    describe("placeOrder", () => {
        it("should complete cart and redirect to confirmation", async () => {
            const mockOrder = {
                id: "order_123",
                shipping_address: { country_code: "BR" },
            }
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock)
                    .mockResolvedValueOnce("carts")
                    .mockResolvedValueOnce("orders")
                    .mockResolvedValueOnce("approvals")
                ; (sdk.store.cart.complete as jest.Mock).mockResolvedValue({
                    type: "order",
                    order: mockOrder,
                })

            await expect(placeOrder()).rejects.toThrow() // redirect throws

            expect(sdk.store.cart.complete).toHaveBeenCalledWith("cart_123", {}, {})
            expect(track).toHaveBeenCalledWith("order_completed", { order_id: "order_123" })
            expect(removeCartId).toHaveBeenCalled()
            expect(redirect).toHaveBeenCalledWith("/br/order/confirmed/order_123")
        })

        it("should handle cart response type (incomplete)", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.complete as jest.Mock).mockResolvedValue({
                    type: "cart",
                    cart: { id: "cart_123" },
                })

            const result = await placeOrder()

            expect(result).toEqual({ type: "cart", cart: { id: "cart_123" } })
            expect(track).not.toHaveBeenCalled()
            expect(redirect).not.toHaveBeenCalled()
        })

        it("should throw error when no cart exists", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue(null)

            await expect(placeOrder()).rejects.toThrow(
                "No existing cart found when placing an order"
            )
        })

        it("should use provided cartId over cookie", async () => {
            const mockOrder = {
                id: "order_456",
                shipping_address: { country_code: "US" },
            }
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.complete as jest.Mock).mockResolvedValue({
                    type: "order",
                    order: mockOrder,
                })

            await expect(placeOrder("cart_override")).rejects.toThrow()

            expect(sdk.store.cart.complete).toHaveBeenCalledWith("cart_override", {}, {})
        })
    })

    // ==========================================
    // Part 5: Promotions & Approvals
    // ==========================================

    describe("applyPromotions", () => {
        it("should apply promo codes to cart", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.update as jest.Mock).mockResolvedValue({ cart: {} })

            await applyPromotions(["SAVE10", "FREESHIP"])

            expect(sdk.store.cart.update).toHaveBeenCalledWith(
                "cart_123",
                { promo_codes: ["SAVE10", "FREESHIP"] },
                {},
                {}
            )
        })

        it("should revalidate both carts and fulfillment", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock)
                    .mockResolvedValueOnce("fulfillment")
                    .mockResolvedValueOnce("carts")
                    .mockResolvedValueOnce("fulfillment")
                    .mockResolvedValueOnce("carts")
                ; (sdk.store.cart.update as jest.Mock).mockResolvedValue({ cart: {} })

            await applyPromotions(["PROMO"])

            expect(revalidateTag).toHaveBeenCalledWith("carts")
            expect(revalidateTag).toHaveBeenCalledWith("fulfillment")
        })

        it("should throw error when no cart exists", async () => {
            ; (getCartId as jest.Mock).mockResolvedValue(null)

            await expect(applyPromotions(["CODE"])).rejects.toThrow("No existing cart found")
        })
    })

    describe("initiatePaymentSession", () => {
        it("should initiate payment with provider", async () => {
            const mockCart = { id: "cart_123" } as any
            const paymentData = { provider_id: "stripe" }
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.payment.initiatePaymentSession as jest.Mock).mockResolvedValue({
                    session_id: "session_123",
                })

            const result = await initiatePaymentSession(mockCart, paymentData)

            expect(sdk.store.payment.initiatePaymentSession).toHaveBeenCalledWith(
                mockCart,
                paymentData,
                {},
                {}
            )
            expect(result).toEqual({ session_id: "session_123" })
        })

        it("should include context in payment data", async () => {
            const mockCart = { id: "cart_123" } as any
            const paymentData = {
                provider_id: "paypal",
                context: { return_url: "https://example.com/return" },
            }
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.payment.initiatePaymentSession as jest.Mock).mockResolvedValue({})

            await initiatePaymentSession(mockCart, paymentData)

            expect(sdk.store.payment.initiatePaymentSession).toHaveBeenCalledWith(
                mockCart,
                expect.objectContaining({ context: { return_url: "https://example.com/return" } }),
                {},
                {}
            )
        })
    })

    describe("updateRegion", () => {
        it("should update cart region and redirect", async () => {
            const mockRegion = { id: "region_us", name: "United States" }
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("carts")
                ; (sdk.store.cart.update as jest.Mock).mockResolvedValue({ cart: {} })

            await expect(updateRegion("us", "/products")).rejects.toThrow()

            expect(sdk.store.cart.update).toHaveBeenCalledWith(
                "cart_123",
                { region_id: "region_us" },
                {},
                {}
            )
            expect(revalidateTag).toHaveBeenCalledWith("carts")
            expect(redirect).toHaveBeenCalledWith("/us/products")
        })

        it("should revalidate multiple cache tags", async () => {
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getCartId as jest.Mock).mockResolvedValue("cart_123")
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock)
                    .mockResolvedValueOnce("fulfillment")
                    .mockResolvedValueOnce("carts")
                    .mockResolvedValueOnce("carts")
                    .mockResolvedValueOnce("regions")
                    .mockResolvedValueOnce("products")
                ; (sdk.store.cart.update as jest.Mock).mockResolvedValue({ cart: {} })

            await expect(updateRegion("br", "/store")).rejects.toThrow()

            expect(revalidateTag).toHaveBeenCalledWith("regions")
            expect(revalidateTag).toHaveBeenCalledWith("products")
        })

        it("should throw error when region not found", async () => {
            ; (getRegion as jest.Mock).mockResolvedValue(null)

            await expect(updateRegion("invalid", "/")).rejects.toThrow(
                "Region not found for country code: invalid"
            )
        })
    })

    describe("createCartApproval", () => {
        it("should create approval for cart", async () => {
            const mockApproval = { id: "approval_123", status: "pending" }
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock).mockResolvedValue("approvals")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ approval: mockApproval })

            const result = await createCartApproval("cart_123", "user_123")

            expect(sdk.client.fetch).toHaveBeenCalledWith(
                "/store/carts/cart_123/approvals",
                expect.objectContaining({
                    method: "POST",
                    credentials: "include",
                })
            )
            expect(result).toEqual(mockApproval)
        })

        it("should revalidate carts and approvals cache", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheTag as jest.Mock)
                    .mockResolvedValueOnce("carts")
                    .mockResolvedValueOnce("approvals")
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ approval: {} })

            await createCartApproval("cart_123", "user_123")

            expect(revalidateTag).toHaveBeenCalledWith("carts")
            expect(revalidateTag).toHaveBeenCalledWith("approvals")
        })

        it("should handle approval creation errors", async () => {
            const mockError = {
                response: {
                    json: jest.fn().mockResolvedValue({ message: "Approval already exists" }),
                },
            }
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockRejectedValue(mockError)

            const approvalPromise = createCartApproval("cart_123", "user_123")

            await jest.advanceTimersByTimeAsync(7000)

            await expect(approvalPromise).rejects.toThrow("Approval already exists")
        })
    })
})
