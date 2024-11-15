"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: { fields: "*category_children", ...query },
        next,
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<{ product_category: HttpTypes.StoreProductCategory }>(
      `/store/product-categories/${handle}`,
      {
        next,
      }
    )
    .then(({ product_category }) => product_category)
}
