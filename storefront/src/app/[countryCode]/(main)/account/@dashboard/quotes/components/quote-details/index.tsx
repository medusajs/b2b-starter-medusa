"use client"

import { acceptQuote, rejectQuote } from "@/lib/data/quotes"
import { formatAmount } from "@/modules/common/components/amount-cell"
import Button from "@/modules/common/components/button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { PromptModal } from "@/modules/common/components/prompt-modal"
import { B2BCustomer } from "@/types/global"
import { StoreQuoteResponse } from "@/types/quote"
import { ArrowUturnLeft, CheckCircleSolid } from "@medusajs/icons"
import { AdminOrderLineItem, AdminOrderPreview } from "@medusajs/types"
import { Container, Heading, Text, toast } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import React, { useMemo, useState } from "react"
import QuoteMessages from "../quote-messages"
import QuoteStatusBadge from "../quote-status-badge"
import { QuoteTableItem } from "../quote-table"

type QuoteDetailsProps = {
  quote: StoreQuoteResponse["quote"] & {
    customer: B2BCustomer
  }
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
    <div className="flex flex-col gap-y-2 p-0">
      <div className="flex gap-2 justify-between items-center mb-2">
        <LocalizedClientLink
          href="/account/quotes"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <Button variant="secondary">
            <ArrowUturnLeft /> Voltar
          </Button>
        </LocalizedClientLink>
      </div>

      <div className="small:grid small:grid-cols-6 flex flex-col-reverse small:gap-4 gap-2">
        <div className="small:col-span-4 flex flex-col gap-y-2">
          {quote.status === "accepted" && (
            <Container className="p-0">
              <div className="flex items-center justify-between px-6 py-4">
                <Text className="txt-compact-small">
                  <CheckCircleSolid className="inline-block mr-2 text-green-500 text-lg" />
                  Cotação aceita pelo cliente. Pedido pronto para processamento.
                </Text>

                <Button
                  size="small"
                  onClick={() =>
                    router.push(
                      `/${countryCode}/account/orders/details/${quote.draft_order_id}`
                    )
                  }
                >
                  Ver Pedido
                </Button>
              </div>
            </Container>
          )}

          {preview.items?.map((item) => (
            <Container key={item.id}>
              <QuoteTableItem
                key={item.id}
                item={item}
                originalItem={originalItemsMap.get(item.id)}
                currencyCode={order.currency_code}
              />
            </Container>
          ))}

          <Container className="p-0">
            <div className="py-4">
              <div className="flex items-center justify-between mb-2 px-6">
                <span className="txt-small text-ui-fg-subtle font-semibold">
                  Total Atual
                </span>

                <span className="txt-small text-ui-fg-subtle">
                  {formatAmount(order.total, order.currency_code)}
                </span>
              </div>

              <div className="flex items-center justify-between px-6">
                <span className="txt-small text-ui-fg-subtle font-semibold">
                  Novo Total
                </span>

                <span className="txt-small text-ui-fg-subtle">
                  {formatAmount(preview.total, order.currency_code)}
                </span>
              </div>
            </div>
          </Container>

          {quote.status === "pending_customer" && (
            <div className="flex gap-x-3 justify-end my-4">
              <PromptModal
                title="Rejeitar cotação?"
                description="Tem certeza de que deseja rejeitar a cotação? Esta ação é irreversível."
                handleAction={() => {
                  setIsRejecting(true)

                  rejectQuote(quote.id)
                    .catch((e) => toast.error(e.message))
                    .finally(() => setIsRejecting(false))
                }}
                isLoading={isRejecting}
              >
                <Button size="small" variant="secondary">
                  Rejeitar Cotação
                </Button>
              </PromptModal>

              <PromptModal
                title="Aceitar cotação?"
                description="Tem certeza de que deseja aceitar a cotação? Esta ação é irreversível."
                handleAction={() => {
                  setIsAccepting(true)

                  acceptQuote(quote.id)
                    .catch((e) => toast.error(e.message))
                    .finally(() => setIsAccepting(false))
                }}
                isLoading={isAccepting}
              >
                <Button size="small" variant="primary">
                  Aceitar Cotação
                </Button>
              </PromptModal>
            </div>
          )}

          <QuoteMessages quote={quote} preview={preview} />
        </div>

        <div className="col-span-2 flex flex-col gap-y-2">
          <Container className="flex gap-x-3 justify-between">
            <div className="text-sm">
              <span className="font-semibold text-ui-fg-subtle">Quote ID:</span>{" "}
              #<span>{quote.draft_order.display_id}</span>
            </div>

            <QuoteStatusBadge status={quote.status} />
          </Container>

          <Container>
            <Heading level="h3" className="mb-2">
              Cliente
            </Heading>

            <div className="text-sm text-ui-fg-subtle">
              <div className="flex justify-between">
                <Text>E-mail</Text>
                <Text>{quote.customer?.email || "-"}</Text>
              </div>

              <div className="flex justify-between">
                <Text>Telefone</Text>
                <Text>{quote.customer?.phone || "-"}</Text>
              </div>

              <div className="flex justify-between">
                <Text>Limite de gastos</Text>
                <Text>
                  {(quote.customer?.employee?.spending_limit &&
                    formatAmount(
                      quote.customer?.employee?.spending_limit || 0,
                      order.currency_code.toUpperCase()
                    )) ||
                    "-"}
                </Text>
              </div>
            </div>
          </Container>

          <Container>
            <Heading level="h3" className="mb-2">
              Empresa
            </Heading>

            <div className="text-sm text-ui-fg-subtle">
              <div className="flex justify-between">
                <Text>Nome</Text>
                <Text>{quote.customer?.employee?.company?.name || "-"}</Text>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default QuoteDetails
