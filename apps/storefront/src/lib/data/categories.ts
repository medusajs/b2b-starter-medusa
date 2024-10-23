"use server"

import { sdk } from "@lib/config"
import { cache } from "react"
import { getCacheHeaders } from "./cookies"

export const listCategories = cache(async function () {
  return sdk.store.category
    .list(
      { fields: "*category_children" },
      { ...getCacheHeaders("categories") }
    )
    .then(({ product_categories }) => product_categories)
})

export const getCategoriesList = cache(async function (
  offset: number = 0,
  limit: number = 100
) {
  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { limit, offset },
    { ...getCacheHeaders("categories") }
  )
})

export const getCategoryByHandle = cache(async function (
  categoryHandle: string[]
) {
  const handle = `${categoryHandle.join("/")}`

  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { handle },
    { ...getCacheHeaders("categories") }
  )
})
