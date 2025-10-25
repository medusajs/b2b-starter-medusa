/**
 * @file products.test.ts
 * @description Tests for products data layer operations
 * @module lib/data/products
 * @jest-environment node
 */

import { sdk } from "@/lib/config"
import {
    getProductsById,
    getProductByHandle,
    listProducts,
    listProductsWithSort,
} from "@/lib/data/products"
import { getAuthHeaders, getCacheOptions } from "@/lib/data/cookies"
import { getRegion } from "@/lib/data/regions"
import { sortProducts } from "@/lib/util/sort-products"

// Mock dependencies
jest.mock("@/lib/config", () => ({
    sdk: {
        client: {
            fetch: jest.fn(),
        },
    },
}))

jest.mock("@/lib/data/cookies")
jest.mock("@/lib/data/regions")
jest.mock("@/lib/util/sort-products")

// Mock timers for retry tests
jest.useFakeTimers()

describe("products.ts - Data Layer", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.clearAllTimers()
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
    })

    // ==========================================
    // getProductsById
    // ==========================================

    describe("getProductsById", () => {
        it("should fetch products by IDs", async () => {
            const mockProducts = [
                { id: "prod_1", title: "Product 1" },
                { id: "prod_2", title: "Product 2" },
            ]
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({ Authorization: "Bearer token" })
                ; (getCacheOptions as jest.Mock).mockResolvedValue({ revalidate: 3600 })
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ products: mockProducts })

            const result = await getProductsById({
                ids: ["prod_1", "prod_2"],
                regionId: "region_br",
            })

            expect(result).toEqual(mockProducts)
            expect(sdk.client.fetch).toHaveBeenCalledWith(
                "/store/products",
                expect.objectContaining({
                    method: "GET",
                    credentials: "include",
                    cache: "force-cache",
                    query: expect.objectContaining({
                        id: ["prod_1", "prod_2"],
                        region_id: "region_br",
                    }),
                })
            )
        })

        it("should include variant fields in query", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ products: [] })

            await getProductsById({
                ids: ["prod_1"],
                regionId: "region_br",
            })

            const callArgs = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(callArgs.query.fields).toContain("*variants")
            expect(callArgs.query.fields).toContain("*variants.calculated_price")
            expect(callArgs.query.fields).toContain("*variants.inventory_quantity")
        })

        it("should retry on fetch failure", async () => {
            const mockError = new Error("Network error")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock)
                    .mockRejectedValueOnce(mockError)
                    .mockRejectedValueOnce(mockError)
                    .mockResolvedValueOnce({ products: [{ id: "prod_1" }] })

            const resultPromise = getProductsById({
                ids: ["prod_1"],
                regionId: "region_br",
            })

            await jest.advanceTimersByTimeAsync(1000) // First retry
            await jest.advanceTimersByTimeAsync(2000) // Second retry

            const result = await resultPromise

            expect(result).toEqual([{ id: "prod_1" }])
            expect(sdk.client.fetch).toHaveBeenCalledTimes(3)
        })

        it("should fail after max retries", async () => {
            const mockError = new Error("Persistent error")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockRejectedValue(mockError)

            let error: Error | null = null
            const resultPromise = getProductsById({
                ids: ["prod_1"],
                regionId: "region_br",
            }).catch(err => {
                error = err
                throw err
            })

            await jest.advanceTimersByTimeAsync(7000) // All retries

            try {
                await resultPromise
            } catch (e) {
                // Expected to throw
            }

            expect(error).toBeTruthy()
            expect(sdk.client.fetch).toHaveBeenCalledTimes(4) // Initial + 3 retries
        })
    })

    // ==========================================
    // getProductByHandle
    // ==========================================

    describe("getProductByHandle", () => {
        it("should fetch product by handle", async () => {
            const mockProduct = { id: "prod_1", handle: "solar-panel-450w", title: "Solar Panel 450W" }
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ products: [mockProduct] })

            const result = await getProductByHandle("solar-panel-450w", "region_br")

            expect(result).toEqual(mockProduct)
            expect(sdk.client.fetch).toHaveBeenCalledWith(
                "/store/products",
                expect.objectContaining({
                    method: "GET",
                    query: expect.objectContaining({
                        handle: "solar-panel-450w",
                        region_id: "region_br",
                    }),
                })
            )
        })

        it("should include metadata and tags in query", async () => {
            ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ products: [{}] })

            await getProductByHandle("test-product", "region_br")

            const callArgs = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(callArgs.query.fields).toContain("+metadata")
            expect(callArgs.query.fields).toContain("+tags")
        })

        it("should return first product from array", async () => {
            const mockProducts = [
                { id: "prod_1", title: "First" },
                { id: "prod_2", title: "Second" },
            ]
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({ products: mockProducts })

            const result = await getProductByHandle("test", "region_br")

            expect(result).toEqual({ id: "prod_1", title: "First" })
        })

        it("should retry on failure", async () => {
            const mockError = new Error("Timeout")
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock)
                    .mockRejectedValueOnce(mockError)
                    .mockResolvedValueOnce({ products: [{ id: "prod_1" }] })

            const resultPromise = getProductByHandle("test", "region_br")

            await jest.advanceTimersByTimeAsync(1000)

            const result = await resultPromise

            expect(result).toEqual({ id: "prod_1" })
            expect(sdk.client.fetch).toHaveBeenCalledTimes(2)
        })
    })

    // ==========================================
    // listProducts
    // ==========================================

    describe("listProducts", () => {
        it("should list products with default pagination", async () => {
            const mockProducts = [
                { id: "prod_1", title: "Product 1" },
                { id: "prod_2", title: "Product 2" },
            ]
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    products: mockProducts,
                    count: 50,
                })

            const result = await listProducts({
                countryCode: "br",
            })

            expect(result.response.products).toEqual(mockProducts)
            expect(result.response.count).toBe(50)
            expect(result.nextPage).toBe(2) // 50 > 12 (default limit)
        })

        it("should use custom limit and offset", async () => {
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    products: [],
                    count: 100,
                })

            await listProducts({
                pageParam: 3,
                queryParams: { limit: 20 },
                countryCode: "br",
            })

            const callArgs = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(callArgs.query.limit).toBe(20)
            expect(callArgs.query.offset).toBe(40) // (3-1) * 20
        })

        it("should return null nextPage when no more products", async () => {
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    products: Array(10).fill({}),
                    count: 10,
                })

            const result = await listProducts({
                queryParams: { limit: 12 },
                countryCode: "br",
            })

            expect(result.nextPage).toBeNull()
        })

        it("should return empty when region not found", async () => {
            ; (getRegion as jest.Mock).mockResolvedValue(null)

            const result = await listProducts({
                countryCode: "invalid",
            })

            expect(result.response.products).toEqual([])
            expect(result.response.count).toBe(0)
            expect(result.nextPage).toBeNull()
        })

        it("should pass through query params", async () => {
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    products: [],
                    count: 0,
                })

            await listProducts({
                queryParams: {
                    category_id: ["cat_1"],
                    q: "solar panel",
                },
                countryCode: "br",
            })

            const callArgs = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(callArgs.query.category_id).toEqual(["cat_1"])
            expect(callArgs.query.q).toBe("solar panel")
        })

        it("should handle page param of 0 or negative", async () => {
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    products: [],
                    count: 0,
                })

            await listProducts({
                pageParam: 0,
                countryCode: "br",
            })

            const callArgs = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(callArgs.query.offset).toBe(0) // Should be clamped to 1, giving offset 0
        })
    })

    // ==========================================
    // listProductsWithSort
    // ==========================================

    describe("listProductsWithSort", () => {
        it("should fetch 100 products and sort them", async () => {
            const mockProducts = Array.from({ length: 100 }, (_, i) => ({
                id: `prod_${i}`,
                title: `Product ${i}`,
            }))
            const sortedProducts = [...mockProducts].reverse()
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    products: mockProducts,
                    count: 100,
                })
                ; (sortProducts as jest.Mock).mockReturnValue(sortedProducts)

            const result = await listProductsWithSort({
                page: 1,
                sortBy: "price_desc",
                countryCode: "br",
            })

            expect(sortProducts).toHaveBeenCalledWith(mockProducts, "price_desc")
            expect(result.response.products).toHaveLength(12) // Default limit
            expect(result.response.products[0]).toEqual(sortedProducts[0])
        })

        it("should paginate sorted results", async () => {
            const mockProducts = Array.from({ length: 100 }, (_, i) => ({
                id: `prod_${i}`,
            }))
            const sortedProducts = [...mockProducts]
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    products: mockProducts,
                    count: 100,
                })
                ; (sortProducts as jest.Mock).mockReturnValue(sortedProducts)

            const result = await listProductsWithSort({
                page: 3,
                queryParams: { limit: 10 },
                sortBy: "price_asc",
                countryCode: "br",
            })

            // Page 3 with limit 10 should give products 20-29
            expect(result.response.products).toHaveLength(10)
            expect(result.response.products[0]).toEqual(sortedProducts[20])
            expect(result.nextPage).toBe(30) // Next offset
        })

        it("should return null nextPage on last page", async () => {
            const mockProducts = Array.from({ length: 50 }, (_, i) => ({ id: `prod_${i}` }))
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    products: mockProducts,
                    count: 50,
                })
                ; (sortProducts as jest.Mock).mockReturnValue(mockProducts)

            const result = await listProductsWithSort({
                page: 5,
                queryParams: { limit: 12 },
                sortBy: "created_at",
                countryCode: "br",
            })

            expect(result.nextPage).toBeNull()
        })

        it("should use created_at as default sort", async () => {
            const mockProducts = [{ id: "prod_1" }]
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    products: mockProducts,
                    count: 1,
                })
                ; (sortProducts as jest.Mock).mockReturnValue(mockProducts)

            await listProductsWithSort({
                countryCode: "br",
            })

            expect(sortProducts).toHaveBeenCalledWith(mockProducts, "created_at")
        })

        it("should handle empty product list", async () => {
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    products: [],
                    count: 0,
                })
                ; (sortProducts as jest.Mock).mockReturnValue([])

            const result = await listProductsWithSort({
                countryCode: "br",
            })

            expect(result.response.products).toEqual([])
            expect(result.nextPage).toBeNull()
        })

        it("should pass query params to listProducts", async () => {
            const mockProducts = [{ id: "prod_1" }]
            const mockRegion = { id: "region_br", name: "Brazil" }
                ; (getRegion as jest.Mock).mockResolvedValue(mockRegion)
                ; (getAuthHeaders as jest.Mock).mockResolvedValue({})
                ; (getCacheOptions as jest.Mock).mockResolvedValue({})
                ; (sdk.client.fetch as jest.Mock).mockResolvedValue({
                    products: mockProducts,
                    count: 1,
                })
                ; (sortProducts as jest.Mock).mockReturnValue(mockProducts)

            await listProductsWithSort({
                queryParams: {
                    category_id: ["cat_solar"],
                    tags: ["inverter"],
                },
                sortBy: "price_asc",
                countryCode: "br",
            })

            const callArgs = (sdk.client.fetch as jest.Mock).mock.calls[0][1]
            expect(callArgs.query.category_id).toEqual(["cat_solar"])
            expect(callArgs.query.tags).toEqual(["inverter"])
        })
    })
})
