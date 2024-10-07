"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCartId } from "@lib/data/cookies"
import { GeneralQuoteType } from "types/global"

export const fetchQuotes = (query?: GeneralQuoteType) =>
  sdk.client.fetch<GeneralQuoteType>(`/store/quotes`, {
    method: "GET",
    headers: getAuthHeaders(),
  })

export const fetchQuote = (id: string, query?: GeneralQuoteType) =>
  sdk.client.fetch<GeneralQuoteType>(`/store/quotes/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  })

export const fetchQuotePreview = (id: string, query?: GeneralQuoteType) =>
  sdk.client.fetch<GeneralQuoteType>(`/store/quotes/${id}/preview`, {
    method: "GET",
    headers: getAuthHeaders(),
  })

export const createQuote = async () =>
  sdk.client.fetch<{ quote: GeneralQuoteType }>(`/store/quotes`, {
    method: "POST",
    body: { cart_id: getCartId() },
    headers: getAuthHeaders(),
  })

export const acceptQuote = async (id: string) =>
  sdk.client.fetch<{ quote: GeneralQuoteType }>(`/store/quotes/${id}/accept`, {
    method: "POST",
    body: {},
    headers: getAuthHeaders(),
  })

export const rejectQuote = async (id: string) =>
  sdk.client.fetch<{ quote: GeneralQuoteType }>(`/store/quotes/${id}/reject`, {
    method: "POST",
    body: {},
    headers: getAuthHeaders(),
  })

export const createQuoteMessage = async (id: string, body: GeneralQuoteType) =>
  sdk.client.fetch<{ quote: GeneralQuoteType }>(
    `/store/quotes/${id}/comments`,
    {
      method: "POST",
      body,
      headers: getAuthHeaders(),
    }
  )
