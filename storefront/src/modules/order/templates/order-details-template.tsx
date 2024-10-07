"use client"

import { XMark } from "@medusajs/icons"
import React from "react"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Order details</h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <XMark /> Back to overview
        </LocalizedClientLink>
      </div>

      <Container>
        <OrderDetails order={order} showStatus />
      </Container>

      <Container>
        <Items items={order.items} />
      </Container>

      <Container>
        <ShippingDetails order={order} />
      </Container>

      <Container>
        <OrderSummary order={order} />
      </Container>
    </div>
  )
}

export default OrderDetailsTemplate
