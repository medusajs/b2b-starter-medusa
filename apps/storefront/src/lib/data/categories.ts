"use server"

import { sdk } from "@lib/config"
import { cache } from "react"
import { getCacheHeaders } from "./cookies"

export const listCategories = cache(async function () {
  const headers = {
    ...(await getCacheHeaders("categories")),
  }

  return sdk.store.category
    .list({ fields: "*category_children" }, headers)
    .then(({ product_categories }) => product_categories)
})

export const getCategoriesList = cache(async function (
  offset: number = 0,
  limit: number = 100
) {
  const headers = {
    ...(await getCacheHeaders("categories")),
  }

  return sdk.store.category.list({ limit, offset }, headers)
})

export const getCategoryByHandle = cache(async function (
  categoryHandle: string[]
) {
  const handle = `${categoryHandle.join("/")}`

  const headers = {
    ...(await getCacheHeaders("categories")),
  }

  return sdk.store.category.list({ handle }, headers)
})
