"use client"

import QuoteCard from "@/modules/account/components/quote-card"
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
      <div className="flex flex-col gap-y-2 w-full">
        {quotes.map((quote) => (
          <div key={quote.id}>
            <QuoteCard quote={quote} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center gap-y-4">
      <h2 className="text-large-semi">Nothing to see here</h2>
      <p className="text-base-regular">You don&apos;t have any quotes yet</p>

      <div className="mt-4">
        <LocalizedClientLink href="/" passHref>
          <Button data-testid="continue-shopping-button">
            Continue shopping
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default QuotesOverview
