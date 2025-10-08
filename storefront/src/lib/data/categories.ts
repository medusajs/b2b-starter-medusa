"use server"

import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

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
  delay: number = RETRY_DELAY_MS
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error

    console.warn(`[Categories] Retrying after ${delay}ms... (${retries} retries left)`)
    await sleep(delay)

    return retryWithBackoff(fn, retries - 1, delay * 2)
  }
}

export const listCategories = async (
  query?: Record<string, any>
): Promise<HttpTypes.StoreProductCategory[]> => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return retryWithBackoff(
    () => sdk.client
      .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
        "/store/product-categories",
        {
          query: {
            fields:
              "*category_children, *products, *parent_category, *parent_category.parent_category",
            limit,
            ...query,
          },
          next,
          cache: "force-cache",
        }
      )
      .then(({ product_categories }) => product_categories),
    MAX_RETRIES
  )
}

export const getCategoryByHandle = async (
  categoryHandle: string[]
): Promise<HttpTypes.StoreProductCategory> => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return retryWithBackoff(
    () => sdk.client
      .fetch<HttpTypes.StoreProductCategoryListResponse>(
        `/store/product-categories`,
        {
          query: {
            fields: "*category_children, *products",
            handle,
          },
          next,
          cache: "force-cache",
        }
      )
      .then(({ product_categories }) => product_categories[0]),
    MAX_RETRIES
  )
}
