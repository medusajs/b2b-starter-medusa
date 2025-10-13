import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  const createdAt = new Date(order.created_at)

  // Formato brasileiro: DD/MM/AAAA HH:MM
  const formattedDate = createdAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <>
      <Heading level="h3" className="mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Detalhes do Pedido
      </Heading>

      <div className="text-sm text-ui-fg-subtle overflow-auto space-y-2">
        <div className="flex justify-between items-center p-2 bg-neutral-50 rounded">
          <Text className="text-neutral-600">Número do Pedido</Text>
          <Text className="font-mono font-semibold text-neutral-900">#{order.display_id}</Text>
        </div>

        <div className="flex justify-between items-center p-2 bg-neutral-50 rounded">
          <Text className="text-neutral-600">Data do Pedido</Text>
          <Text className="font-medium text-neutral-900">
            {formattedDate}
          </Text>
        </div>

        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <Text className="text-sm text-blue-900">
              Enviamos a confirmação e documentação técnica para{" "}
              <span className="font-semibold">{order.email}</span>
            </Text>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderDetails
