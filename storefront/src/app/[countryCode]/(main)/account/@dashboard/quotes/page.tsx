"use client"

import { useQuotes } from "@lib/hooks/api/quotes"
import QuotesOverview from "app/[countryCode]/(main)/account/@dashboard/quotes/components/quotes-overview"

export default function Quotes() {
  const { quotes, isLoading } = useQuotes()

  if (isLoading) {
    return <></>
  }

  return (
    <div className="w-full" data-testid="quotes-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Quotes</h1>

        <p className="text-base-regular">
          View your previous quotes and their status.
        </p>
      </div>

      <div>
        <QuotesOverview quotes={quotes!} />
      </div>
    </div>
  )
}
