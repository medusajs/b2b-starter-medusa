import { Button, Container } from "@medusajs/ui"
import { useMemo } from "react"

import { convertToLocale } from "@lib/util/money"
import { CalendarMini, DocumentText } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { StoreQuoteResponse } from "@starter/types"
import QuoteStatusBadge from "app/[countryCode]/(main)/account/@dashboard/quotes/components/quote-status-badge"

type QuoteCardProps = {
  quote: StoreQuoteResponse["quote"]
}

const QuoteCard = ({ quote }: QuoteCardProps) => {
  const { draft_order: order } = quote
  const createdAt = new Date(order.created_at)

  const numberOfLines = useMemo(
    () =>
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0,
    [order]
  )

  return (
    <Container className="bg-white flex p-4 rounded-md justify-between align-center items-center">
      <div className="flex gap-x-4 items-center">
        <div className="flex">
          {order.items?.slice(0, 3).map((i) => {
            return (
              <div
                key={i.id}
                className="w-7 h-7 border-2 border-neutral-200 bg-cover bg-center rounded-md ml-[-5px]"
                style={{ backgroundImage: `url(${i.thumbnail})` }}
              />
            )
          })}
        </div>

        <div>
          <span className="pr-2 text-small-regular">
            <CalendarMini className="inline-block mr-1" />
            {createdAt.getDate()}-{createdAt.getMonth()}-
            {createdAt.getFullYear()}
          </span>
        </div>

        <div className="text-small-regular">
          <DocumentText className="inline-block mr-1" />#
          <span>{order.display_id}</span>
        </div>

        <div>
          <QuoteStatusBadge status={quote.status} />
        </div>
      </div>

      <div className="flex gap-x-4 divide-x divide-gray-200 ">
        <div className="flex items-center text-small-regular text-ui-fg-base">
          <span className="px-2">
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
          {"·"}
          <span className="pl-2">{`${numberOfLines} ${
            numberOfLines > 1 ? "items" : "item"
          }`}</span>
        </div>

        <div className="pl-4">
          <LocalizedClientLink href={`/account/quotes/details/${quote.id}`}>
            <Button variant="secondary" className="rounded-full text-xs">
              See details
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </Container>
  )
}

export default QuoteCard
