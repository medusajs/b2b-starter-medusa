import { Heading } from "@medusajs/ui"
import CheckoutTotals from "@/modules/checkout/components/checkout-totals"
import Help from "@/modules/order/components/help"
import Items from "@/modules/order/components/items"
import OrderDetails from "@/modules/order/components/order-details"
import PaymentDetails from "@/modules/order/components/payment-details"
import ShippingDetails from "@/modules/order/components/shipping-details"
import { B2BOrder } from "types/global"

type OrderCompletedTemplateProps = {
  order: B2BOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>Thank you!</span>
            <span>Your order was placed successfully.</span>
          </Heading>
          <OrderDetails order={order} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            Summary
          </Heading>
          <Items items={order.items} order={order} />
          <CheckoutTotals cartOrOrder={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
