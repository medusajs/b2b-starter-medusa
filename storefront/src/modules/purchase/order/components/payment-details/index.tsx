import { Container, Heading, Text } from "@medusajs/ui"

import { paymentInfoMap } from "@/lib/constants"
import Divider from "@/modules/common/components/divider"
import { convertToLocale } from "@/lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0].payments?.[0]

  const paymentDate = payment?.created_at
    ? new Date(payment.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : ''

  return (
    <div>
      <Heading level="h2" className="flex items-center gap-2 text-3xl-regular my-6">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Pagamento Confirmado
      </Heading>
      <div>
        {payment && (
          <div className="flex flex-col gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-x-4 w-full">
              <div className="flex flex-col flex-1">
                <Text className="txt-medium-plus text-green-900 mb-1 font-semibold">
                  Método de Pagamento
                </Text>
                <Text
                  className="txt-medium text-green-700"
                  data-testid="payment-method"
                >
                  {paymentInfoMap[payment.provider_id].title}
                </Text>
              </div>
              <div className="flex flex-col flex-1">
                <Text className="txt-medium-plus text-green-900 mb-1 font-semibold">
                  Detalhes do Pagamento
                </Text>
                <div className="flex gap-2 txt-medium text-green-700 items-center">
                  <Container className="flex items-center h-7 w-fit p-2 bg-white border border-green-300 rounded">
                    {paymentInfoMap[payment.provider_id].icon}
                  </Container>
                  <div className="flex flex-col">
                    <Text data-testid="payment-amount" className="font-semibold text-green-900">
                      {convertToLocale({
                        amount: payment.amount,
                        currency_code: order.currency_code,
                      })}
                    </Text>
                    <Text className="text-xs text-green-600">
                      Pago em {paymentDate}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
