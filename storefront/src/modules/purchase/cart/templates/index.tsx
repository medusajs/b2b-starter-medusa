"use client"

import { useCart } from "@/lib/context/cart-context"
import { checkSpendingLimit } from "@/lib/util/check-spending-limit"
import ApprovalStatusBanner from "../components/approval-status-banner"
import EmptyCartMessage from "../components/empty-cart-message"
import { EmptyCartSolarUpsell } from "../components/solar-integration"
import SignInPrompt from "../components/sign-in-prompt"
import ItemsTemplate from "./items"
import Summary from "./summary"
import { ErrorBoundaryResilient } from "@/components/error-boundary/error-boundary-resilient"
import { B2BCustomer } from "@/types/global"
import { Heading } from "@medusajs/ui"
import { useMemo } from "react"

const CartTemplate = ({ customer }: { customer: B2BCustomer | null }) => {
  const { cart } = useCart()

  const spendLimitExceeded = useMemo(
    () => checkSpendingLimit(cart, customer),
    [cart, customer]
  )

  const totalItems = useMemo(
    () => cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0,
    [cart?.items]
  )

  return (
    <ErrorBoundaryResilient
      context="cart"
      fallbackMessage="Erro ao carregar o carrinho. Tente recarregar a página."
      showRetry={true}
      maxRetries={3}
    >
      <div className="small:py-12 py-6 bg-[var(--bg)]">
        <div className="content-container" data-testid="cart-container">
          {cart?.items?.length ? (
            <div>
              <div className="flex flex-col py-6 gap-y-6">
                <div className="pb-3 flex items-center">
                  <Heading className="text-zinc-950 dark:text-zinc-50">
                    Você tem {totalItems} item(s) no carrinho
                  </Heading>
                </div>
                <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-2">
                  <div className="flex flex-col gap-y-2">
                    {!customer && <SignInPrompt />}
                    {cart?.approvals && cart.approvals.length > 0 && (
                      <ApprovalStatusBanner cart={cart} />
                    )}
                    <ItemsTemplate cart={cart} />
                  </div>
                  <div className="relative">
                    <div className="flex flex-col gap-y-8 sticky top-20">
                      {cart && cart.region && (
                        <Summary
                          customer={customer}
                          spendLimitExceeded={spendLimitExceeded}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <EmptyCartSolarUpsell countryCode="br" />
              <div className="mt-6">
                <EmptyCartMessage />
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundaryResilient>
  )
}

export default CartTemplate
