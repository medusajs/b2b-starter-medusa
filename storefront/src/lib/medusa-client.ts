import { getAuthHeaders } from "@/lib/data/cookies"
import { getCacheOptions } from "@/lib/data/cookies"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export interface MedusaClientOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    headers?: Record<string, string>
    body?: any
    query?: Record<string, any>
    next?: any
}

export class MedusaClient {
    private baseUrl: string
    private publishableKey: string

    constructor(baseUrl: string, publishableKey: string) {
        this.baseUrl = baseUrl
        this.publishableKey = publishableKey
    }

    async fetch<T = any>(
        endpoint: string,
        options: MedusaClientOptions = {}
    ): Promise<T> {
        const {
            method = "GET",
            headers = {},
            body,
            query,
            next,
        } = options

        // Build URL with query parameters
        let url = `${this.baseUrl}${endpoint}`
        if (query) {
            const params = new URLSearchParams()
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value))
                }
            })
            const queryString = params.toString()
            if (queryString) {
                url += `?${queryString}`
            }
        }

        // Build headers
        const requestHeaders: Record<string, string> = {
            "Content-Type": "application/json",
            ...headers,
        }

        // Add publishable key if available
        if (this.publishableKey) {
            requestHeaders["x-publishable-api-key"] = this.publishableKey
        }

        // Add auth headers if available
        const authHeaders = await getAuthHeaders()
        Object.assign(requestHeaders, authHeaders)

        // Build request options
        const requestOptions: RequestInit = {
            method,
            headers: requestHeaders,
        }

        // Add body for non-GET requests
        if (body && method !== "GET") {
            requestOptions.body = JSON.stringify(body)
        }

        // Add Next.js cache options
        if (next) {
            requestOptions.next = next
        }

        try {
            const response = await fetch(url, requestOptions)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
                return await response.json()
            } else {
                return await response.text() as T
            }
        } catch (error) {
            console.error(`MedusaClient fetch error for ${endpoint}:`, error)
            throw error
        }
    }

    // Convenience methods for common operations
    async get<T = any>(endpoint: string, options: Omit<MedusaClientOptions, "method"> = {}): Promise<T> {
        return this.fetch<T>(endpoint, { ...options, method: "GET" })
    }

    async post<T = any>(endpoint: string, options: Omit<MedusaClientOptions, "method"> = {}): Promise<T> {
        return this.fetch<T>(endpoint, { ...options, method: "POST" })
    }

    async put<T = any>(endpoint: string, options: Omit<MedusaClientOptions, "method"> = {}): Promise<T> {
        return this.fetch<T>(endpoint, { ...options, method: "PUT" })
    }

    async patch<T = any>(endpoint: string, options: Omit<MedusaClientOptions, "method"> = {}): Promise<T> {
        return this.fetch<T>(endpoint, { ...options, method: "PATCH" })
    }

    async delete<T = any>(endpoint: string, options: Omit<MedusaClientOptions, "method"> = {}): Promise<T> {
        return this.fetch<T>(endpoint, { ...options, method: "DELETE" })
    }
}

// Export singleton instance
export const medusaClient = new MedusaClient(MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY || "")