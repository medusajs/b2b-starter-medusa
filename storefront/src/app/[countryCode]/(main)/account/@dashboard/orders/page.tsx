import { Metadata } from "next"

import { listOrders } from "@lib/data/orders"
import { Heading } from "@medusajs/ui"
import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-4">
        <Heading>Orders</Heading>
      </div>
      <div>
        <OrderOverview orders={orders} />
      </div>
    </div>
  )
}
