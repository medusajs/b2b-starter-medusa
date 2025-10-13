"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders, getCacheOptions } from "@/lib/data/cookies"
import { getRegion } from "@/lib/data/regions"
import { sortProducts } from "@/lib/util/sort-products"
import { SortOptions } from "@/modules/store/components/refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"

// ==========================================
// Retry Utility
// ==========================================

const MAX_RETRIES = 3
// Use delay near-zero in tests to avoid slowing down unit tests
const RETRY_DELAY_MS = process.env.NODE_ENV === 'test' ? 1 : 1000

async function sleep(ms: number): Promise<void> {
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve()
  }
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

    console.warn(`[Products] Retrying after ${delay}ms... (${retries} retries left)`)
    await sleep(delay)

    return retryWithBackoff(fn, retries - 1, delay * 2)
  }
}

export const getProductsById = async ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
    // ISR: Revalidate every 1 hour to get fresh prices from ysh-pricing module
    revalidate: 3600,
  }

  return retryWithBackoff(
    () => sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
        credentials: "include",
        method: "GET",
        query: {
          id: ids,
          region_id: regionId,
          // Use Medusa PRICING module calculated_price (includes ysh-pricing multi-distributor logic)
          fields:
            "*variants,*variants.calculated_price,*variants.inventory_quantity",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ products }) => products),
    MAX_RETRIES
  )
}

export const getProductByHandle = async (handle: string, regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
    // ISR: Revalidate every 1 hour to get fresh prices from ysh-pricing module
    revalidate: 3600,
  }

  return retryWithBackoff(
    () => sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
        credentials: "include",
        method: "GET",
        query: {
          handle,
          region_id: regionId,
          // Use Medusa PRICING module calculated_price (includes ysh-pricing multi-distributor logic)
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ products }) => products[0]),
    MAX_RETRIES
  )
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam - 1) * limit
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
    // ISR: Revalidate every 1 hour to get fresh prices from ysh-pricing module
    revalidate: 3600,
  }

  return retryWithBackoff(
    () => sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
        `/store/products`,
        {
          credentials: "include",
          method: "GET",
          query: {
            limit,
            offset,
            region_id: region.id,
            // Use Medusa PRICING module calculated_price (includes ysh-pricing multi-distributor logic)
            fields: "*variants.calculated_price",
            ...queryParams,
          },
          headers,
          next,
          cache: "force-cache",
        }
      )
      .then(({ products, count }) => {
        const nextPage = count > offset + limit ? pageParam + 1 : null

        return {
          response: {
            products,
            count,
          },
          nextPage: nextPage,
          queryParams,
        }
      }),
    MAX_RETRIES
  )
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
