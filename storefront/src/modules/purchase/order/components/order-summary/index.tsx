import { convertToLocale } from "@/lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const getAmount = (amount?: number | null) => {
    if (!amount) {
      return
    }

    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  return (
    <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
      <h2 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Resumo Financeiro
      </h2>
      <div className="text-sm text-neutral-700 space-y-2">
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between py-2 border-b border-neutral-200">
            <span className="text-neutral-600">Subtotal dos Produtos</span>
            <span className="font-medium text-neutral-900">{getAmount(order.subtotal)}</span>
          </div>

          {order.discount_total > 0 && (
            <div className="flex items-center justify-between py-2 border-b border-neutral-200">
              <span className="text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Desconto Aplicado
              </span>
              <span className="font-medium text-green-600">- {getAmount(order.discount_total)}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-2 border-b border-neutral-200">
            <span className="text-neutral-600">Frete</span>
            <span className="font-medium text-neutral-900">{getAmount(order.shipping_total)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-neutral-200">
            <span className="text-neutral-600">Impostos</span>
            <span className="font-medium text-neutral-900">{getAmount(order.tax_total)}</span>
          </div>
        </div>
        <div className="h-px w-full border-b-2 border-amber-600 my-3" />
        <div className="flex items-center justify-between text-lg font-bold text-neutral-900 bg-amber-50 p-3 rounded -mx-4">
          <span>Total do Pedido</span>
          <span className="text-amber-600">{getAmount(order.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
