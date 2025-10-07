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
  const lead = (() => { try { return require("@/modules/lead-quote/context") } catch { return null } })
  let addQuote: undefined | ((item: any) => void)
  try { addQuote = useLeadQuote().add } catch {}

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
    <Container className="flex flex-col gap-y-3">
      <CartTotals />
      <Divider />
      <PromotionCode cart={cart} />
      <Divider className="my-6" />
      {spendLimitExceeded && (
        <div className="flex items-center gap-x-2 bg-neutral-100 p-3 rounded-md shadow-borders-base">
          <ExclamationCircle className="text-orange-500 w-fit overflow-visible" />
          <p className="text-neutral-950 text-xs">
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
          className="w-full h-10 rounded-full shadow-none"
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
            className="w-full h-10 rounded-full shadow-borders-base"
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
            className="w-full h-10 rounded-full shadow-borders-base"
            variant="secondary"
            disabled={isPendingApproval}
          >
            Solicitar cotação
          </Button>
        </RequestQuotePrompt>
      )}
      <CartToCsvButton cart={cart} />
      <Button
        className="w-full h-10 rounded-full shadow-borders-base"
        variant="secondary"
        onClick={() => {
          cart.items?.forEach((li) => {
            addQuote?.({ id: li.product_id || li.id, category: 'panels', name: li.title, manufacturer: li?.metadata?.brand || '', image_url: li.thumbnail || '', price_brl: li.unit_price })
          })
          sendEvent("add_cart_to_quote", { cart_id: cart.id, count: cart.items?.length || 0 })
        }}
      >
        Adicionar itens do carrinho à cotação
      </Button>
      <Button
        onClick={handleEmptyCart}
        className="w-full h-10 rounded-full shadow-borders-base"
        variant="secondary"
        disabled={isPendingApproval}
      >
        Esvaziar carrinho
      </Button>
    </Container>
  )
}

export default Summary
