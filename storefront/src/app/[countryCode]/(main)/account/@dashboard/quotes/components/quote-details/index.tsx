"use client"

import { useAcceptQuote, useRejectQuote } from "@lib/hooks/api/quotes"
import { CheckCircleSolid } from "@medusajs/icons"
import { AdminOrderLineItem, AdminOrderPreview } from "@medusajs/types"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { formatAmount } from "@modules/common/components/amount-cell"
import { PromptModal } from "@modules/common/components/prompt-modal"
import QuoteStatusBadge from "app/[countryCode]/(main)/account/@dashboard/quotes/components/quote-status-badge"
import { useParams, useRouter } from "next/navigation"
import React, { useMemo } from "react"
import { GeneralQuoteType } from "types/global"
import QuoteMessages from "../quote-messages"
import { QuoteTableItem } from "../quote-table"

type QuoteDetailsProps = {
  quote: GeneralQuoteType
  preview: AdminOrderPreview
}

const QuoteDetails: React.FC<QuoteDetailsProps> = ({ quote, preview }) => {
  const order = quote.draft_order
  const originalItemsMap = useMemo(() => {
    return new Map<string, AdminOrderLineItem>(
      order.items?.map((item: AdminOrderLineItem) => [item.id, item])
    )
  }, [order])

  const { countryCode } = useParams()
  const router = useRouter()
  const { mutateAsync: acceptQuote, isPending: isAcceptingQuote } =
    useAcceptQuote(quote.id)
  const { mutateAsync: rejectQuote, isPending: isRejectingQuote } =
    useRejectQuote(quote.id)

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
            handleAction={() =>
              rejectQuote(
                {},
                { onError: (error) => toast.error(error.message) }
              )
            }
            isLoading={isRejectingQuote}
          >
            <Button size="small" variant="secondary">
              Reject Quote
            </Button>
          </PromptModal>

          <PromptModal
            title="Accept Quote?"
            description="Are you sure you want to accept quote? This action is irreversible."
            handleAction={() =>
              acceptQuote(
                {},
                {
                  onError: (error) => toast.error(error.message),
                }
              )
            }
            isLoading={isAcceptingQuote}
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
