"use server"

import { sdk } from "@lib/config"
import {
  getAuthHeaders,
  getCacheHeaders,
  getCacheTag,
  getCartId,
} from "@lib/data/cookies"
import {
  QuoteFilterParams,
  StoreCreateQuoteMessage,
  StoreQuotePreviewResponse,
  StoreQuoteResponse,
  StoreQuotesResponse,
} from "@starter/types"
import { revalidateTag } from "next/cache"

export const createQuote = async () =>
  sdk.client.fetch<StoreQuoteResponse>(`/store/quotes`, {
    method: "POST",
    body: { cart_id: getCartId() },
    headers: getAuthHeaders(),
  })

export const fetchQuotes = (query?: QuoteFilterParams) =>
  sdk.client.fetch<StoreQuotesResponse>(`/store/quotes?order=-created_at`, {
    method: "GET",
    query,
    headers: {
      ...getAuthHeaders(),
      ...getCacheHeaders("quotes"),
    },
  })

export const fetchQuote = (id: string, query?: QuoteFilterParams) =>
  sdk.client.fetch<StoreQuoteResponse>(`/store/quotes/${id}`, {
    method: "GET",
    query,
    headers: {
      ...getAuthHeaders(),
      ...getCacheHeaders(["quote", id].join("-")),
    },
  })

export const fetchQuotePreview = (id: string, query?: QuoteFilterParams) =>
  sdk.client.fetch<StoreQuotePreviewResponse>(`/store/quotes/${id}/preview`, {
    method: "GET",
    query,
    headers: {
      ...getAuthHeaders(),
      ...getCacheHeaders(["quotePreview", id].join("-")),
    },
  })

export const acceptQuote = async (id: string) =>
  sdk.client
    .fetch<StoreQuoteResponse>(`/store/quotes/${id}/accept`, {
      method: "POST",
      body: {},
      headers: getAuthHeaders(),
    })
    .finally(() => {
      revalidateTag(getCacheTag("quotes"))
      revalidateTag(getCacheTag(["quote", id].join("-")))
      revalidateTag(getCacheTag(["quotePreview", id].join("-")))
    })

export const rejectQuote = async (id: string) =>
  sdk.client
    .fetch<StoreQuoteResponse>(`/store/quotes/${id}/reject`, {
      method: "POST",
      body: {},
      headers: getAuthHeaders(),
    })
    .finally(() => {
      revalidateTag(getCacheTag("quotes"))
      revalidateTag(getCacheTag(["quote", id].join("-")))
      revalidateTag(getCacheTag(["quotePreview", id].join("-")))
    })

export const createQuoteMessage = async (
  id: string,
  body: StoreCreateQuoteMessage
) =>
  sdk.client
    .fetch<StoreQuoteResponse>(`/store/quotes/${id}/messages`, {
      method: "POST",
      body,
      headers: getAuthHeaders(),
    })
    .finally(() => {
      revalidateTag(getCacheTag("quotes"))
      revalidateTag(getCacheTag(["quote", id].join("-")))
      revalidateTag(getCacheTag(["quotePreview", id].join("-")))
    })
