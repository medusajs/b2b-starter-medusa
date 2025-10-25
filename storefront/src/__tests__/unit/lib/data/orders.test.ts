/**
 * @jest-environment node
 * @file orders.test.ts
 * @description Unit tests for orders data layer
 */

import { retrieveOrder, listOrders } from "@/lib/data/orders"
import { sdk } from "@/lib/config"
import { getAuthHeaders, getCacheOptions } from "@/lib/data/cookies"
import medusaError from "@/lib/util/medusa-error"

// Mock dependencies
jest.mock("@/lib/config")
jest.mock("@/lib/data/cookies")
jest.mock("@/lib/util/medusa-error")

describe("orders.ts - Data Layer", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("retrieveOrder", () => {
        it("should retrieve an order by ID", async () => {
            const mockOrder = {
                id: "order_123",
                total: 5000,
                status: "completed",
                items: [
                    {
                        id: "item_1",
                        title: "Product 1",
                        quantity: 2,
                        variant: { sku: "SKU001" },
                        product: { handle: "product-1" },
                        metadata: { custom_field: "value" },
                    },
                ],
                payment_collections: [
                    {
                        id: "pc_1",
                        payments: [{ id: "pay_1", amount: 5000 }],
                    },
                ],
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({
                    Authorization: "Bearer token",
                })
                ; (getCacheOptions as jest.Mock).mockResolvedValue({
                    tags: ["orders"],
                })
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    order: mockOrder,
                })

            const result = await retrieveOrder("order_123")

            expect(result).toEqual(mockOrder)
            expect(sdk.client.fetch).toHaveBeenCalledWith(
                "/store/orders/order_123",
                expect.objectContaining({
                    method: "GET",
                    query: {
                        fields:
                            "*payment_collections.payments,*items,+items.metadata,*items.variant,*items.product",
                    },
                    headers: { Authorization: "Bearer token" },
                    next: { tags: ["orders"] },
                    cache: "force-cache",
                })
            )
        })

        it("should include all required fields in query", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    order: { id: "order_123" },
                })

            await retrieveOrder("order_123")

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.query.fields).toContain("*payment_collections.payments")
            expect(fetchCall.query.fields).toContain("*items")
            expect(fetchCall.query.fields).toContain("+items.metadata")
            expect(fetchCall.query.fields).toContain("*items.variant")
            expect(fetchCall.query.fields).toContain("*items.product")
        })

        it("should handle errors using medusaError", async () => {
            const mockError = new Error("Order not found")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockRejectedValue(mockError)
                ; (medusaError as jest.Mock).mockImplementation((err) => {
                    throw new Error("Medusa Error: " + err.message)
                })

            await expect(retrieveOrder("order_999")).rejects.toThrow(
                "Medusa Error: Order not found"
            )
            expect(medusaError).toHaveBeenCalledWith(mockError)
        })

        it("should use force-cache strategy", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    order: { id: "order_123" },
                })

            await retrieveOrder("order_123")

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.cache).toBe("force-cache")
        })
    })

    describe("listOrders", () => {
        it("should list orders with default parameters", async () => {
            const mockOrders = [
                {
                    id: "order_1",
                    total: 5000,
                    created_at: "2024-01-01",
                    items: [{ id: "item_1" }],
                    customer: { id: "cust_1" },
                },
                {
                    id: "order_2",
                    total: 3000,
                    created_at: "2024-01-02",
                    items: [{ id: "item_2" }],
                    customer: { id: "cust_1" },
                },
            ]

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({
                    Authorization: "Bearer token",
                })
                ; (getCacheOptions as jest.Mock).mockResolvedValue({
                    tags: ["orders"],
                })
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    orders: mockOrders,
                })

            const result = await listOrders()

            expect(result).toEqual(mockOrders)
            expect(sdk.client.fetch).toHaveBeenCalledWith(
                "/store/orders",
                expect.objectContaining({
                    method: "GET",
                    query: {
                        limit: 10,
                        offset: 0,
                        order: "-created_at",
                        fields:
                            "*items,+items.metadata,*items.variant,*items.product,*customer",
                    },
                    headers: { Authorization: "Bearer token" },
                    next: { tags: ["orders"] },
                    cache: "force-cache",
                })
            )
        })

        it("should support custom limit and offset", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    orders: [],
                })

            await listOrders(25, 50)

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.query.limit).toBe(25)
            expect(fetchCall.query.offset).toBe(50)
        })

        it("should apply additional filters", async () => {
            const filters = {
                status: "completed",
                payment_status: "captured",
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    orders: [],
                })

            await listOrders(10, 0, filters)

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.query.status).toBe("completed")
            expect(fetchCall.query.payment_status).toBe("captured")
        })

        it("should sort by created_at descending by default", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    orders: [],
                })

            await listOrders()

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.query.order).toBe("-created_at")
        })

        it("should include all required fields in query", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    orders: [],
                })

            await listOrders()

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.query.fields).toContain("*items")
            expect(fetchCall.query.fields).toContain("+items.metadata")
            expect(fetchCall.query.fields).toContain("*items.variant")
            expect(fetchCall.query.fields).toContain("*items.product")
            expect(fetchCall.query.fields).toContain("*customer")
        })

        it("should handle errors using medusaError", async () => {
            const mockError = new Error("Failed to fetch orders")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockRejectedValue(mockError)
                ; (medusaError as jest.Mock).mockImplementation((err) => {
                    throw new Error("Medusa Error: " + err.message)
                })

            await expect(listOrders()).rejects.toThrow(
                "Medusa Error: Failed to fetch orders"
            )
            expect(medusaError).toHaveBeenCalledWith(mockError)
        })

        it("should use force-cache strategy", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    orders: [],
                })

            await listOrders()

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.cache).toBe("force-cache")
        })

        it("should pass auth headers from cookies", async () => {
            const mockHeaders = {
                Authorization: "Bearer custom-token",
                "X-Custom-Header": "value",
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue(mockHeaders)
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    orders: [],
                })

            await listOrders()

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.headers).toEqual(mockHeaders)
        })

        it("should pass cache options from cookies", async () => {
            const mockCacheOptions = {
                tags: ["orders", "customer"],
                revalidate: 3600,
            }

                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue(mockCacheOptions)
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    orders: [],
                })

            await listOrders()

            const fetchCall = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(fetchCall.next).toEqual(mockCacheOptions)
        })
    })
})
