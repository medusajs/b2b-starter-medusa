"use client"

import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { FilePlus } from "@medusajs/icons"
import { useLeadQuote } from "@/modules/lead-quote/context"

export default function QuoteLink() {
  const { items } = useLeadQuote()
  const count = items.length
  return (
    <LocalizedClientLink href="/cotacao" className="flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1">
      <FilePlus />
      <span className="hidden small:inline-block">Cotação{count > 0 ? ` (${count})` : ""}</span>
    </LocalizedClientLink>
  )
}

