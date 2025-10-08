import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

type BillingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const BillingDetails = ({ order }: BillingDetailsProps) => {
  return (
    !!order.billing_address && (
      <>
        <Heading level="h3" className="mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Endereço de Cobrança
        </Heading>

        {!!order.billing_address && (
          <div className="space-y-1.5 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            {order.billing_address?.company && (
              <Text className="txt-medium text-neutral-900 font-semibold">
                {order.billing_address.company}
              </Text>
            )}
            <Text className="txt-medium text-neutral-700 capitalize">
              {order.billing_address?.first_name}{" "}
              {order.billing_address?.last_name}
            </Text>
            {order.billing_address?.phone && (
              <Text className="txt-medium text-neutral-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {order.billing_address.phone}
              </Text>
            )}
            <div className="border-t border-neutral-200 pt-2 mt-2">
              <Text className="txt-medium text-neutral-700">
                {order.billing_address?.address_1}
                {order.billing_address?.address_2 && `, ${order.billing_address.address_2}`}
              </Text>
              <Text className="txt-medium text-neutral-600">
                CEP {order.billing_address?.postal_code} - {order.billing_address?.city}/{order.billing_address?.province}
              </Text>
              <Text className="txt-medium text-neutral-600">
                {order.billing_address?.country_code?.toUpperCase() === 'BR' ? 'Brasil' : order.billing_address?.country_code?.toUpperCase()}
              </Text>
            </div>
          </div>
        )}
      </>
    )
  )
}

export default BillingDetails
