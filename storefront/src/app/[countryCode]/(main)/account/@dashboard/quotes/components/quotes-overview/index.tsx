"use client"

import QuoteCard from "@/modules/account/components/quote-card"
import { EmptyQuotesWithCalculator, CreateQuoteFromCalculatorCTA } from "@/modules/quotes/components/solar-integration"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { StoreQuoteResponse } from "@/types/quote"
import { Button } from "@medusajs/ui"

const QuotesOverview = ({
  quotes,
}: {
  quotes: StoreQuoteResponse["quote"][]
}) => {
  if (quotes?.length) {
    return (
      <div className="flex flex-col gap-y-4 w-full">
        <CreateQuoteFromCalculatorCTA countryCode="br" />
        <div className="flex flex-col gap-y-2">
          {quotes.map((quote) => (
            <div key={quote.id}>
              <QuoteCard quote={quote} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <EmptyQuotesWithCalculator countryCode="br" />
  )
}

export default QuotesOverview
