/**
 * Unit tests for ResilientHttpClient
 * 
 * Coverage:
 * - Retry with exponential backoff
 * - Timeout handling
 * - Cache behavior
 * - Queue management
 * - Error handling
 */

import { ResilientHttpClient } from "../resilient-client"

// Mock fetch
global.fetch = jest.fn()

describe("ResilientHttpClient", () => {
    let client: ResilientHttpClient

    beforeEach(() => {
        client = new ResilientHttpClient()
        ResilientHttpClient.clearCache()
        ResilientHttpClient.clearQueue()
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe("Successful requests", () => {
        it("should make a successful GET request", async () => {
            const mockData = { id: 1, name: "Test" }
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockData,
                })

            const response = await client.get("https://api.example.com/test")

            expect(response.data).toEqual(mockData)
            expect(response.fromCache).toBe(false)
            expect(response.fromQueue).toBe(false)
            expect(response.attempts).toBe(1)
            expect(global.fetch).toHaveBeenCalledTimes(1)
        })

        it("should make a successful POST request", async () => {
            const mockData = { success: true }
            const postBody = { name: "New Item" }

                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockData,
                })

            const response = await client.post("https://api.example.com/items", postBody)

            expect(response.data).toEqual(mockData)
            expect(response.attempts).toBe(1)
        })
    })

    describe("Retry mechanism", () => {
        it("should retry on network error with exponential backoff", async () => {
            const mockData = { id: 1 }

                // Fail twice, succeed on third attempt
                ; (global.fetch as jest.Mock)
                    .mockRejectedValueOnce(new Error("Network error"))
                    .mockRejectedValueOnce(new Error("Network error"))
                    .mockResolvedValueOnce({
                        ok: true,
                        json: async () => mockData,
                    })

            const startTime = Date.now()
            const response = await client.get("https://api.example.com/test", {
                retries: 3,
            })
            const elapsed = Date.now() - startTime

            expect(response.data).toEqual(mockData)
            expect(response.attempts).toBe(3)
            expect(global.fetch).toHaveBeenCalledTimes(3)

            // Should have delays: 1s + 2s = 3s minimum
            expect(elapsed).toBeGreaterThanOrEqual(3000)
        })

        it("should retry on HTTP error status", async () => {
            const mockData = { id: 1 }

                ; (global.fetch as jest.Mock)
                    .mockResolvedValueOnce({
                        ok: false,
                        status: 500,
                        statusText: "Internal Server Error",
                    })
                    .mockResolvedValueOnce({
                        ok: true,
                        json: async () => mockData,
                    })

            const response = await client.get("https://api.example.com/test", {
                retries: 2,
            })

            expect(response.data).toEqual(mockData)
            expect(response.attempts).toBe(2)
        })

        it("should throw error after exhausting retries", async () => {
            ; (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"))

            await expect(
                client.get("https://api.example.com/test", { retries: 2 })
            ).rejects.toThrow("Network error")

            expect(global.fetch).toHaveBeenCalledTimes(3) // Initial + 2 retries
        })
    })

    describe("Timeout handling", () => {
        it("should timeout long requests", async () => {
            ; (global.fetch as jest.Mock).mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 5000)
                    )
            )

            await expect(
                client.get("https://api.example.com/slow", {
                    timeout: 1000,
                    retries: 0,
                })
            ).rejects.toThrow()
        }, 10000)
    })

    describe("Cache behavior", () => {
        it("should cache GET requests", async () => {
            const mockData = { id: 1, cached: true }

                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockData,
                })

            // First request - hits API
            const response1 = await client.get("https://api.example.com/test", {
                cacheTTL: 5000,
            })

            // Second request - from cache
            const response2 = await client.get("https://api.example.com/test", {
                cacheTTL: 5000,
            })

            expect(response1.fromCache).toBe(false)
            expect(response2.fromCache).toBe(true)
            expect(response2.data).toEqual(mockData)
            expect(global.fetch).toHaveBeenCalledTimes(1) // Only one API call
        })

        it("should not cache POST requests", async () => {
            const mockData = { success: true }

                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => mockData,
                })

            await client.post("https://api.example.com/items", { name: "Item 1" })
            await client.post("https://api.example.com/items", { name: "Item 2" })

            expect(global.fetch).toHaveBeenCalledTimes(2)
        })

        it("should expire cached items after TTL", async () => {
            const mockData = { id: 1 }

                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => mockData,
                })

            await client.get("https://api.example.com/test", { cacheTTL: 100 })

            // Wait for cache to expire
            await new Promise((resolve) => setTimeout(resolve, 150))

            await client.get("https://api.example.com/test", { cacheTTL: 100 })

            expect(global.fetch).toHaveBeenCalledTimes(2)
        })

        it("should allow disabling cache", async () => {
            const mockData = { id: 1 }

                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => mockData,
                })

            await client.get("https://api.example.com/test", { enableCache: false })
            await client.get("https://api.example.com/test", { enableCache: false })

            expect(global.fetch).toHaveBeenCalledTimes(2)
        })
    })

    describe("Queue management", () => {
        it("should add failed POST to queue", async () => {
            ; (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"))

            const response = await client.post(
                "https://api.example.com/items",
                { name: "Item" },
                { retries: 1, enableQueue: true }
            )

            expect(response.fromQueue).toBe(true)
            expect(response.error).toBeDefined()

            const queueStatus = ResilientHttpClient.getQueueStatus()
            expect(queueStatus.size).toBe(1)
        })

        it("should not queue GET requests", async () => {
            ; (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"))

            await expect(
                client.get("https://api.example.com/test", { retries: 1 })
            ).rejects.toThrow()

            const queueStatus = ResilientHttpClient.getQueueStatus()
            expect(queueStatus.size).toBe(0)
        })

        it("should allow disabling queue", async () => {
            ; (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"))

            await expect(
                client.post(
                    "https://api.example.com/items",
                    { name: "Item" },
                    { retries: 1, enableQueue: false }
                )
            ).rejects.toThrow()

            const queueStatus = ResilientHttpClient.getQueueStatus()
            expect(queueStatus.size).toBe(0)
        })
    })

    describe("Shorthand methods", () => {
        it("should support PUT method", async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ updated: true }),
            })

            await client.put("https://api.example.com/items/1", { name: "Updated" })

            expect(global.fetch).toHaveBeenCalledWith(
                "https://api.example.com/items/1",
                expect.objectContaining({ method: "PUT" })
            )
        })

        it("should support PATCH method", async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ patched: true }),
            })

            await client.patch("https://api.example.com/items/1", { name: "Patched" })

            expect(global.fetch).toHaveBeenCalledWith(
                "https://api.example.com/items/1",
                expect.objectContaining({ method: "PATCH" })
            )
        })

        it("should support DELETE method", async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deleted: true }),
            })

            await client.delete("https://api.example.com/items/1")

            expect(global.fetch).toHaveBeenCalledWith(
                "https://api.example.com/items/1",
                expect.objectContaining({ method: "DELETE" })
            )
        })
    })

    describe("Static utility methods", () => {
        it("should clear cache", () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ id: 1 }),
            })

            client.get("https://api.example.com/test")

            ResilientHttpClient.clearCache()

            const status = ResilientHttpClient.getCacheStatus()
            expect(status.size).toBe(0)
        })

        it("should clear queue", async () => {
            ; (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"))

            await client.post(
                "https://api.example.com/items",
                { name: "Item" },
                { retries: 0 }
            )

            ResilientHttpClient.clearQueue()

            const status = ResilientHttpClient.getQueueStatus()
            expect(status.size).toBe(0)
        })
    })
})
