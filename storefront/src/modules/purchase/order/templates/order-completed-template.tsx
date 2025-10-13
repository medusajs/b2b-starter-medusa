import { Heading } from "@medusajs/ui"
import CheckoutTotals from "@/modules/checkout/components/checkout-totals"
import Help from "@/modules/order/components/help"
import Items from "@/modules/order/components/items"
import OrderDetails from "@/modules/order/components/order-details"
import PaymentDetails from "@/modules/order/components/payment-details"
import ShippingDetails from "@/modules/order/components/shipping-details"
import { B2BOrder } from "@/types/global"

type OrderCompletedTemplateProps = {
  order: B2BOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  return (
    <div className="py-6 min-h-[calc(100vh-64px)] bg-gradient-to-b from-amber-50 to-white">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div
          className="flex flex-col gap-6 max-w-4xl h-full bg-white w-full py-10 px-6 rounded-lg shadow-lg border border-amber-100"
          data-testid="order-complete-container"
        >
          {/* Success Header */}
          <div className="text-center pb-6 border-b border-amber-200">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <Heading
              level="h1"
              className="flex flex-col gap-y-2 text-neutral-900 text-3xl mb-3"
            >
              <span className="text-4xl font-bold">🎉 Pedido Confirmado!</span>
              <span className="text-xl font-normal text-neutral-600">Seu investimento em energia solar foi realizado com sucesso.</span>
            </Heading>
            <p className="text-sm text-neutral-600 max-w-2xl mx-auto">
              ⚡ Em breve você estará gerando sua própria energia limpa e renovável. Nossa equipe está preparando seu pedido para envio.
            </p>
          </div>

          <OrderDetails order={order} />

          <div className="mt-4">
            <Heading level="h2" className="flex items-center gap-2 text-2xl font-semibold text-neutral-900 mb-4">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Resumo do Pedido
            </Heading>
            <Items items={order.items} order={order} />
          </div>

          <CheckoutTotals cartOrOrder={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />

          {/* Next Steps */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Próximos Passos
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
              <li>Você receberá um e-mail com o código de rastreamento em até 24h úteis</li>
              <li>Nossa equipe técnica entrará em contato para agendar a instalação (se aplicável)</li>
              <li>Documentação técnica e manuais serão enviados por e-mail</li>
              <li>Acompanhe o status do pedido em sua conta</li>
            </ol>
          </div>

          <Help />
        </div>
      </div>
    </div>
  )
}
