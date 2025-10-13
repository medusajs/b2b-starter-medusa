/**
 * HTTP client base para chamadas admin e store
 * Gerencia autenticação, publishable key e headers
 */

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

/**
 * Fetcher para rotas admin (/admin/**)
 * Usa cookies de sessão para autenticação
 */
export const adminFetch = async <T>(
    path: string,
    init?: RequestInit
): Promise<T> => {
    const res = await fetch(`${BASE}${path}`, {
        ...init,
        credentials: "include",
        headers: {
            "content-type": "application/json",
            ...(init?.headers || {}),
        },
        cache: "no-store",
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(
            error.error?.message || `${res.status} ${res.statusText}`
        )
    }

    return res.json()
}

/**
 * Fetcher para rotas store (/store/**)
 * Requer x-publishable-api-key no header
 */
export const storeFetch = async <T>(
    path: string,
    init?: RequestInit
): Promise<T> => {
    const headers: Record<string, string> = {
        "content-type": "application/json",
    }

    // Adicionar publishable key se disponível
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
    }

    // Adicionar headers customizados
    if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
            if (typeof value === "string") {
                headers[key] = value
            }
        })
    } const res = await fetch(`${BASE}${path}`, {
        ...init,
        credentials: "include",
        headers,
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(
            error.error?.message || `${res.status} ${res.statusText}`
        )
    }

    return res.json()
}

/**
 * Upload de arquivo multipart (para imagens)
 */
export const uploadFile = async (
    path: string,
    file: File,
    additionalFields?: Record<string, string>
): Promise<unknown> => {
    const formData = new FormData()
    formData.append("file", file)

    if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, value]) => {
            formData.append(key, value)
        })
    }

    const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        credentials: "include",
        body: formData,
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(
            error.error?.message || `${res.status} ${res.statusText}`
        )
    }

    return res.json()
}
