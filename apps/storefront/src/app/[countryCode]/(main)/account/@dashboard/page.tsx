import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { getCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate({
  params,
}: {
  params: { countryCode: string }
}) {
  const countryCode = params.countryCode
  const customer = await getCustomer().catch(() => null)
  const orders = await listOrders().catch(() => null)
  const region = await getRegion(countryCode).catch(() => null)

  if (!customer) {
    notFound()
  }

  return <Overview customer={customer} orders={orders} region={region} />
}
