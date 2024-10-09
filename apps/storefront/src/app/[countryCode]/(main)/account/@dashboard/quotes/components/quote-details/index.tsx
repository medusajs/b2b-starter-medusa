"use client"

import { acceptQuote, rejectQuote } from "@lib/data/quotes"
import { CheckCircleSolid } from "@medusajs/icons"
import { AdminOrderLineItem, AdminOrderPreview } from "@medusajs/types"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { formatAmount } from "@modules/common/components/amount-cell"
import { PromptModal } from "@modules/common/components/prompt-modal"
import { StoreQuoteResponse } from "@starter/types"
import QuoteStatusBadge from "app/[countryCode]/(main)/account/@dashboard/quotes/components/quote-status-badge"
import { useRouter } from "next/navigation"
import React, { useMemo, useState } from "react"
import QuoteMessages from "../quote-messages"
import { QuoteTableItem } from "../quote-table"

type QuoteDetailsProps = {
  quote: StoreQuoteResponse["quote"]
  preview: AdminOrderPreview
  countryCode: string
}

const QuoteDetails: React.FC<QuoteDetailsProps> = ({
  quote,
  preview,
  countryCode,
}) => {
  const order = quote.draft_order
  const originalItemsMap = useMemo(() => {
    return new Map<string, AdminOrderLineItem>(
      order.items?.map((item: AdminOrderLineItem) => [item.id, item])
    )
  }, [order])

  const router = useRouter()
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  return (
    <div className="flex flex-col gap-y-8 p-0">
      <div className="flex gap-3">
        <Heading className="text-2xl inline">Quote</Heading>

        <div className="inline self-center">
          <QuoteStatusBadge status={quote.status} />
        </div>
      </div>

      {quote.status === "accepted" && (
        <Container className="p-0">
          <div className="flex items-center justify-between px-6 py-4">
            <Text className="txt-compact-small">
              <CheckCircleSolid className="inline-block mr-2 text-green-500 text-lg" />
              Quote accepted by customer. Order is ready for processing.
            </Text>

            <Button
              size="small"
              onClick={() =>
                router.push(
                  `/${countryCode}/account/orders/details/${quote.draft_order_id}`
                )
              }
            >
              View Order
            </Button>
          </div>
        </Container>
      )}

      <Container className="divide-y divide-dashed p-0">
        {preview.items?.map((item) => (
          <QuoteTableItem
            key={item.id}
            item={item}
            originalItem={originalItemsMap.get(item.id)}
            currencyCode={order.currency_code}
          />
        ))}

        {/*TOTALS SECTION*/}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2 px-6">
            <span className="txt-small text-ui-fg-subtle font-semibold">
              Current Total
            </span>

            <span className="txt-small text-ui-fg-subtle">
              {formatAmount(order.total, order.currency_code)}
            </span>
          </div>

          <div className="flex items-center justify-between px-6">
            <span className="txt-small text-ui-fg-subtle font-semibold">
              New Total
            </span>

            <span className="txt-small text-ui-fg-subtle">
              {formatAmount(preview.total, order.currency_code)}
            </span>
          </div>
        </div>
      </Container>

      {quote.status === "pending_customer" && (
        <div className="flex gap-x-3 justify-end">
          <PromptModal
            title="Reject Quote?"
            description="Are you sure you want to reject quote? This action is irreversible."
            handleAction={() => {
              setIsRejecting(true)

              rejectQuote(quote.id)
                .catch((e) => toast.error(e.message))
                .finally(() => setIsRejecting(false))
            }}
            isLoading={isRejecting}
          >
            <Button size="small" variant="secondary">
              Reject Quote
            </Button>
          </PromptModal>

          <PromptModal
            title="Accept Quote?"
            description="Are you sure you want to accept quote? This action is irreversible."
            handleAction={() => {
              setIsAccepting(true)

              acceptQuote(quote.id)
                .catch((e) => toast.error(e.message))
                .finally(() => setIsAccepting(false))
            }}
            isLoading={isAccepting}
          >
            <Button size="small" variant="primary">
              Accept Quote
            </Button>
          </PromptModal>
        </div>
      )}

      <QuoteMessages quote={quote} preview={preview} />
    </div>
  )
}

export default QuoteDetails
