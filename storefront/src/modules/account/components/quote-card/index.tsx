import { Button } from "@medusajs/ui"
import { useMemo } from "react"

import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import QuoteStatusBadge from "app/[countryCode]/(main)/account/@dashboard/quotes/components/quote-status-badge"
import { GeneralQuoteType } from "types/global"

type QuoteCardProps = {
  quote: GeneralQuoteType
}

const QuoteCard = ({ quote }: QuoteCardProps) => {
  const { draft_order: order } = quote

  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  return (
    <div className="bg-white flex flex-col" data-testid="quote-card">
      <div className="uppercase text-large-semi mb-1">
        #<span data-testid="order-display-id">{order.display_id}</span>
      </div>

      <div>
        <QuoteStatusBadge status={quote.status} />
      </div>

      <div className="flex items-center divide-x divide-gray-200 text-small-regular text-ui-fg-base">
        <span className="pr-2" data-testid="order-created-at">
          {new Date(order.created_at).toDateString()}
        </span>
        <span className="px-2" data-testid="order-amount">
          {convertToLocale({
            amount: order.total,
            currency_code: order.currency_code,
          })}
        </span>
        <span className="pl-2">{`${numberOfLines} ${
          numberOfLines > 1 ? "items" : "item"
        }`}</span>
      </div>
      <div className="grid grid-cols-2 small:grid-cols-4 gap-4 my-4">
        {order.items?.slice(0, 3).map((i) => {
          return (
            <div
              key={i.id}
              className="flex flex-col gap-y-2"
              data-testid="order-item"
            >
              <Thumbnail thumbnail={i.thumbnail} images={[]} size="full" />
              <div className="flex items-center text-small-regular text-ui-fg-base">
                <span
                  className="text-ui-fg-base font-semibold"
                  data-testid="item-title"
                >
                  {i.title}
                </span>
                <span className="ml-2">x</span>
                <span data-testid="item-quantity">{i.quantity}</span>
              </div>
            </div>
          )
        })}
        {numberOfProducts > 4 && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-small-regular text-ui-fg-base">
              + {numberOfLines - 4}
            </span>
            <span className="text-small-regular text-ui-fg-base">more</span>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <LocalizedClientLink href={`/account/quotes/details/${quote.id}`}>
          <Button data-testid="quote-details-link" variant="secondary">
            See details
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default QuoteCard
