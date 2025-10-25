"use client"

import dynamic from "next/dynamic"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { DocumentText } from "@medusajs/icons"

// Importar o componente Client de forma dinâmica para evitar SSR
const QuoteLinkClient = dynamic(() => import("./quote-link-client"), {
  ssr: false,
  loading: () => (
    <LocalizedClientLink
      href="/cotacao"
      className="relative flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1"
      title="Lista de cotação"
      aria-label="Cotação"
    >
      <div className="relative">
        <DocumentText />
      </div>
      <span className="hidden small:inline-block">Cotação</span>
    </LocalizedClientLink>
  ),
})

export default function QuoteLink() {
  return <QuoteLinkClient />
}
