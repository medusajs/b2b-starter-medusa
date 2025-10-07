"use client"

import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { FileText } from "@medusajs/icons"
import { useLeadQuote } from "@/modules/lead-quote/context"

export default function QuoteLink() {
  const { items } = useLeadQuote()
  const count = items.length
  return (
    <LocalizedClientLink
      href="/cotacao"
      className="relative flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1"
      title={count > 0 ? `Lista de cotação com ${count} item(s)` : "Lista de cotação"}
      aria-label={count > 0 ? `Cotação, ${count} item(s)` : "Cotação"}
    >
      <div className="relative">
        <FilePlus />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-400 text-[10px] leading-4 text-neutral-900 text-center">
            {count}
          </span>
        )}
      </div>
      <span className="hidden small:inline-block">Cotação{count > 0 ? ` (${count})` : ""}</span>
    </LocalizedClientLink>
  )
}
