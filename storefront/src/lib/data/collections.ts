"use server"

import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import { FALLBACK_COLLECTIONS, logFallback } from "./fallbacks"

// ==========================================
// Retry Utility
// ==========================================

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY_MS,
  fallback?: T
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) {
      if (fallback !== undefined) {
        return fallback
      }
      throw error
    }

    console.warn(`[Collections] Retrying after ${delay}ms... (${retries} retries left)`)
    await sleep(delay)

    return retryWithBackoff(fn, retries - 1, delay * 2, fallback)
  }
}

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return retryWithBackoff(
    () => sdk.client
      .fetch<{ collection: HttpTypes.StoreCollection }>(
        `/store/collections/${id}`,
        {
          next,
          cache: "force-cache",
        }
      )
      .then(({ collection }) => collection),
    MAX_RETRIES
  )
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  const fallbackResult = {
    collections: FALLBACK_COLLECTIONS as HttpTypes.StoreCollection[],
    count: FALLBACK_COLLECTIONS.length
  }

  return retryWithBackoff(
    () => sdk.client
      .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
        "/store/collections",
        {
          query: queryParams,
          next,
          cache: "force-cache",
        }
      )
      .then(({ collections }) => ({ collections, count: collections.length })),
    MAX_RETRIES,
    RETRY_DELAY_MS,
    fallbackResult
  ).catch((error) => {
    logFallback("collections", error.message)
    return fallbackResult
  })
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return retryWithBackoff(
    () => sdk.client
      .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
        query: { handle },
        next,
        cache: "force-cache",
      })
      .then(({ collections }) => collections[0]!),
    MAX_RETRIES
  )
}
