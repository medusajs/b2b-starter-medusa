"use server"

import { sdk } from "@lib/config"
import { AdminOrderPreview } from "@medusajs/types"
import { QuoteDTO } from "../../../../backend/src/modules/quote/types/common"
import { getAuthHeaders, getCartId } from "./cookies"

export async function createQuote() {
  const quoteResponse = await sdk.client.fetch<{ quote: QuoteDTO }>(
    `/customers/quotes`,
    {
      method: "POST",
      body: {
        cart_id: getCartId(),
      },
      headers: {
        ...getAuthHeaders(),
      },
    }
  )

  return quoteResponse.quote
}

export async function retrieveQuote(id: string) {
  return await sdk.client.fetch<{ quote: QuoteDTO }>(
    `/customers/quotes/${id}`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    }
  )
}

export async function retrieveQuotePreview(id: string) {
  return await sdk.client.fetch<{
    preview: AdminOrderPreview
  }>(`/customers/quotes/${id}/preview`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  })
}

export async function listQuotes() {
  return await sdk.client.fetch<{ quotes: QuoteDTO[] }>(`/customers/quotes`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  })
}
