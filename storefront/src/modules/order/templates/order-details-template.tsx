import { ArrowUturnLeft } from "@medusajs/icons"
import React from "react"

import { HttpTypes } from "@medusajs/types"
import { Container, Table } from "@medusajs/ui"
import Button from "@/modules/common/components/button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Item from "@/modules/order/components/item"
import OrderDetails from "@/modules/order/components/order-details"
import OrderSummary from "@/modules/order/components/order-summary"
import ShippingDetails from "@/modules/order/components/shipping-details"
import BillingDetails from "@/modules/order/components/billing-details"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-2">
      <div className="flex gap-2 justify-between items-center mb-2">
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <Button variant="secondary">
            <ArrowUturnLeft /> Back
          </Button>
        </LocalizedClientLink>
      </div>

      <div className="small:grid small:grid-cols-6 gap-4 flex flex-col-reverse">
        <div className="small:col-span-4 flex flex-col gap-y-2">
          <Container>
            <Table>
              <Table.Body>
                {order.items?.map((item) => (
                  <Item key={item.id} item={item} order={order} />
                ))}
              </Table.Body>
            </Table>
          </Container>

          <Container>
            <OrderSummary order={order} />
          </Container>
        </div>

        <div className="small:col-span-2 flex flex-col gap-y-2">
          <Container>
            <OrderDetails order={order} />
          </Container>

          {(!!order.shipping_address || !!order.shipping_methods?.length) && (
            <Container>
              <ShippingDetails order={order} />
            </Container>
          )}
          {!!order.billing_address && (
            <Container>
              <BillingDetails order={order} />
            </Container>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
