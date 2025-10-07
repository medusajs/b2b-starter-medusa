"use client"

import { Text } from "@medusajs/ui"

import { checkSpendingLimit } from "@/lib/util/check-spending-limit"
import PaymentButton from "@/modules/checkout/components/payment-button"
import Button from "@/modules/common/components/button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { B2BCart, B2BCustomer } from "@/types"
import { ExclamationCircle } from "@medusajs/icons"

const Review = ({
  cart,
  customer,
}: {
  cart: B2BCart
  customer: B2BCustomer | null
}) => {
  const spendLimitExceeded = customer
    ? checkSpendingLimit(cart, customer)
    : false

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-start gap-x-1 w-full">
        <Text className="txt-xsmall text-neutral-500 mb-1">
          Ao concluir este pedido, concordo com os {" "}
          <LocalizedClientLink
            href="/terms-of-sale"
            className="hover:text-neutral-800"
            target="_blank"
          >
            Termos de Venda ↗
          </LocalizedClientLink>{" "}
          e {" "}
          <LocalizedClientLink
            href="/privacy-policy"
            className="hover:text-neutral-800"
            target="_blank"
          >
            Política de Privacidade ↗
          </LocalizedClientLink>
        </Text>
      </div>
      {spendLimitExceeded ? (
        <>
          <div className="flex items-center gap-x-2 bg-neutral-100 p-3 rounded-md shadow-borders-base">
            <ExclamationCircle className="text-orange-500 w-fit overflow-visible" />
            <p className="text-neutral-950 text-xs">
              Este pedido excede seu limite de gastos.
              <br />
              Entre em contato com seu gerente para aprovação.
            </p>
          </div>
          <Button className="w-full h-10 rounded-full shadow-none" disabled>
            Finalizar pedido
          </Button>
        </>
      ) : (
        <PaymentButton cart={cart} data-testid="submit-order-button" />
      )}
    </div>
  )
}

export default Review
