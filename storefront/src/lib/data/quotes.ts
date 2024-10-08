"use server"

import { sdk } from "@lib/config"
import {
  getAuthHeaders,
  getCacheHeaders,
  getCacheTag,
  getCartId,
} from "@lib/data/cookies"
import { revalidateTag } from "next/cache"
import { GeneralQuoteType } from "types/global"

export const createQuote = async () =>
  sdk.client.fetch<{ quote: GeneralQuoteType }>(`/store/quotes`, {
    method: "POST",
    body: { cart_id: getCartId() },
    headers: getAuthHeaders(),
  })

export const fetchQuotes = (query?: GeneralQuoteType) =>
  sdk.client.fetch<GeneralQuoteType>(`/store/quotes?order=-created_at`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      ...getCacheHeaders("quotes"),
    },
  })

export const fetchQuote = (id: string, query?: GeneralQuoteType) =>
  sdk.client.fetch<GeneralQuoteType>(`/store/quotes/${id}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      ...getCacheHeaders(["quote", id].join("-")),
    },
  })

export const fetchQuotePreview = (id: string, query?: GeneralQuoteType) =>
  sdk.client.fetch<GeneralQuoteType>(`/store/quotes/${id}/preview`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      ...getCacheHeaders(["quotePreview", id].join("-")),
    },
  })

export const acceptQuote = async (id: string) =>
  sdk.client
    .fetch<{ quote: GeneralQuoteType }>(`/store/quotes/${id}/accept`, {
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
    .fetch<{ quote: GeneralQuoteType }>(`/store/quotes/${id}/reject`, {
      method: "POST",
      body: {},
      headers: getAuthHeaders(),
    })
    .finally(() => {
      revalidateTag(getCacheTag("quotes"))
      revalidateTag(getCacheTag(["quote", id].join("-")))
      revalidateTag(getCacheTag(["quotePreview", id].join("-")))
    })

export const createQuoteMessage = async (id: string, body: GeneralQuoteType) =>
  sdk.client
    .fetch<{ quote: GeneralQuoteType }>(`/store/quotes/${id}/messages`, {
      method: "POST",
      body,
      headers: getAuthHeaders(),
    })
    .finally(() => {
      revalidateTag(getCacheTag("quotes"))
      revalidateTag(getCacheTag(["quote", id].join("-")))
      revalidateTag(getCacheTag(["quotePreview", id].join("-")))
    })
