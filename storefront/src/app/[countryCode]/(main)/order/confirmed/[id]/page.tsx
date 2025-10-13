import { retrieveOrder } from "@/lib/data/orders"
import OrderCompletedTemplate from "@/modules/order/templates/order-completed-template"
import { B2BOrder } from "@/types/global"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Pedido confirmado - Yello Solar Hub",
  description: "Seu pedido foi confirmado com sucesso",
}

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order || !('company' in order && order.company)) {
    return notFound()
  }

  return <OrderCompletedTemplate order={order as B2BOrder} />
}
