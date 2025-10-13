import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  // order.shipping_address = {
  //   first_name: "Riqwan",
  //   last_name: "Thamir",
  //   address_1: "11c heidestrasse",
  //   address_2: "Berlin - 10557",
  //   country_code: "DE",
  //   postal_code: "10557",
  //   city: "Berlin",
  //   company: "MedusaJS Aps",
  // }
  // order.billing_address = {
  //   first_name: "Riqwan",
  //   last_name: "Thamir",
  //   address_1: "11c heidestrasse",
  //   address_2: "Berlin - 10557",
  //   country_code: "DE",
  //   postal_code: "10557",
  //   city: "Berlin",
  // }
  // order.shipping_methods = [
  //   {
  //     name: "Webshiper",
  //     total: 1055,
  //   },
  // ]
  return (
    !!order.shipping_address && (
      <>
        <Heading level="h3" className="mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Endereço de Entrega
        </Heading>

        {!!order.shipping_address && (
          <div className="space-y-1.5 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            {order.shipping_address?.company && (
              <Text className="txt-medium text-neutral-900 font-semibold">
                {order.shipping_address.company}
              </Text>
            )}
            <Text className="txt-medium text-neutral-700 capitalize">
              {order.shipping_address?.first_name}{" "}
              {order.shipping_address?.last_name}
            </Text>
            {order.shipping_address?.phone && (
              <Text className="txt-medium text-neutral-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {order.shipping_address.phone}
              </Text>
            )}
            <div className="border-t border-neutral-200 pt-2 mt-2">
              <Text className="txt-medium text-neutral-700">
                {order.shipping_address?.address_1}
                {order.shipping_address?.address_2 && `, ${order.shipping_address.address_2}`}
              </Text>
              <Text className="txt-medium text-neutral-600">
                CEP {order.shipping_address?.postal_code} - {order.shipping_address?.city}/{order.shipping_address?.province}
              </Text>
              <Text className="txt-medium text-neutral-600">
                {order.shipping_address?.country_code?.toUpperCase() === 'BR' ? 'Brasil' : order.shipping_address?.country_code?.toUpperCase()}
              </Text>
            </div>
          </div>
        )}
      </>
    )
  )
}

export default ShippingDetails
