"use client"

import { ArrowUturnLeft, ShoppingBag } from "@medusajs/icons"
import React, { useState, useEffect } from "react"

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

          {/* Fulfillment Sections */}
          {order.fulfillments && order.fulfillments.length > 0 && (
            <div className="flex flex-col gap-y-4">
              {order.fulfillments.map((fulfillment, index) => (
                  <Container key={fulfillment.id}>
                    <h3 className="text-lg font-semibold mb-4">
                      Fulfillment #{index + 1}
                    </h3>
                    <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Product</Table.HeaderCell>
                        <Table.HeaderCell>SKU</Table.HeaderCell>
                        <Table.HeaderCell>Quantity</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {fulfillment.items && fulfillment.items.length > 0 ? (
                        fulfillment.items.map((fulfillmentItem) => {
                          // Find the corresponding order item
                          const orderItem = order.items?.find((item) => 
                            item.id === fulfillmentItem.item_id || 
                            item.id === fulfillmentItem.line_item_id
                          );
                          
                          return (
                            <Table.Row key={fulfillmentItem.id} className="py-4">
                              <Table.Cell>
                                <div className="flex items-center gap-3">
                                  {orderItem?.thumbnail && (
                                    <img
                                      src={orderItem.thumbnail}
                                      alt={orderItem.title}
                                      className="w-12 h-12 object-contain rounded"
                                    />
                                  )}
                                  <span className="font-medium">
                                    {orderItem?.title || 
                                     orderItem?.product_title || 
                                     'Unknown Product'}
                                  </span>
                                </div>
                              </Table.Cell>
                              <Table.Cell>
                                <span className="text-sm text-gray-500">
                                  {orderItem?.variant?.sku || 
                                   orderItem?.variant_sku || 
                                   'N/A'}
                                </span>
                              </Table.Cell>
                              <Table.Cell>
                                <span className="font-medium">{fulfillmentItem.quantity}</span>
                              </Table.Cell>
                            </Table.Row>
                          );
                        })
                      ) : (
                        <Table.Row>
                          <Table.Cell colSpan={3} className="text-center text-gray-500 py-4">
                            No items in this fulfillment
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table>
                </Container>
              ))}
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
