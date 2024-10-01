"use server"

import { sdk } from "@lib/config"
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

export async function listQuotes() {
  return await sdk.client.fetch<{ quotes: QuoteDTO[] }>(`/customers/quotes`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  })
}
