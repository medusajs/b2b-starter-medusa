import { Button, Container } from "@medusajs/ui"
import { useMemo } from "react"

import { convertToLocale } from "@lib/util/money"
import { CalendarMini, DocumentText } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { StoreQuoteResponse } from "@starter/types"
import QuoteStatusBadge from "app/[countryCode]/(main)/account/@dashboard/quotes/components/quote-status-badge"
import { Thumbnail } from "@modules/common/components/thumbnail"
import Image from "next/image"
import getThumbnailRotation from "@lib/util/get-thumbnail-rotation"

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
    <Container className="bg-white flex small:flex-row flex-col p-4 rounded-md small:justify-between small:items-center gap-y-2 items-start">
      <div className="flex gap-x-4 items-center pl-3">
        <div className="flex">
          {order.items?.slice(0, 3).map((item, index) => {
            const rotation = getThumbnailRotation(index, order.items.length)

            return (
              <div
                key={item.id}
                className={`block w-7 h-7 bg-neutral-100 border border-white bg-cover bg-center rounded-md ml-[-5px] p-1 ${rotation}`}
              >
                <Image
                  src={item.thumbnail!}
                  alt={item.title}
                  className={`h-full w-full object-cover object-center ${rotation}`}
                  draggable={false}
                  quality={50}
                  width={20}
                  height={20}
                />
              </div>
            )
          })}
        </div>

        <div className="flex pr-2 text-small-regular items-center">
          <CalendarMini className="inline-block mr-1" />
          {createdAt.getDate()}-{createdAt.getMonth()}-{createdAt.getFullYear()}
        </div>

        <div className="flex text-small-regular items-center">
          <DocumentText className="inline-block mr-1" />#
          <span>{order.display_id}</span>
        </div>

        <div className="flex items-center">
          <QuoteStatusBadge status={quote.status} />
        </div>
      </div>

      <div className="flex gap-x-4 small:divide-x divide-gray-200 small:justify-normal justify-between w-full small:w-auto">
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
