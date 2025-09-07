"use client"

import { ArrowUturnLeft, ShoppingBag } from "@medusajs/icons"
import React, { useState } from "react"

import { HttpTypes } from "@medusajs/types"
import { Container, Table } from "@medusajs/ui"
import Button from "@/modules/common/components/button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Item from "@/modules/order/components/item"
import OrderDetails from "@/modules/order/components/order-details"
import OrderSummary from "@/modules/order/components/order-summary"
import ShippingDetails from "@/modules/order/components/shipping-details"
import BillingDetails from "@/modules/order/components/billing-details"
import { addToCartEventBus } from "@/lib/data/cart-event-bus"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  const [isAddingAll, setIsAddingAll] = useState(false)

  const handleAddAllToCart = async () => {
    if (!order.items || order.items.length === 0) return

    setIsAddingAll(true)
    
    try {
      const lineItems = order.items
        .filter(item => item.variant && item.product)
        .map(item => ({
          productVariant: {
            ...item.variant!,
            product: item.product!,
          },
          quantity: item.quantity,
        }))

      if (lineItems.length > 0) {
        addToCartEventBus.emitCartAdd({
          lineItems,
          regionId: order.region_id || "",
        })
      }
    } catch (error) {
      console.error("Error adding all items to cart:", error)
    } finally {
      setIsAddingAll(false)
    }
  }

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
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <Container>
            <Table>
              <Table.Body>
                {order.items?.map((item) => (
                  <Item key={item.id} item={item} order={order} />
                ))}
              </Table.Body>
            </Table>
          </Container>

          {/* Add All to Cart Button */}
          {order.items && order.items.length > 0 && (
            <div className="flex justify-center p-4">
              <Button
                variant="primary"
                onClick={handleAddAllToCart}
                disabled={isAddingAll}
                isLoading={isAddingAll}
                className="flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add All to Cart
              </Button>
            </div>
          )}

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
