import { Metadata } from "next"

import { listQuotes } from "@lib/data/quotes"
import QuotesOverview from "@modules/account/components/quotes-overview"

export const metadata: Metadata = {
  title: "Quotes",
  description: "Overview of your previously requested quotes.",
}

export default async function Quotes() {
  const { quotes = [] } = await listQuotes()

  return (
    <div className="w-full" data-testid="quotes-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Quotes</h1>
        <p className="text-base-regular">
          View your previous quotes and their status.
        </p>
      </div>

      <div>
        <QuotesOverview quotes={quotes} />
      </div>
    </div>
  )
}
