"use server"

import { sdk } from "@/lib/config"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
} from "@/lib/data/cookies"
import {
  QuoteFilterParams,
  StoreCreateQuoteMessage,
  StoreQuotePreviewResponse,
  StoreQuoteResponse,
  StoreQuotesResponse,
} from "@/types"
import { track } from "@vercel/analytics/server"
import { revalidateTag } from "next/cache"

export const createQuote = async () => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartId = await getCartId()

  return sdk.client
    .fetch<StoreQuoteResponse>(`/store/quotes`, {
      method: "POST",
      body: { cart_id: cartId },
      headers,
    })
    .then((quote) => {
      track("quote_created", {
        quote_id: quote.quote.id,
      })

      return quote
    })
}

export const fetchQuotes = async (query?: QuoteFilterParams) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("quotes")),
  }

  return sdk.client.fetch<StoreQuotesResponse>(
    `/store/quotes?order=-created_at`,
    {
      method: "GET",
      query,
      headers,
      next,
    }
  )
}

export const fetchQuote = async (id: string, query?: QuoteFilterParams) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions(["quote", id].join("-"))),
  }

  return sdk.client.fetch<StoreQuoteResponse>(`/store/quotes/${id}`, {
    method: "GET",
    query,
    headers,
    next,
  })
}

export const fetchQuotePreview = async (
  id: string,
  query?: QuoteFilterParams
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions(["quotePreview", id].join("-"))),
  }

  return sdk.client.fetch<StoreQuotePreviewResponse>(
    `/store/quotes/${id}/preview`,
    {
      method: "GET",
      query,
      headers,
      next,
    }
  )
}

export const acceptQuote = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<StoreQuoteResponse>(`/store/quotes/${id}/accept`, {
      method: "POST",
      body: {},
      headers,
      cache: "force-cache",
    })
    .then((res) => {
      track("quote_accepted", {
        quote_id: res.quote.id,
      })

      return res
    })
    .finally(async () => {
      const tags = await Promise.all([
        getCacheTag("quotes"),
        getCacheTag(["quote", id].join("-")),
        getCacheTag(["quotePreview", id].join("-")),
      ])
      tags.forEach((tag) => revalidateTag(tag))
    })
}

export const rejectQuote = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<StoreQuoteResponse>(`/store/quotes/${id}/reject`, {
      method: "POST",
      body: {},
      headers,
      cache: "force-cache",
    })
    .finally(async () => {
      const tags = await Promise.all([
        getCacheTag("quotes"),
        getCacheTag(["quote", id].join("-")),
        getCacheTag(["quotePreview", id].join("-")),
      ])
      tags.forEach((tag) => revalidateTag(tag))
    })
}

export const createQuoteMessage = async (
  id: string,
  body: StoreCreateQuoteMessage
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<StoreQuoteResponse>(`/store/quotes/${id}/messages`, {
      method: "POST",
      body,
      headers,
      cache: "force-cache",
    })
    .then((res) => {
      track("quote_message_created", {
        quote_id: res.quote.id,
      })

      return res
    })
    .finally(async () => {
      const tags = await Promise.all([
        getCacheTag("quotes"),
        getCacheTag(["quote", id].join("-")),
        getCacheTag(["quotePreview", id].join("-")),
      ])
      tags.forEach((tag) => revalidateTag(tag))
    })
}
