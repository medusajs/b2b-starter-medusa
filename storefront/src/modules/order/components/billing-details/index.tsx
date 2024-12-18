import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

type BillingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const BillingDetails = ({ order }: BillingDetailsProps) => {
  return (
    !!order.billing_address && (
      <>
        <Heading level="h3" className="mb-2">
          Billing Address
        </Heading>

        {!!order.billing_address && (
          <div>
            <Text className="txt-medium text-ui-fg-subtle capitalize">
              {order.billing_address?.company}
            </Text>
            <Text className="txt-medium text-ui-fg-subtle capitalize">
              {order.billing_address?.first_name}{" "}
              {order.billing_address?.last_name}
            </Text>
            <Text className="txt-medium text-ui-fg-subtle capitalize">
              {order.billing_address?.phone}
            </Text>
            <Text className="txt-medium text-ui-fg-subtle">
              {order.billing_address?.address_1}{" "}
              {order.billing_address?.address_2}
            </Text>
            <Text className="txt-medium text-ui-fg-subtle">
              {order.billing_address?.postal_code},{" "}
              {order.billing_address?.city},{" "}
              {order.billing_address?.province},{" "}
              {order.billing_address?.country_code?.toUpperCase()}
            </Text>
          </div>
        )}
      </>
    )
  )
}

export default BillingDetails
