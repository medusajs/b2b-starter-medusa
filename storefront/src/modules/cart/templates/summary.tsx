"use client"

import { useCart } from "@/lib/context/cart-context"
import { getCheckoutStep } from "@/lib/util/get-checkout-step"
import CartToCsvButton from "@/modules/cart/components/cart-to-csv-button"
import CartTotals from "@/modules/cart/components/cart-totals"
import PromotionCode from "@/modules/checkout/components/promotion-code"
import Button from "@/modules/common/components/button"
import Divider from "@/modules/common/components/divider"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { RequestQuoteConfirmation } from "@/modules/quotes/components/request-quote-confirmation"
import { RequestQuotePrompt } from "@/modules/quotes/components/request-quote-prompt"
import { B2BCustomer } from "@/types"
import { ApprovalStatusType } from "@/types/approval"
import { ExclamationCircle } from "@medusajs/icons"
import { Container } from "@medusajs/ui"
import { useLeadQuote } from "@/modules/lead-quote/context"
import { sendEvent } from "@/modules/analytics/events"

type SummaryProps = {
  customer: B2BCustomer | null
  spendLimitExceeded: boolean
}

const Summary = ({ customer, spendLimitExceeded }: SummaryProps) => {
  const { handleEmptyCart, cart } = useCart()

  if (!cart) return null

  const checkoutStep = getCheckoutStep(cart)
  const checkoutPath = checkoutStep
    ? `/checkout?step=${checkoutStep}`
    : "/checkout"

  const checkoutButtonLink = customer ? checkoutPath : "/account"

  const isPendingApproval = cart?.approvals?.some(
    (approval) => approval?.status === ApprovalStatusType.PENDING
  )

  return (
    <Container className="flex flex-col gap-y-4 rounded-2xl p-5 bg-[var(--surface)]/80 border border-[var(--border)] backdrop-blur-sm shadow-lg">
      <CartTotals />
      <Divider className="dark:border-zinc-800" />
      <PromotionCode cart={cart} />
      <Divider className="my-4 dark:border-zinc-800" />
      {spendLimitExceeded && (
        <div className="flex items-center gap-x-3 p-3 rounded-xl border border-amber-200/60 dark:border-amber-400/20 bg-amber-50/70 dark:bg-amber-500/10 backdrop-blur-sm">
          <ExclamationCircle className="text-amber-600 dark:text-amber-400 w-fit overflow-visible" />
          <p className="text-xs text-zinc-800 dark:text-zinc-200">
            Este pedido excede seu limite de gastos.
            <br />
            Entre em contato com seu gerente para aprovação.
          </p>
        </div>
      )}
      <LocalizedClientLink
        href={checkoutButtonLink}
        data-testid="checkout-button"
      >
        <Button
          className="w-full h-11 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          disabled={spendLimitExceeded}
        >
          {customer
            ? spendLimitExceeded
              ? "Limite de gastos excedido"
              : "Finalizar compra"
            : "Entrar para finalizar"}
        </Button>
      </LocalizedClientLink>
      {!!customer && (
        <RequestQuoteConfirmation>
          <Button
            className="w-full h-11 rounded-full shadow-borders-base hover:shadow-lg transition-all duration-200"
            variant="secondary"
            disabled={isPendingApproval}
          >
            Solicitar cotação
          </Button>
        </RequestQuoteConfirmation>
      )}
      {!customer && (
        <RequestQuotePrompt>
          <Button
            className="w-full h-11 rounded-full shadow-borders-base hover:shadow-lg transition-all duration-200"
            variant="secondary"
            disabled={isPendingApproval}
          >
            Solicitar cotação
          </Button>
        </RequestQuotePrompt>
      )}
      <CartToCsvButton cart={cart} />
      <Button
        onClick={handleEmptyCart}
        className="w-full h-11 rounded-full shadow-borders-base hover:shadow-lg transition-all duration-200"
        variant="secondary"
        disabled={isPendingApproval}
      >
        Esvaziar carrinho
      </Button>
    </Container>
  )
}

export default Summary
